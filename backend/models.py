from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class StudentProfile(BaseModel):
    id: str = "std_001"
    name: str = "Aarav Sharma"
    education_level: str = "Undergraduate"  # High School, Undergraduate, Master's, PhD
    course: str = "Computer Science & AI"
    academic_profile: Dict[str, Any] = {
        "gpa": 3.8,
        "max_gpa": 4.0,
        "standardized_test": "SAT 1480 / JEE Main 98.5th Percentile",
        "year_of_study": "2nd Year"
    }
    location: Dict[str, str] = {
        "country": "India",
        "state": "Karnataka",
        "city": "Bengaluru",
        "study_destination": "India / USA"
    }
    interests: List[str] = ["Artificial Intelligence", "Machine Learning", "Open Source", "FinTech"]
    financial_constraints: Dict[str, Any] = {
        "annual_family_income_inr": 450000,
        "target_annual_cost_inr": 120000,
        "confirmed_aid_inr": 60000,
        "currency": "INR"
    }
    achievements: List[str] = [
        "National Hackathon Winner 2025",
        "Published 1 workshop paper on NLP",
        "Community Tech Volunteer"
    ]

class Opportunity(BaseModel):
    id: str
    title: str
    provider: str
    category: str
    amount_inr: float
    amount_usd: float
    deadline: str
    days_left: int
    degree_levels: List[str]
    target_courses: List[str]
    min_gpa: Optional[float] = None
    max_family_income_inr: Optional[float] = None
    location_restrictions: List[str] = []
    description: str
    required_documents: List[str]
    essay_prompts: List[str]
    website_url: str
    urgency: str = "MEDIUM"

class EligibilityCheck(BaseModel):
    criterion: str
    status: str
    detail: str

class OpportunityEligibility(BaseModel):
    opportunity_id: str
    title: str
    category: str
    amount_inr: float
    amount_usd: float
    match_score: int
    rating: str
    checks: List[EligibilityCheck]
    key_reasoning: str

class StrategyItem(BaseModel):
    opportunity_id: str
    title: str
    category: str
    amount_inr: float
    amount_usd: float
    match_score: int
    expected_value_inr: float
    expected_value_usd: float
    priority_rank: int
    urgency: str

class FundingPlan(BaseModel):
    total_cost_inr: float
    total_cost_usd: float
    confirmed_aid_inr: float
    confirmed_aid_usd: float
    funding_gap_inr: float
    funding_gap_usd: float
    potential_coverage_inr: float
    potential_coverage_usd: float
    remaining_gap_inr: float
    remaining_gap_usd: float
    coverage_percentage: float
    recommended_strategy: List[StrategyItem]
    agent_advice: str

class AutopilotDraftRequest(BaseModel):
    opportunity_id: str
    prompt_index: int = 0
    student_profile: Optional[StudentProfile] = None

class AutopilotDraftResponse(BaseModel):
    opportunity_id: str
    opportunity_title: str
    prompt: str
    missing_information: List[str]
    application_checklist: List[Dict[str, Any]]
    draft_response: str
    submission_safety_passed: bool

class DraftRefineRequest(BaseModel):
    opportunity_id: str
    current_draft: str
    instruction: str

class DraftRefineResponse(BaseModel):
    refined_draft: str
    word_count: int
    reading_time_mins: float
    applied_style: str

class DocumentAuditRequest(BaseModel):
    opportunity_id: str
    uploaded_files: List[str]

class DocumentAuditResponse(BaseModel):
    verification_status: str
    verified_files: List[Dict[str, Any]]
    missing_requirements: List[str]
    audit_notes: str

class StrategySimulateRequest(BaseModel):
    profile: StudentProfile
    desired_coverage_target_pct: float = 100.0
    extra_work_study_inr: float = 0.0
    increased_family_aid_inr: float = 0.0

# 🌟 NEW FEATURE 1: Funding Confidence Meter
class ConfidenceMeterResponse(BaseModel):
    overall_confidence_score: int  # 0 to 100%
    rating: str  # HIGH_CONFIDENCE, MODERATE_CONFIDENCE, LOW_CONFIDENCE
    gap_coverage_ratio: float
    document_readiness_pct: float
    deadline_buffer_score: float
    key_drivers: List[str]
    risk_factors: List[str]

# 🌟 NEW FEATURE 2: Document Reuse Map + Deadline Collision Detector
class DocumentReuseItem(BaseModel):
    document_name: str
    required_by_opportunities: List[str]
    reuse_count: int
    effort_saved_hours: float

class DeadlineCollision(BaseModel):
    date: str
    colliding_opportunity_ids: List[str]
    colliding_titles: List[str]
    window_days: int
    risk_level: str  # HIGH_COLLISION, MODERATE_COLLISION

class DocumentReuseResponse(BaseModel):
    reusable_documents: List[DocumentReuseItem]
    total_repetition_saved_pct: float
    deadline_collisions: List[DeadlineCollision]
    collision_alerts: List[str]
    suggested_timeline: List[Dict[str, Any]]

# 🌟 NEW FEATURE 3: AI Essay Evidence Checker
class EssayClaimVerification(BaseModel):
    claim_text: str
    verification_status: str  # VALIDATED, UNVERIFIED_PROFILE, UNMATCHED_CRITERIA
    evidence_source: Optional[str] = None
    feedback_note: str

class EssayEvidenceCheckRequest(BaseModel):
    opportunity_id: str
    essay_draft: str
    student_profile: StudentProfile

class EssayEvidenceCheckResponse(BaseModel):
    overall_validity_score: int  # 0 to 100%
    verified_claims_count: int
    unverified_claims_count: int
    claim_verifications: List[EssayClaimVerification]
    improvement_suggestions: List[str]
