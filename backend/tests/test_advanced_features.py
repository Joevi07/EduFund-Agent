import pytest
from models import StudentProfile, Opportunity, StrategyItem
from agents.eligibility_agent import EligibilityAgent
from agents.planner_agent import PlannerAgent
from agents.profile_agent import ProfileAgent
from data.opportunities import get_all_opportunities


def test_explainability_card_generation():
    eligibility_agent = EligibilityAgent()
    profile = StudentProfile(
        id="test_stu_01",
        name="Aarav Sharma",
        education_level="Undergraduate",
        course="Computer Science & AI",
        academic_profile={"gpa": 8.5, "max_gpa": 10.0, "standardized_test": "JEE 98", "year_of_study": "2nd Year"},
        location={"country": "India", "state": "Karnataka", "city": "Bengaluru"},
        financial_constraints={
            "target_annual_cost_inr": 150000,
            "confirmed_aid_inr": 50000,
            "annual_family_income_inr": 400000,
        },
        achievements=["Hackathon winner"],
        interests=["AI", "Open Source"],
    )

    opp = Opportunity(
        id="opp_test_1",
        title="Merit-cum-Means Technical Scholarship",
        provider="MoE India",
        category="Scholarship",
        amount_inr=50000,
        amount_usd=602,
        deadline="2026-10-31",
        days_left=30,
        degree_levels=["Undergraduate"],
        target_courses=["Computer Science & AI"],
        max_family_income_inr=600000,
        location_restrictions=["India"],
        description="Merit need scholarship",
        required_documents=["Income Certificate", "Marksheet"],
        essay_prompts=["Why you need this scholarship"],
        website_url="https://scholarships.gov.in",
    )

    result = eligibility_agent.evaluate_opportunity(profile, opp)
    assert result.match_score >= 80
    assert "explainability" in result.model_dump()
    explain = result.explainability
    assert "why_matched" in explain
    assert "Matched because" in explain["why_matched"]
    assert len(explain["profile_facts_helped"]) >= 2
    assert len(explain["readiness_actions"]) >= 1


def test_funding_gap_rescue_plan():
    planner = PlannerAgent()
    funding_gap = 100000.0  # 1 Lakh INR gap
    potential_scholarship_coverage = 40000.0

    rescue_plan = planner.build_funding_gap_rescue_plan(
        funding_gap_inr=funding_gap,
        potential_coverage_inr=potential_scholarship_coverage,
        usd_rate=83.0
    )

    assert rescue_plan.funding_gap_inr == 100000.0
    assert rescue_plan.scholarship_coverage_inr == 40000.0
    assert rescue_plan.fee_waiver_coverage_inr > 0
    assert rescue_plan.work_study_coverage_inr > 0
    assert rescue_plan.loan_coverage_inr > 0
    assert rescue_plan.remaining_gap_after_plan_inr == 0.0
    assert len(rescue_plan.components) == 4
    assert any("Tuition Fee Waiver" in c.title for c in rescue_plan.components)
    assert any("Work-Study" in c.layer for c in rescue_plan.components)
    assert any("Loan" in c.layer for c in rescue_plan.components)


def test_portfolio_diversity_guardrail():
    planner = PlannerAgent()
    all_opps = get_all_opportunities()

    # Simulate single-source, single-country, scholarship-only strategy
    skewed_strategy = [
        StrategyItem(
            opportunity_id="opp_001",
            title="PM-USP Central Sector",
            category="Scholarship",
            amount_inr=12000,
            amount_usd=145,
            match_score=90,
            funding_relevance_score=30,
            deadline_urgency_score=100,
            application_priority_score=75,
            priority_rank=1,
            urgency="HIGH",
        ),
        StrategyItem(
            opportunity_id="opp_002",
            title="AICTE Pragati",
            category="Scholarship",
            amount_inr=50000,
            amount_usd=602,
            match_score=85,
            funding_relevance_score=60,
            deadline_urgency_score=75,
            application_priority_score=70,
            priority_rank=2,
            urgency="MEDIUM",
        ),
    ]

    guardrail = planner.evaluate_portfolio_diversity(skewed_strategy, all_opps)
    assert guardrail.concentration_score > 50
    assert len(guardrail.warnings) > 0
    assert any("scholarship" in w.lower() for w in guardrail.warnings)
    assert len(guardrail.recommendations) > 0


def test_profile_completion_coach():
    profile_agent = ProfileAgent()
    sparse_profile = StudentProfile(
        id="sparse_01",
        name="Maya Patel",
        education_level="Undergraduate",
        course="",
        academic_profile={},
        location={"country": "India"},
        financial_constraints={"target_annual_cost_inr": 100000},
        achievements=[],
        interests=[],
    )

    coach = profile_agent.coach_profile(sparse_profile)
    assert coach.completion_percentage < 50
    assert len(coach.missing_fields) > 3
    assert "Course / Field" in [m["field"] for m in coach.missing_fields]
    assert "+60%" in coach.estimated_improvement or "+35%" in coach.estimated_improvement


def test_opportunity_freshness_and_safety_metadata():
    opps = get_all_opportunities()
    assert len(opps) > 0
    for opp in opps:
        assert hasattr(opp, "last_reviewed_date")
        assert opp.last_reviewed_date is not None
        assert opp.source_verified is True
        assert opp.requires_application_fee is False
        assert opp.safety_audit.get("status") == "VERIFIED_SAFE"
        assert opp.safety_audit.get("zero_application_fee") is True
