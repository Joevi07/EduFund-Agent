import os
import re
from typing import Optional, List, Dict, Any
from models import (
    StudentProfile,
    Opportunity,
    AutopilotDraftResponse,
    DraftRefineRequest,
    DraftRefineResponse,
    DocumentAuditRequest,
    DocumentAuditResponse,
    DraftEvidenceRequest, DraftEvidenceResponse, EvidenceFinding
)
from data.opportunities import get_opportunity_by_id

# ── Gemini LLM Setup (graceful fallback if key is absent) ─────────────────
_gemini_model = None
try:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        print(f"[AutopilotAgent] ✅ Gemini 1.5 Flash loaded — AI-powered drafts enabled.")
    else:
        print("[AutopilotAgent] ℹ️  GEMINI_API_KEY not set — using rule-based draft fallback.")
except Exception as _e:
    print(f"[AutopilotAgent] ⚠️  Gemini init failed ({_e}) — using rule-based fallback.")


def _gemini_available() -> bool:
    return _gemini_model is not None


def _call_gemini(prompt: str, fallback: str) -> str:
    """Call Gemini, return fallback text on any error."""
    try:
        response = _gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[AutopilotAgent] Gemini call failed: {e}")
        return fallback


class AutopilotAgent:
    def __init__(self):
        self.agent_name = "Application Autopilot Agent"

    def prepare_application(
        self,
        opp_id: str,
        prompt_index: int,
        profile: Optional[StudentProfile]
    ) -> AutopilotDraftResponse:
        opp = get_opportunity_by_id(opp_id)
        if not opp:
            raise ValueError(f"Opportunity ID '{opp_id}' not found.")

        if not profile:
            profile = StudentProfile()

        missing_info = []
        missing_documents = set()
        if "Income Certificate" in opp.required_documents:
            inc = profile.financial_constraints.get("annual_family_income_inr")
            if not inc:
                missing_info.append("Family Income Certificate / Tax Return")
                missing_documents.add("Income Certificate")
        if "Official Transcript" in opp.required_documents or "10th & 12th Marksheets" in opp.required_documents:
            if not profile.academic_profile.get("gpa"):
                missing_info.append("Official Academic Transcript Document")
                missing_documents.update({"Official Transcript", "10th & 12th Marksheets"})
        if "Portfolio / GitHub" in opp.required_documents:
            if not any("github" in a.lower() or "hackathon" in a.lower() for a in profile.achievements):
                missing_info.append("Portfolio / GitHub URL Link")
                missing_documents.add("Portfolio / GitHub")

        prompts = opp.essay_prompts if opp.essay_prompts else ["Why are you the ideal candidate for this funding opportunity?"]
        selected_prompt = prompts[min(prompt_index, len(prompts) - 1)]

        achievements_str = ", ".join(profile.achievements) if profile.achievements else "strong academic record"
        interests_str = ", ".join(profile.interests) if profile.interests else "technology and innovation"
        gpa_value = profile.academic_profile.get("gpa", 3.8)
        gpa_scale = profile.academic_profile.get("max_gpa", 4.0)
        income = profile.financial_constraints.get("annual_family_income_inr", 0)
        target_cost = profile.financial_constraints.get("target_annual_cost_inr", 120000)

        # ── Rule-based fallback draft ──────────────────────────────────────
        fallback_draft = (
            f"As a dedicated {profile.education_level} student specializing in {profile.course} with a GPA of "
            f"{gpa_value}/{gpa_scale}, I am writing to apply for the {opp.title}.\n\n"
            f"My academic journey is driven by a deep passion for {interests_str}. Throughout my studies, I have consistently "
            f"striven for excellence, as demonstrated by my key achievements including: {achievements_str}.\n\n"
            f"Receiving the {opp.title} from {opp.provider} would provide vital support for my target educational expenses "
            f"(annual target cost of ₹{target_cost:,}), allowing me to "
            f"focus entirely on technical innovation and research rather than financial constraints. I look forward to contributing "
            f"back to the community through leadership and impactful projects."
        )

        # ── Gemini-powered draft ───────────────────────────────────────────
        if _gemini_available():
            gemini_prompt = f"""You are an expert scholarship application writer helping a student craft a compelling, 
personal, and persuasive 250–300 word personal statement for a funding opportunity.

STUDENT PROFILE:
- Name: {profile.name}
- Education Level: {profile.education_level}
- Course/Field: {profile.course}
- GPA: {gpa_value}/{gpa_scale}
- Location: {profile.location.get('city', '')}, {profile.location.get('state', '')}, {profile.location.get('country', 'India')}
- Annual Family Income: ₹{income:,}
- Target Annual Education Cost: ₹{target_cost:,}
- Key Achievements: {achievements_str}
- Academic Interests: {interests_str}

FUNDING OPPORTUNITY:
- Name: {opp.title}
- Provider: {opp.provider}
- Amount: ₹{opp.amount_inr:,.0f}
- Description: {opp.description[:300]}

ESSAY PROMPT: "{selected_prompt}"

Write a compelling, authentic personal statement (250-300 words) that:
1. Opens with a powerful hook specific to this student's background
2. Connects their specific achievements to the scholarship's mission
3. Explains the financial need clearly and honestly (mention their family income vs education cost)
4. Describes how this award will enable their specific goals
5. Ends with a confident, memorable closing

Write only the essay text, no headers or labels. Make it feel deeply personal, not generic."""

            draft = _call_gemini(gemini_prompt, fallback_draft)
        else:
            draft = fallback_draft

        checklist = []
        for doc in opp.required_documents:
            is_ready = doc not in missing_documents
            checklist.append({
                "item": doc,
                "type": "DOCUMENT",
                "status": "CHECKLIST_READY" if is_ready else "NEEDS_DOCUMENT",
                "notes": "Profile information suggests this item is available; file contents are not verified." if is_ready else "Action required by student"
            })

        checklist.append({
            "item": "Tailored Statement of Purpose / Essay Draft",
            "type": "ESSAY",
            "status": "DRAFT_PREPARED",
            "notes": f"{'AI-generated by Gemini 1.5 Flash' if _gemini_available() else 'Generated by Autopilot Agent'}; requires student review."
        })
        checklist.append({
            "item": "Final Human Review & Safety Sign-off",
            "type": "SAFETY_CONTROL",
            "status": "PENDING_STUDENT_APPROVAL",
            "notes": "Safety control: AI will not submit financial forms without student explicit authorization."
        })

        return AutopilotDraftResponse(
            opportunity_id=opp.id,
            opportunity_title=opp.title,
            prompt=selected_prompt,
            missing_information=missing_info,
            application_checklist=checklist,
            draft_response=draft,
            submission_safety_passed=True
        )

    def refine_draft(self, req: DraftRefineRequest) -> DraftRefineResponse:
        instr = req.instruction.lower()
        draft = req.current_draft

        # ── Gemini-powered refinement ──────────────────────────────────────
        if _gemini_available():
            style_map = {
                "persuasive": "highly persuasive and emotionally compelling, with vivid storytelling",
                "impact": "focused on measurable social and academic impact, using strong action verbs",
                "academic": "scholarly and rigorous with precise language appropriate for academic committees",
                "shorten": "concise (under 120 words) while preserving the most powerful points",
                "concise": "concise (under 120 words) while preserving the most powerful points",
                "technical": "technically specific, highlighting engineering skills and technical achievements",
            }
            style_desc = next((v for k, v in style_map.items() if k in instr), "balanced, professional, and polished")
            gemini_prompt = f"""Rewrite the following scholarship essay to be {style_desc}.
Keep the student's authentic voice. Do not add false claims. Output only the rewritten essay text.

ORIGINAL ESSAY:
{draft}"""
            refined = _call_gemini(gemini_prompt, draft)
            if "persuasive" in instr or "impact" in instr:
                style = "High Impact & Persuasive (Gemini AI)"
            elif "academic" in instr or "rigor" in instr:
                style = "Academic & Scholarly (Gemini AI)"
            elif "shorten" in instr or "concise" in instr:
                style = "Concise (Gemini AI)"
            else:
                style = f"Refined: {req.instruction.title()} (Gemini AI)"
        else:
            # Rule-based fallback
            if "persuasive" in instr or "impact" in instr:
                refined = (
                    "DEEP IMPACT REFINEMENT:\n" + draft +
                    "\n\nFurthermore, my track record in high-stakes hackathons and open-source contributions demonstrates "
                    "my relentless drive to translate technical research into tangible, real-world societal impact."
                )
                style = "High Impact & Persuasive"
            elif "academic" in instr or "rigor" in instr:
                refined = (
                    "ACADEMIC RIGOR REFINEMENT:\n" + draft +
                    "\n\nMy analytical foundation in algorithmic complexity, machine learning architectures, and empirical research "
                    "positions me to excel in advanced research endeavors."
                )
                style = "Academic & Scholarly"
            elif "shorten" in instr or "concise" in instr:
                words = draft.split()
                shortened = " ".join(words[:min(100, len(words))]) + "..."
                refined = "CONCISE SUMMARY REFINEMENT:\n" + shortened
                style = "Concise (<100 words)"
            else:
                refined = draft + "\n\n[Refined with enhanced technical specificity and career clarity.]"
                style = "Balanced Professional"

        word_cnt = len(refined.split())
        mins = round(word_cnt / 200.0, 1)

        return DraftRefineResponse(
            refined_draft=refined,
            word_count=word_cnt,
            reading_time_mins=max(0.5, mins),
            applied_style=style
        )

    def audit_documents(self, req: DocumentAuditRequest) -> DocumentAuditResponse:
        opp = get_opportunity_by_id(req.opportunity_id)
        required = opp.required_documents if opp else []

        if not required:
            return DocumentAuditResponse(
                readiness_status="UNAVAILABLE",
                matched_files=[],
                missing_requirements=[],
                matched_count=0,
                required_count=0,
                completion_percentage=None,
                readiness_notes=(
                    "Required documents are not listed in the EduFund catalogue for this opportunity, "
                    "so checklist completion cannot be calculated. Confirm requirements on the provider's official source."
                ),
            )

        def normalized_name(value: str) -> str:
            stem = os.path.splitext(os.path.basename(value))[0]
            return " ".join(re.sub(r"[^a-z0-9]+", " ", stem.lower()).split())

        uploaded_names = [(file_name, normalized_name(file_name)) for file_name in req.uploaded_files]
        matched = []
        missing = []

        for doc in required:
            document_name = normalized_name(doc)
            matching_file = next((
                file_name for file_name, uploaded_name in uploaded_names
                if uploaded_name and (uploaded_name in document_name or document_name in uploaded_name)
            ), None)
            if matching_file:
                matched.append({
                    "document": doc,
                    "file_name": matching_file,
                    "status": "CHECKLIST_MATCH",
                })
            else:
                missing.append(doc)

        required_count = len(required)
        matched_count = len(matched)
        completion_percentage = round((matched_count / required_count) * 100)
        status = "COMPLETE" if not missing else "INCOMPLETE"
        notes = (
            f"Filename checklist match: {matched_count} of {required_count} required documents "
            f"({completion_percentage}%). File contents and authenticity were not verified."
        )

        return DocumentAuditResponse(
            readiness_status=status,
            matched_files=matched,
            missing_requirements=missing,
            matched_count=matched_count,
            required_count=required_count,
            completion_percentage=completion_percentage,
            readiness_notes=notes,
        )

    def check_draft_evidence(self, req: DraftEvidenceRequest) -> DraftEvidenceResponse:
        profile = req.student_profile

        def normalized(value: Any) -> str:
            return " ".join(re.sub(r"[^a-z0-9]+", " ", str(value).lower().replace(",", "")).split())

        stop_words = {
            "a", "an", "and", "as", "at", "for", "from", "in", "is", "my", "of", "on", "or",
            "the", "to", "with", "student", "year",
        }

        def meaningful_tokens(value: str) -> set[str]:
            return {
                token for token in normalized(value).split()
                if (len(token) > 1 or token.isdigit()) and token not in stop_words
            }

        evidence_entries = []

        def add_evidence(category: str, label: str, value: Any) -> None:
            if value is None or not str(value).strip():
                return
            evidence_entries.append({
                "category": category,
                "label": f"{label}: {value}",
                "value": normalized(value),
                "tokens": meaningful_tokens(str(value)),
            })

        add_evidence("identity", "Student name", profile.name)
        add_evidence("education", "Education level", profile.education_level)
        add_evidence("course", "Course", profile.course)
        gpa = profile.academic_profile.get("gpa")
        max_gpa = profile.academic_profile.get("max_gpa")
        if gpa and max_gpa:
            add_evidence("academic", "Academic profile", f"GPA {gpa}/{max_gpa}")
        add_evidence("academic", "Standardized test", profile.academic_profile.get("standardized_test"))
        add_evidence("academic", "Year of study", profile.academic_profile.get("year_of_study"))
        for achievement in profile.achievements:
            add_evidence("achievement", "Achievement", achievement)
        for interest in profile.interests:
            add_evidence("interest", "Interest", interest)
        add_evidence("location", "Country", profile.location.get("country"))
        add_evidence("location", "State", profile.location.get("state"))
        add_evidence("location", "City", profile.location.get("city"))
        target_cost = profile.financial_constraints.get("target_annual_cost_inr")
        if target_cost:
            add_evidence("financial", "Target annual cost", target_cost)
        family_income = profile.financial_constraints.get("annual_family_income_inr")
        if family_income:
            add_evidence("financial", "Annual family income", family_income)

        risk_rules = [
            (
                "leadership",
                re.compile(r"\b(leadership|leader|led|managed|organised|organized|founded|mentored|coordinated|captain|president)\b", re.I),
                "Add a specific leadership example, responsibility, action, team context, or measurable result if one genuinely applies.",
            ),
            (
                "achievement",
                re.compile(r"\b(won|winner|award|awarded|published|ranked|first|best|top|excellence|consistently demonstrated)\b", re.I),
                "Name the specific achievement, award, publication, or result only if it is accurate and can be supported.",
            ),
            (
                "project",
                re.compile(r"\b(project|research|built|created|developed|impact|volunteer|community service|hackathon)\b", re.I),
                "If one genuinely applies, add the project, research, or service example, your role, and a measurable result where available.",
            ),
            (
                "academic",
                re.compile(r"\b(gpa|cgpa|grade|marks?|score|rank|percentile|academic record)\b", re.I),
                "Use the exact GPA, mark, rank, test result, or academic record that the student can support.",
            ),
            (
                "financial",
                re.compile(r"\b(income|financial|afford|expenses?|annual cost|funding need)\b", re.I),
                "Use only financial figures or circumstances that are accurate and supported by the student's records.",
            ),
        ]
        allowed_categories = {
            "leadership": {"achievement"},
            "achievement": {"achievement"},
            "project": {"achievement"},
            "academic": {"academic", "achievement"},
            "financial": {"financial"},
        }
        leadership_terms = re.compile(r"\b(lead|leader|led|managed|organised|organized|founded|mentored|coordinated|captain|president)\b", re.I)
        generic_leadership_claim = re.compile(r"\b(demonstrated leadership|leadership skills?|leadership experience|a leader)\b", re.I)

        raw_sentences = re.split(r"(?<=[.!?])\s+|[\r\n]+", req.draft_text)
        sentences = []
        for sentence in raw_sentences:
            cleaned = re.sub(r"^[A-Z][A-Z &<>()-]{3,}:\s*", "", sentence.strip()).strip()
            if len(cleaned.split()) < 4:
                continue
            is_first_person = re.search(r"\b(i|i'm|i've|my|me|we|our)\b", cleaned, re.I)
            has_specific_value = re.search(r"\d", cleaned)
            has_risk_language = any(rule.search(cleaned) for _, rule, _ in risk_rules)
            if is_first_person or has_specific_value or has_risk_language:
                sentences.append(cleaned)

        findings = []
        for sentence in sentences:
            claim_normalized = normalized(sentence)
            claim_tokens = meaningful_tokens(sentence)
            matches = []
            for entry in evidence_entries:
                entry_tokens = entry["tokens"]
                overlap = claim_tokens & entry_tokens
                direct_match = bool(
                    entry["value"] and f" {entry['value']} " in f" {claim_normalized} "
                )
                token_match = bool(
                    entry_tokens
                    and len(overlap) >= min(2, len(entry_tokens))
                    and (len(overlap) / len(entry_tokens)) >= 0.6
                )
                if direct_match or token_match:
                    matches.append({
                        "entry": entry,
                        "strong": direct_match or entry_tokens.issubset(claim_tokens),
                    })

            risks = [(category, suggestion) for category, rule, suggestion in risk_rules if rule.search(sentence)]
            if risks and risks[0][0] == "leadership" and generic_leadership_claim.search(sentence):
                leadership_evidence = next((
                    entry for entry in evidence_entries
                    if entry["category"] == "achievement" and leadership_terms.search(entry["label"])
                ), None)
                if leadership_evidence and not any(match["entry"] is leadership_evidence for match in matches):
                    matches.append({"entry": leadership_evidence, "strong": True})

            relevant_matches = [match["entry"] for match in matches]
            if risks:
                relevant_categories = set().union(*(allowed_categories[category] for category, _ in risks))
                relevant_matches = [
                    match["entry"] for match in matches
                    if match["strong"] and match["entry"]["category"] in relevant_categories
                ]

            if relevant_matches:
                references = "; ".join(entry["label"] for entry in relevant_matches[:2])
                findings.append(EvidenceFinding(
                    claim=sentence,
                    status="SUPPORTED",
                    detail="This claim connects to information already present in the saved profile.",
                    evidence_reference=references,
                ))
            elif risks:
                suggestions = []
                for _, suggestion in risks:
                    if suggestion not in suggestions:
                        suggestions.append(suggestion)
                findings.append(EvidenceFinding(
                    claim=sentence,
                    status="NEEDS_EVIDENCE",
                    detail="No matching evidence for this claim was found in the saved profile.",
                    suggestion=" ".join(suggestions),
                ))
            else:
                findings.append(EvidenceFinding(
                    claim=sentence,
                    status="REVIEW",
                    detail="This sentence is not directly linked to a saved profile fact.",
                    suggestion="Confirm it is accurate and add a specific example only if one genuinely applies.",
                ))

        supported_count = len([f for f in findings if f.status == "SUPPORTED"])
        needs_evidence_count = len([f for f in findings if f.status == "NEEDS_EVIDENCE"])
        review_count = len([f for f in findings if f.status == "REVIEW"])
        return DraftEvidenceResponse(
            supported_count=supported_count,
            needs_evidence_count=needs_evidence_count,
            review_count=review_count,
            total_claims=len(findings),
            findings=findings,
            methodology_note=(
                "Deterministic sentence-level comparison against the saved profile. This is coaching, not factual verification, "
                "plagiarism detection, or a confidence score. Review every suggestion before editing."
            ),
        )
