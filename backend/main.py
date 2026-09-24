from fastapi import FastAPI, HTTPException
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
    ConfidenceMeterResponse,
    DocumentReuseResponse,
    EssayEvidenceCheckRequest,
    EssayEvidenceCheckResponse
)
from data.opportunities import get_all_opportunities, get_opportunity_by_id, CURATED_OPPORTUNITIES
from agents.profile_agent import ProfileAgent
from agents.discovery_agent import DiscoveryAgent
from agents.eligibility_agent import EligibilityAgent
from agents.planner_agent import PlannerAgent
from agents.autopilot_agent import AutopilotAgent
from agents.deadline_agent import DeadlineAgent
from database import init_db

init_db()

app = FastAPI(
    title="EduFund AI Agent Platform API",
    description="Next-Gen Python Backend API for Education Funding Discovery, Multi-Agent Eligibility Reasoning, Confidence Scoring, Document Reuse & Deadline Collision Detection, and AI Essay Evidence Verification.",
    version="2.2.0"
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "EduFund AI Agent Platform",
        "database": "SQLite (edufund.db) + In-Memory Registry",
        "version": "2.2.0",
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
    CURATED_OPPORTUNITIES.append(opp)
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

# 🌟 NEW ENDPOINT 1: Funding Confidence Meter
@app.post("/api/planner/confidence", response_model=ConfidenceMeterResponse)
def calculate_confidence(profile: StudentProfile):
    opps = discovery_agent.discover(profile)
    plan = planner_agent.generate_plan(profile, opps)
    return planner_agent.calculate_funding_confidence(profile, plan)

# 🌟 NEW ENDPOINT 2: Document Reuse Map & Deadline Collision Detector
@app.post("/api/pipeline/audit-collisions", response_model=DocumentReuseResponse)
def audit_document_collisions(profile: StudentProfile):
    opps = discovery_agent.discover(profile)
    return deadline_agent.detect_collisions_and_reuse(opps, profile)

# 🌟 NEW ENDPOINT 3: AI Essay Evidence Checker
@app.post("/api/autopilot/evidence-check", response_model=EssayEvidenceCheckResponse)
def check_essay_evidence(request: EssayEvidenceCheckRequest):
    return autopilot_agent.verify_essay_evidence(request)

@app.post("/api/autopilot/draft", response_model=AutopilotDraftResponse)
def prepare_autopilot_draft(request: AutopilotDraftRequest):
    try:
        return autopilot_agent.prepare_application(
            opp_id=request.opportunity_id,
            prompt_index=request.prompt_index,
            profile=request.student_profile
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/autopilot/refine", response_model=DraftRefineResponse)
def refine_autopilot_draft(request: DraftRefineRequest):
    return autopilot_agent.refine_draft(request)

@app.post("/api/documents/audit", response_model=DocumentAuditResponse)
def audit_documents(request: DocumentAuditRequest):
    return autopilot_agent.audit_documents(request)

@app.get("/api/deadlines")
def get_deadlines():
    opps = get_all_opportunities()
    return deadline_agent.audit_deadlines(opps)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
