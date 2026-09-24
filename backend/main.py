from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import sys

sys.path.append(".")

from models import (
    StudentProfile,
    Opportunity,
    OpportunityEligibility,
    FundingPlan,
    AutopilotDraftRequest,
    AutopilotDraftResponse,
    DraftRefineRequest,
    DraftRefineResponse,
    DocumentAuditRequest,
    DocumentAuditResponse,
    StrategySimulateRequest,
    ApplicationRecord,
    ApplicationStatusUpdate, RegisterRequest, LoginRequest, UserPublic, AuthResponse, DiscoveryRequest, DraftEvidenceRequest, DraftEvidenceResponse
)
from data.opportunities import get_all_opportunities, get_opportunity_by_id
from agents.profile_agent import ProfileAgent
from agents.discovery_agent import DiscoveryAgent
from agents.eligibility_agent import EligibilityAgent
from agents.planner_agent import PlannerAgent
from agents.autopilot_agent import AutopilotAgent
from agents.deadline_agent import DeadlineAgent
from database import (init_db, list_applications, upsert_application, save_opportunity, create_user,
    authenticate_user, create_session, get_session_user, delete_session, list_users, bootstrap_admin, save_student_profile, get_student_profile, platform_readiness)

# Initialize SQLite database on startup
init_db()
bootstrap_admin()

