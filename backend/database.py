import sqlite3
import json
import os
import hashlib
import secrets
import uuid
from typing import List, Dict, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), "edufund.db")

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes SQLite tables for opportunities, student profiles, and application statuses.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Opportunities Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS opportunities (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            provider TEXT NOT NULL,
            category TEXT NOT NULL,
            amount_inr REAL NOT NULL,
            amount_usd REAL NOT NULL,
            deadline TEXT NOT NULL,
            days_left INTEGER NOT NULL,
            degree_levels TEXT NOT NULL,
            target_courses TEXT NOT NULL,
            min_gpa REAL,
            max_family_income_inr REAL,
            location_restrictions TEXT,
            description TEXT NOT NULL,
            required_documents TEXT NOT NULL,
            essay_prompts TEXT NOT NULL,
            website_url TEXT NOT NULL,
            urgency TEXT NOT NULL
        )
    """)

    # Student Profiles Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            education_level TEXT NOT NULL,
            course TEXT NOT NULL,
            profile_json TEXT NOT NULL
        )
    """)

    # Applications Tracker Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            opportunity_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            draft_text TEXT,
            notes TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Older local databases may predate notes. This migration is safe to re-run.
    columns = {row[1] for row in cursor.execute("PRAGMA table_info(applications)")}
    if "notes" not in columns:
        cursor.execute("ALTER TABLE applications ADD COLUMN notes TEXT")

    cursor.execute("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'student', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    cursor.execute("CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")

    conn.commit()
    conn.close()

def _hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 210000).hex()
    return f"{salt}${digest}"

def _verify_password(password: str, encoded: str) -> bool:
    salt, _, stored = encoded.partition("$")
    return bool(stored) and secrets.compare_digest(_hash_password(password, salt), encoded)

def create_user(name: str, email: str, password: str, role: str = "student") -> Dict[str, Any]:
    conn = get_db_connection()
    user_id, normalized_email = f"usr_{uuid.uuid4().hex[:12]}", email.strip().lower()
    try:
        conn.execute("INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)", (user_id, name.strip(), normalized_email, _hash_password(password), role)); conn.commit()
    except sqlite3.IntegrityError:
        conn.close(); raise ValueError("An account already exists for this email address.")
    row = conn.execute("SELECT id, name, email, role, created_at FROM users WHERE id = ?", (user_id,)).fetchone(); conn.close()
    return dict(row)

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection(); row = conn.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone(); conn.close()
    if not row or not _verify_password(password, row["password_hash"]): return None
    return {key: row[key] for key in ("id", "name", "email", "role", "created_at")}

def create_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32); conn = get_db_connection()
    conn.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))", (token, user_id)); conn.commit(); conn.close(); return token

def get_session_user(token: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection(); row = conn.execute("SELECT u.id, u.name, u.email, u.role, u.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP", (token,)).fetchone(); conn.close()
    return dict(row) if row else None

def delete_session(token: str) -> None:
    conn = get_db_connection(); conn.execute("DELETE FROM sessions WHERE token = ?", (token,)); conn.commit(); conn.close()

def list_users() -> List[Dict[str, Any]]:
    conn = get_db_connection(); rows = conn.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").fetchall(); conn.close(); return [dict(row) for row in rows]

def bootstrap_admin() -> None:
    conn = get_db_connection(); count = conn.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'").fetchone()[0]; conn.close()
    if not count: create_user("EduFund Administrator", os.getenv("EDUFUND_ADMIN_EMAIL", "admin@edufund.local"), os.getenv("EDUFUND_ADMIN_PASSWORD", "Admin@123"), "admin")

def save_student_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    conn.execute("""INSERT INTO student_profiles (id, name, education_level, course, profile_json)
        VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,
        education_level=excluded.education_level, course=excluded.course, profile_json=excluded.profile_json""",
        (profile["id"], profile["name"], profile["education_level"], profile["course"], json.dumps(profile)))
    conn.commit(); conn.close(); return profile

def get_student_profile(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection(); row = conn.execute("SELECT profile_json FROM student_profiles WHERE id = ?", (user_id,)).fetchone(); conn.close()
    return json.loads(row["profile_json"]) if row else None

# Initialize DB on module import
init_db()

def list_applications() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT opportunity_id, status, draft_text, notes, updated_at FROM applications ORDER BY updated_at DESC").fetchall()
    conn.close()
    return [dict(row) for row in rows]

def upsert_application(opportunity_id: str, status: str, draft_text: Optional[str] = None, notes: Optional[str] = None) -> Dict[str, Any]:
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO applications (opportunity_id, status, draft_text, notes, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(opportunity_id) DO UPDATE SET
          status=excluded.status,
          draft_text=COALESCE(excluded.draft_text, applications.draft_text),
          notes=COALESCE(excluded.notes, applications.notes),
          updated_at=CURRENT_TIMESTAMP
    """, (opportunity_id, status, draft_text, notes))
    conn.commit()
    row = conn.execute("SELECT opportunity_id, status, draft_text, notes, updated_at FROM applications WHERE opportunity_id = ?", (opportunity_id,)).fetchone()
    conn.close()
    return dict(row)

def save_opportunity(opportunity: Dict[str, Any]) -> None:
    """Store a curated opportunity, serializing list fields for SQLite."""
    fields = ("degree_levels", "target_courses", "location_restrictions", "required_documents", "essay_prompts")
    item = dict(opportunity)
    for field in fields:
        item[field] = json.dumps(item.get(field, []))
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO opportunities VALUES (:id, :title, :provider, :category, :amount_inr, :amount_usd,
          :deadline, :days_left, :degree_levels, :target_courses, :min_gpa, :max_family_income_inr,
          :location_restrictions, :description, :required_documents, :essay_prompts, :website_url, :urgency)
        ON CONFLICT(id) DO UPDATE SET
          title=excluded.title, provider=excluded.provider, category=excluded.category,
          amount_inr=excluded.amount_inr, amount_usd=excluded.amount_usd, deadline=excluded.deadline,
          days_left=excluded.days_left, degree_levels=excluded.degree_levels, target_courses=excluded.target_courses,
          min_gpa=excluded.min_gpa, max_family_income_inr=excluded.max_family_income_inr,
          location_restrictions=excluded.location_restrictions, description=excluded.description,
          required_documents=excluded.required_documents, essay_prompts=excluded.essay_prompts,
          website_url=excluded.website_url, urgency=excluded.urgency
    """, item)
    conn.commit()
    conn.close()

def load_opportunities() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = [dict(row) for row in conn.execute("SELECT * FROM opportunities ORDER BY deadline")]
    conn.close()
    for row in rows:
        for field in ("degree_levels", "target_courses", "location_restrictions", "required_documents", "essay_prompts"):
            row[field] = json.loads(row[field])
    return rows
