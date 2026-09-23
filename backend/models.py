from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

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
    instruction: str  # e.g. "persuasive", "academic", "shorten", "technical"

class DraftRefineResponse(BaseModel):
    refined_draft: str
    word_count: int
    reading_time_mins: float
    applied_style: str

class DocumentAuditRequest(BaseModel):
    opportunity_id: str
    uploaded_files: List[str]  # e.g. ["marksheet.pdf", "income_certificate.pdf"]

class DocumentAuditResponse(BaseModel):
    verification_status: str  # PASSED, PENDING, FAILED
    verified_files: List[Dict[str, Any]]
    missing_requirements: List[str]
    audit_notes: str

class StrategySimulateRequest(BaseModel):
    profile: StudentProfile
    desired_coverage_target_pct: float = 100.0
    extra_work_study_inr: float = 0.0
    increased_family_aid_inr: float = 0.0

class ApplicationRecord(BaseModel):
    opportunity_id: str
    status: Literal["DISCOVERED", "PLANNED", "DRAFTING", "READY_TO_SUBMIT", "SUBMITTED"] = "DISCOVERED"
    draft_text: Optional[str] = None
    notes: Optional[str] = None
    updated_at: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: Literal["DISCOVERED", "PLANNED", "DRAFTING", "READY_TO_SUBMIT", "SUBMITTED"]
    draft_text: Optional[str] = None
    notes: Optional[str] = None

class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: str
    password: str

class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["student", "admin"]
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    token: str
    user: UserPublic

class DiscoveryRequest(BaseModel):
    profile: StudentProfile
    category: Optional[str] = None
    query: Optional[str] = None
