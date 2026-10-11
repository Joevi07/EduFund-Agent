import os
import sys
import unittest
from unittest.mock import patch


BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from agents.autopilot_agent import AutopilotAgent
from agents.eligibility_agent import EligibilityAgent
from agents.planner_agent import PlannerAgent
from models import DocumentAuditRequest, EligibilityCheck, Opportunity, OpportunityEligibility, StudentProfile


def eligibility_result(opportunity, match_score):
    return OpportunityEligibility(
        opportunity_id=opportunity.id,
        title=opportunity.title,
        category=opportunity.category,
        amount_inr=opportunity.amount_inr,
        amount_usd=opportunity.amount_usd,
        match_score=match_score,
        rating="HIGH" if match_score >= 80 else "MEDIUM",
        checks=[EligibilityCheck(criterion="Education Level", status="PASS", detail="Test match")],
        key_reasoning="Test eligibility reasoning",
    )


class ApplicationPriorityScoreTests(unittest.TestCase):
    def test_priority_score_uses_documented_weighted_formula(self):
        profile = StudentProfile(financial_constraints={
            "annual_family_income_inr": 450000,
            "target_annual_cost_inr": 120000,
            "confirmed_aid_inr": 20000,
            "currency": "INR",
        })
        opportunity = Opportunity(
            id="score_test",
            title="Score Test Scholarship",
            provider="Test Provider",
            category="Scholarship",
            amount_inr=50000,
            amount_usd=602,
            deadline="2026-10-20",
            days_left=10,
            degree_levels=["Undergraduate"],
            target_courses=["All Courses"],
            description="Test opportunity",
            required_documents=[],
            essay_prompts=[],
            website_url="https://example.com",
            urgency="HIGH",
        )
        planner = PlannerAgent()
        planner.eligibility_agent.evaluate_opportunity = lambda _profile, candidate: eligibility_result(candidate, 80)

        plan = planner.generate_plan(profile, [opportunity])
        item = plan.recommended_strategy[0]

        # 55% × 80 match + 25% × 50 funding relevance + 20% × 100 urgency = 76.5.
        self.assertEqual(item.match_score, 80)
        self.assertEqual(item.funding_relevance_score, 50.0)
        self.assertEqual(item.deadline_urgency_score, 100)
        self.assertEqual(item.application_priority_score, 76.5)
        self.assertEqual(item.amount_inr, 50000)
        self.assertEqual(plan.potential_coverage_inr, 50000)
        self.assertEqual(plan.eligibility_evaluations[0].checks[0].status, "PASS")
        self.assertNotIn("expected_value_inr", item.model_dump())
        self.assertNotIn("confidence", plan.model_dump())

    def test_deadline_urgency_bands(self):
        expected_scores = {
            -1: 0,
            0: 100,
            14: 100,
            15: 75,
            30: 75,
            31: 50,
            60: 50,
            61: 25,
        }
        for days_left, expected in expected_scores.items():
            with self.subTest(days_left=days_left):
                self.assertEqual(PlannerAgent._deadline_urgency_score(days_left), expected)

    def test_zero_funding_gap_is_safe_and_needs_no_recommendations(self):
        profile = StudentProfile(financial_constraints={
            "target_annual_cost_inr": 100000,
            "confirmed_aid_inr": 100000,
            "currency": "INR",
        })
        opportunity = Opportunity(
            id="zero_gap_test",
            title="Zero Gap Test Scholarship",
            provider="Test Provider",
            category="Scholarship",
            amount_inr=50000,
            amount_usd=602,
            deadline="2026-10-20",
            days_left=10,
            degree_levels=["Undergraduate"],
            target_courses=["All Courses"],
            description="Test opportunity",
            required_documents=[],
            essay_prompts=[],
            website_url="https://example.com",
            urgency="HIGH",
        )
        planner = PlannerAgent()
        planner.eligibility_agent.evaluate_opportunity = lambda _profile, candidate: eligibility_result(candidate, 90)

        plan = planner.generate_plan(profile, [opportunity])

        self.assertEqual(plan.funding_gap_inr, 0)
        self.assertEqual(plan.potential_coverage_inr, 0)
        self.assertEqual(plan.remaining_gap_inr, 0)
        self.assertEqual(plan.coverage_percentage, 100)
        self.assertEqual(plan.recommended_strategy, [])
        self.assertIn("no remaining funding gap", plan.agent_advice)

    def test_expired_opportunity_is_not_recommended(self):
        profile = StudentProfile(financial_constraints={
            "target_annual_cost_inr": 100000,
            "confirmed_aid_inr": 0,
            "currency": "INR",
        })
        opportunity = Opportunity(
            id="expired_test",
            title="Expired Test Scholarship",
            provider="Test Provider",
            category="Scholarship",
            amount_inr=100000,
            amount_usd=1205,
            deadline="2026-10-01",
            days_left=-1,
            degree_levels=["Undergraduate"],
            target_courses=["All Courses"],
            description="Expired test opportunity",
            required_documents=[],
            essay_prompts=[],
            website_url="https://example.com",
            urgency="HIGH",
        )
        planner = PlannerAgent()
        planner.eligibility_agent.evaluate_opportunity = lambda _profile, candidate: eligibility_result(candidate, 100)

        plan = planner.generate_plan(profile, [opportunity])

        self.assertEqual(plan.recommended_strategy, [])
        self.assertEqual(plan.potential_coverage_inr, 0)