app = FastAPI(
    title="EduFund AI Agent Platform API",
    description="Next-Gen Python Backend API powering Student Discovery, Multi-Agent Eligibility Reasoning, Strategy Simulation, and Application Autopilot with SQLite database support.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

profile_agent = ProfileAgent()
discovery_agent = DiscoveryAgent()
eligibility_agent = EligibilityAgent()
planner_agent = PlannerAgent()
autopilot_agent = AutopilotAgent()
deadline_agent = DeadlineAgent()

def current_user(authorization: Optional[str] = Header(None)) -> dict:
    token = authorization.removeprefix("Bearer ").strip() if authorization else ""
    user = get_session_user(token) if token else None
    if not user: raise HTTPException(status_code=401, detail="Sign in is required.")
    return user

def require_admin(authorization: Optional[str] = Header(None)) -> dict:
    user = current_user(authorization)
    if user["role"] != "admin": raise HTTPException(status_code=403, detail="Administrator access is required.")
    return user

@app.post("/api/auth/register", response_model=AuthResponse)
def register(request: RegisterRequest):
    try: user = create_user(request.name, request.email, request.password)
    except ValueError as error: raise HTTPException(status_code=409, detail=str(error))
    return {"token": create_session(user["id"]), "user": user}

@app.post("/api/auth/login", response_model=AuthResponse)
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user: raise HTTPException(status_code=401, detail="Incorrect email or password.")
    return {"token": create_session(user["id"]), "user": user}

@app.get("/api/auth/me", response_model=UserPublic)
def me(authorization: Optional[str] = Header(None)):
    return current_user(authorization)

@app.post("/api/auth/logout", status_code=204)
def logout(authorization: Optional[str] = Header(None)):
    if authorization: delete_session(authorization.removeprefix("Bearer ").strip())

@app.get("/api/admin/users", response_model=List[UserPublic])
def admin_list_users(authorization: Optional[str] = Header(None)):
    require_admin(authorization); return list_users()

@app.get("/api/admin/overview")
def admin_overview(authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    users, opportunities, readiness = list_users(), get_all_opportunities(), platform_readiness()
    deadline_review = deadline_agent.audit_deadlines(opportunities)
    return {
        "student_count": len([u for u in users if u["role"] == "student"]),
        "admin_count": len([u for u in users if u["role"] == "admin"]),
        "opportunity_count": len(opportunities),
        "application_count": sum(readiness["application_statuses"].values()),
        "completed_profiles": readiness["completed_profiles"],
        "application_statuses": readiness["application_statuses"],
        "source_linked_count": len([o for o in opportunities if o.website_url.startswith("https://")]),
        "deadline_review": deadline_review,
    }

@app.get("/api/admin/catalogue", response_model=List[Opportunity])
def admin_catalogue(authorization: Optional[str] = Header(None)):
    require_admin(authorization)
    return get_all_opportunities()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "EduFund AI Agent Platform",
        "database": "SQLite (edufund.db) + In-Memory Registry",
        "version": "2.1.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok", 
        "database": "connected (SQLite edufund.db)",
        "agents": ["profile", "discovery", "eligibility", "planner", "autopilot", "deadline"]
    }

@app.post("/api/profile/process")
def process_profile(profile: StudentProfile):
    return profile_agent.process_profile(profile)

@app.get("/api/profile/me", response_model=Optional[StudentProfile])
def get_my_profile(authorization: Optional[str] = Header(None)):
    user = current_user(authorization)
    profile = get_student_profile(user["id"])
    return StudentProfile(**profile) if profile else None

@app.put("/api/profile/me", response_model=StudentProfile)
def save_my_profile(profile: StudentProfile, authorization: Optional[str] = Header(None)):
    user = current_user(authorization)
    data = profile.model_dump(); data["id"] = user["id"]; data["name"] = profile.name or user["name"]
    return save_student_profile(data)

@app.post("/api/discovery", response_model=List[Opportunity])
def discover_for_profile(request: DiscoveryRequest):
    return discovery_agent.discover(request.profile, category_filter=request.category, search_query=request.query)

@app.get("/api/opportunities", response_model=List[Opportunity])
def list_opportunities(category: Optional[str] = None, q: Optional[str] = None):
    default_prof = StudentProfile()
    return discovery_agent.discover(default_prof, category_filter=category, search_query=q)

@app.get("/api/opportunities/{opp_id}", response_model=Opportunity)
def get_opportunity(opp_id: str):
    opp = get_opportunity_by_id(opp_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp

@app.post("/api/opportunities/custom", response_model=Opportunity)
def create_custom_opportunity(opp: Opportunity):
    save_opportunity(opp.model_dump())
    return opp

@app.post("/api/eligibility/evaluate", response_model=OpportunityEligibility)
def evaluate_eligibility(opp_id: str, profile: StudentProfile):
    opp = get_opportunity_by_id(opp_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return eligibility_agent.evaluate_opportunity(profile, opp)

@app.post("/api/planner/generate", response_model=FundingPlan)
def generate_funding_plan(profile: StudentProfile, category: Optional[str] = None):
    opps = discovery_agent.discover(profile, category_filter=category)
    return planner_agent.generate_plan(profile, opps)

@app.post("/api/strategy/simulate", response_model=FundingPlan)
def simulate_strategy_scenario(request: StrategySimulateRequest):
    opps = discovery_agent.discover(request.profile)
    return planner_agent.simulate_scenario(request, opps)

@app.post("/api/autopilot/draft", response_model=AutopilotDraftResponse)
def prepare_autopilot_draft(request: AutopilotDraftRequest):
    try:
        result = autopilot_agent.prepare_application(
            opp_id=request.opportunity_id,
            prompt_index=request.prompt_index,
            profile=request.student_profile
        )
        upsert_application(request.opportunity_id, "DRAFTING", draft_text=result.draft_response)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/autopilot/refine", response_model=DraftRefineResponse)
def refine_autopilot_draft(request: DraftRefineRequest):
    return autopilot_agent.refine_draft(request)

@app.post("/api/documents/audit", response_model=DocumentAuditResponse)
def audit_documents(request: DocumentAuditRequest):
    return autopilot_agent.audit_documents(request)

@app.post("/api/autopilot/evidence-check", response_model=DraftEvidenceResponse)
def evidence_check(request: DraftEvidenceRequest):
    return autopilot_agent.check_draft_evidence(request)

@app.get("/api/deadlines")
def get_deadlines():
    opps = get_all_opportunities()
    return deadline_agent.audit_deadlines(opps)

@app.get("/api/applications", response_model=List[ApplicationRecord])
def get_applications():
    return list_applications()

@app.put("/api/applications/{opp_id}", response_model=ApplicationRecord)
def update_application(opp_id: str, update: ApplicationStatusUpdate):
    if not get_opportunity_by_id(opp_id):
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return upsert_application(opp_id, update.status, update.draft_text, update.notes)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
