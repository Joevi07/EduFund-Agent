import os
import sys
import tempfile
import unittest


BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

import database


class ApplicationIsolationTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_db_file = database.DB_FILE
        database.DB_FILE = os.path.join(self.temp_dir.name, "test.db")
        database.init_db()
        self.user_a = database.create_user("User A", "a@example.com", "password-a")
        self.user_b = database.create_user("User B", "b@example.com", "password-b")

    def tearDown(self):
        database.DB_FILE = self.original_db_file
        self.temp_dir.cleanup()

    def test_users_track_the_same_opportunity_independently(self):
        opportunity_id = "opp_001"

        database.upsert_application(
            self.user_a["id"], opportunity_id, "DRAFTING", draft_text="User A draft"
        )
        database.upsert_application(
            self.user_b["id"], opportunity_id, "SUBMITTED", draft_text="User B draft"
        )

        user_a_applications = database.list_applications(self.user_a["id"])
        user_b_applications = database.list_applications(self.user_b["id"])

        self.assertEqual(len(user_a_applications), 1)
        self.assertEqual(user_a_applications[0]["status"], "DRAFTING")
        self.assertEqual(user_a_applications[0]["draft_text"], "User A draft")
        self.assertEqual(len(user_b_applications), 1)
        self.assertEqual(user_b_applications[0]["status"], "SUBMITTED")
        self.assertEqual(user_b_applications[0]["draft_text"], "User B draft")

        database.upsert_application(self.user_a["id"], opportunity_id, "READY_TO_SUBMIT")

        self.assertEqual(database.list_applications(self.user_a["id"])[0]["status"], "READY_TO_SUBMIT")
        self.assertEqual(database.list_applications(self.user_b["id"])[0]["status"], "SUBMITTED")

    def test_authenticated_handlers_scope_get_and_put_to_each_user(self):
        import main as api
        from models import ApplicationStatusUpdate

        token_a = database.create_session(self.user_a["id"])
        token_b = database.create_session(self.user_b["id"])
        authorization_a = f"Bearer {token_a}"
        authorization_b = f"Bearer {token_b}"

        api.update_application(
            "opp_001",
            ApplicationStatusUpdate(status="PLANNED", notes="User A note"),
            authorization_a,
        )
        api.update_application(
            "opp_001",
            ApplicationStatusUpdate(status="SUBMITTED", notes="User B note"),
            authorization_b,
        )

        user_a_applications = api.get_applications(authorization_a)
        user_b_applications = api.get_applications(authorization_b)

        self.assertEqual(
            [(record["status"], record["notes"]) for record in user_a_applications],
            [("PLANNED", "User A note")],
        )
        self.assertEqual(
            [(record["status"], record["notes"]) for record in user_b_applications],
            [("SUBMITTED", "User B note")],
        )

    def test_autopilot_draft_is_associated_with_authenticated_user(self):
        import main as api
        from models import AutopilotDraftRequest

        token_a = database.create_session(self.user_a["id"])
        api.prepare_autopilot_draft(
            AutopilotDraftRequest(opportunity_id="opp_001"),
            f"Bearer {token_a}",
        )

        user_a_applications = database.list_applications(self.user_a["id"])
        user_b_applications = database.list_applications(self.user_b["id"])

        self.assertEqual(len(user_a_applications), 1)
        self.assertEqual(user_a_applications[0]["opportunity_id"], "opp_001")
        self.assertEqual(user_a_applications[0]["status"], "DRAFTING")
        self.assertTrue(user_a_applications[0]["draft_text"])
        self.assertEqual(user_b_applications, [])

    def test_legacy_global_rows_are_archived_during_migration(self):
        conn = database.get_db_connection()
        conn.execute("DROP TABLE applications")
        conn.execute("""
            CREATE TABLE applications (
                opportunity_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                draft_text TEXT,
                notes TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute(
            "INSERT INTO applications (opportunity_id, status, draft_text, notes) VALUES (?, ?, ?, ?)",
            ("opp_legacy", "DRAFTING", "Preserve this draft", "Preserve this note"),
        )
        conn.commit()
        conn.close()

        database.init_db()

        conn = database.get_db_connection()
        archived = conn.execute(
            "SELECT opportunity_id, status, draft_text, notes FROM legacy_applications_archive"
        ).fetchone()
        columns = list(conn.execute("PRAGMA table_info(applications)"))
        conn.close()

        self.assertEqual(dict(archived), {
            "opportunity_id": "opp_legacy",
            "status": "DRAFTING",
            "draft_text": "Preserve this draft",
            "notes": "Preserve this note",
        })
        self.assertEqual(
            [row[1] for row in sorted(columns, key=lambda row: row[5]) if row[5]],
            ["user_id", "opportunity_id"],
        )
        self.assertEqual(database.list_applications(self.user_a["id"]), [])
        self.assertEqual(database.list_applications(self.user_b["id"]), [])


if __name__ == "__main__":
    unittest.main()