class EligibilityExplainabilityTests(unittest.TestCase):
    def opportunity(self, **overrides):
        values = {
            "id": "explain_test",
            "title": "Explainability Test Scholarship",
            "provider": "Test Provider",
            "category": "Scholarship",
            "amount_inr": 50000,
            "amount_usd": 602,
            "deadline": "2026-10-20",
            "days_left": 10,
            "degree_levels": ["Undergraduate"],
            "target_courses": ["All Courses"],
            "description": "Test opportunity",
            "required_documents": [],
            "essay_prompts": [],
            "website_url": "https://example.com",
            "urgency": "HIGH",
        }
        values.update(overrides)
        return Opportunity(**values)

    def test_unlisted_provider_criteria_are_unavailable_not_passed(self):
        result = EligibilityAgent().evaluate_opportunity(StudentProfile(), self.opportunity())
        checks = {check.criterion: check for check in result.checks}

        self.assertEqual(checks["Academic Requirement"].status, "UNAVAILABLE")
        self.assertEqual(checks["Financial Eligibility"].status, "UNAVAILABLE")
        self.assertEqual(checks["Location & Residency"].status, "UNAVAILABLE")
        self.assertIn("does not list", checks["Academic Requirement"].detail)

    def test_missing_profile_value_is_unavailable_not_an_accidental_pass(self):
        profile = StudentProfile(financial_constraints={
            "annual_family_income_inr": 0,
            "target_annual_cost_inr": 100000,
            "confirmed_aid_inr": 0,
            "currency": "INR",
        })
        result = EligibilityAgent().evaluate_opportunity(
            profile,
            self.opportunity(max_family_income_inr=500000),
        )
        income_check = next(check for check in result.checks if check.criterion == "Financial Eligibility")

        self.assertEqual(income_check.status, "UNAVAILABLE")
        self.assertIn("Add annual family income", income_check.detail)
        self.assertEqual(result.match_score, 70)


class DocumentReadinessTests(unittest.TestCase):
    def test_missing_document_requirements_are_unavailable_not_complete(self):
        opportunity = Opportunity(
            id="unknown_documents",
            title="Unknown Requirements Scholarship",
            provider="Test Provider",
            category="Scholarship",
            amount_inr=10000,
            amount_usd=120,
            deadline="2026-10-20",
            days_left=10,
            degree_levels=["Undergraduate"],
            target_courses=["All Courses"],
            description="Test opportunity",
            required_documents=[],
            essay_prompts=[],
            website_url="https://example.com",
            urgency="HIGH",
        )
        with patch("agents.autopilot_agent.get_opportunity_by_id", return_value=opportunity):
            result = AutopilotAgent().audit_documents(DocumentAuditRequest(
                opportunity_id=opportunity.id,
                uploaded_files=[],
            ))

        self.assertEqual(result.readiness_status, "UNAVAILABLE")
        self.assertIsNone(result.completion_percentage)
        self.assertIn("not listed", result.readiness_notes)
        self.assertNotIn("authenticity", result.readiness_notes.lower())

    def test_readiness_percentage_is_checklist_completion_not_confidence(self):
        result = AutopilotAgent().audit_documents(DocumentAuditRequest(
            opportunity_id="opp_002",
            uploaded_files=[
                "income_certificate.pdf",
                "admission-letter.png",
                "tuition_fee_receipt.jpg",
            ],
        ))
        data = result.model_dump()

        self.assertEqual(result.readiness_status, "INCOMPLETE")
        self.assertEqual(result.matched_count, 3)
        self.assertEqual(result.required_count, 4)
        self.assertEqual(result.completion_percentage, 75)
        self.assertEqual({item["status"] for item in result.matched_files}, {"CHECKLIST_MATCH"})
        self.assertNotIn("verification_status", data)
        self.assertNotIn("confidence", str(data).lower())
        self.assertIn("authenticity were not verified", result.readiness_notes)


if __name__ == "__main__":
    unittest.main()
