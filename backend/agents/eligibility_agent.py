from typing import List

from models import EligibilityCheck, Opportunity, OpportunityEligibility, StudentProfile


class EligibilityAgent:
    def __init__(self):
        self.agent_name = "Eligibility Reasoning Agent"

    def evaluate_opportunity(self, profile: StudentProfile, opp: Opportunity) -> OpportunityEligibility:
        checks: List[EligibilityCheck] = []
        score = 100

        # A missing profile value is UNAVAILABLE rather than an accidental pass/fail.
        student_level = (profile.education_level or "").strip()
        if not student_level:
            score -= 30
            checks.append(EligibilityCheck(
                criterion="Education Level",
                status="UNAVAILABLE",
                detail=f"Add an education level to compare with: {', '.join(opp.degree_levels)}.",
            ))
        elif any(degree.lower() == student_level.lower() for degree in opp.degree_levels):
            checks.append(EligibilityCheck(
                criterion="Education Level",
                status="PASS",
                detail=f"Student level ({student_level}) matches requirement ({', '.join(opp.degree_levels)}).",
            ))
        else:
            score -= 30
            checks.append(EligibilityCheck(
                criterion="Education Level",
                status="FAIL",
                detail=f"Student is {student_level}, but opportunity requires {', '.join(opp.degree_levels)}.",
            ))

        raw_gpa_value = profile.academic_profile.get("gpa")
        raw_max_gpa_value = profile.academic_profile.get("max_gpa")
        raw_gpa = float(raw_gpa_value or 0.0)
        max_gpa = float(raw_max_gpa_value or 0.0)
        if opp.min_gpa is None:
            checks.append(EligibilityCheck(
                criterion="Academic Requirement",
                status="UNAVAILABLE",
                detail="The provider data does not list a minimum GPA requirement.",
            ))
        elif raw_gpa <= 0 or max_gpa <= 0:
            score -= 25
            checks.append(EligibilityCheck(
                criterion="Academic Requirement",
                status="UNAVAILABLE",
                detail=f"Add a GPA and grading scale to compare with the listed minimum ({opp.min_gpa}/4.0).",
            ))
        else:
            student_gpa = round((raw_gpa / max_gpa) * 4.0, 2)
            if student_gpa >= opp.min_gpa:
                checks.append(EligibilityCheck(
                    criterion="Academic Requirement",
                    status="PASS",
                    detail=f"Student GPA ({raw_gpa}/{max_gpa}, about {student_gpa}/4.0) meets the listed minimum ({opp.min_gpa}).",
                ))
            else:
                score -= 25
                checks.append(EligibilityCheck(
                    criterion="Academic Requirement",
                    status="FAIL",
                    detail=f"Student GPA ({raw_gpa}/{max_gpa}, about {student_gpa}/4.0) is below the listed minimum ({opp.min_gpa}).",
                ))

        income_value = profile.financial_constraints.get("annual_family_income_inr")
        student_income = float(income_value or 0.0)
        if opp.max_family_income_inr is None:
            checks.append(EligibilityCheck(
                criterion="Financial Eligibility",
                status="UNAVAILABLE",
                detail="The provider data does not list a family-income ceiling.",
            ))
        elif student_income <= 0:
            score -= 30
            checks.append(EligibilityCheck(
                criterion="Financial Eligibility",
                status="UNAVAILABLE",
                detail=f"Add annual family income to compare with the listed ceiling (₹{opp.max_family_income_inr:,.0f}).",
            ))
        elif student_income <= opp.max_family_income_inr:
            checks.append(EligibilityCheck(
                criterion="Financial Eligibility",
                status="PASS",
                detail=f"Family income (₹{student_income:,.0f}) is within the listed ceiling (₹{opp.max_family_income_inr:,.0f}).",
            ))
        else:
            score -= 30
            checks.append(EligibilityCheck(
                criterion="Financial Eligibility",
                status="FAIL",
                detail=f"Family income (₹{student_income:,.0f}) exceeds the listed ceiling of ₹{opp.max_family_income_inr:,.0f}.",
            ))

        student_course = (profile.course or "").strip()
        if not student_course:
            score -= 15
            checks.append(EligibilityCheck(
                criterion="Course & Field Fit",
                status="UNAVAILABLE",
                detail=f"Add a course or field to compare with: {', '.join(opp.target_courses)}.",
            ))
        else:
            course_match = any(
                course.lower() in student_course.lower()
                or student_course.lower() in course.lower()
                or course.lower() == "all courses"
                for course in opp.target_courses
            )
            if course_match:
                checks.append(EligibilityCheck(
                    criterion="Course & Field Fit",
                    status="PASS",
                    detail=f"Course '{student_course}' matches listed target areas ({', '.join(opp.target_courses)}).",
                ))
            else:
                score -= 15
                checks.append(EligibilityCheck(
                    criterion="Course & Field Fit",
                    status="WARN",
                    detail=f"Course '{student_course}' is outside the listed primary targets ({', '.join(opp.target_courses)}).",
                ))

        student_country = (profile.location.get("country") or "").strip()
        student_state = (profile.location.get("state") or "").strip()
        if not opp.location_restrictions:
            checks.append(EligibilityCheck(
                criterion="Location & Residency",
                status="UNAVAILABLE",
                detail="The provider data does not list a location restriction.",
            ))
        elif not student_country and not student_state:
            score -= 20
            checks.append(EligibilityCheck(
                criterion="Location & Residency",
                status="UNAVAILABLE",
                detail=f"Add a country or state to compare with: {', '.join(opp.location_restrictions)}.",
            ))
        else:
            location_match = any(
                location.lower() in student_country.lower()
                or location.lower() in student_state.lower()
                or location.lower() == "global"
                for location in opp.location_restrictions
            )
            if location_match:
                checks.append(EligibilityCheck(
                    criterion="Location & Residency",
                    status="PASS",
                    detail=f"Residency ({student_state or 'state not listed'}, {student_country or 'country not listed'}) meets the listed regional criterion.",
                ))
            else:
                score -= 20
                checks.append(EligibilityCheck(
                    criterion="Location & Residency",
                    status="FAIL",
                    detail=f"Residency does not match the listed restrictions ({', '.join(opp.location_restrictions)}).",
                ))

        score = max(0, min(100, score))
        failed_count = sum(check.status == "FAIL" for check in checks)
        warning_count = sum(check.status == "WARN" for check in checks)
        missing_profile_count = sum(
            check.status == "UNAVAILABLE" and check.detail.startswith("Add ") for check in checks
        )
        if score >= 80:
            rating = "HIGH"
        elif score >= 50:
            rating = "MEDIUM"
        else:
            rating = "LOW"

        if failed_count:
            reasoning = f"{failed_count} listed eligibility condition{'s' if failed_count != 1 else ''} did not match the profile."
        elif missing_profile_count:
            reasoning = f"Add {missing_profile_count} missing profile value{'s' if missing_profile_count != 1 else ''} to complete the eligibility comparison."
        elif warning_count:
            reasoning = f"Core checks passed, with {warning_count} course or field alignment item to review."
        else:
            reasoning = "The available profile values satisfy the listed eligibility conditions; unlisted provider criteria remain unavailable."

        # Build structured explainability card data
        profile_facts_helped: List[str] = []
        conditions_to_verify: List[str] = []
        readiness_actions: List[str] = []

        for check in checks:
            if check.status == "PASS":
                profile_facts_helped.append(check.detail)
            elif check.status in ("UNAVAILABLE", "WARN"):
                conditions_to_verify.append(check.detail)

        # Actionable readiness recommendations
        req_docs = opp.required_documents or []
        if req_docs:
            readiness_actions.append(f"Upload required documents: {', '.join(req_docs[:2])} in Autopilot Studio.")
        if any(c.criterion == "Financial Eligibility" and c.status == "PASS" for c in checks):
            readiness_actions.append("Upload certified income certificate to verify income threshold before deadline.")
        if opp.essay_prompts:
            readiness_actions.append(f"Draft tailored statement for prompt: '{opp.essay_prompts[0][:60]}...'")
        if not readiness_actions:
            readiness_actions.append("Review official provider link to confirm latest intake guidelines and dates.")

        # Why this match natural language synthesis
        academic_fact = f"CGPA {raw_gpa}/{max_gpa}" if raw_gpa > 0 else "Academic credentials"
        level_fact = student_level if student_level else "student"
        course_fact = student_course if student_course else "your programme"

        if score >= 70:
            income_summary = f"Annual family income (₹{student_income:,.0f}) is within the programme ceiling." if (opp.max_family_income_inr and student_income > 0) else "Financial profile matches standard criteria."
            action_snippet = readiness_actions[0] if readiness_actions else "Complete checklist in Autopilot Studio."
            why_matched = (
                f"Matched because you are an {level_fact} {course_fact} student with {academic_fact}. "
                f"{income_summary} {action_snippet}"
            )
        elif score >= 40:
            why_matched = (
                f"Partially aligned for {level_fact} in {course_fact}. "
                f"Requires verification of {len(conditions_to_verify)} condition{'s' if len(conditions_to_verify) != 1 else ''}. "
                f"{readiness_actions[0] if readiness_actions else 'Check official source.'}"
            )
        else:
            why_matched = (
                f"Low alignment: {failed_count} condition{'s' if failed_count != 1 else ''} did not match your current profile. "
                "Review requirements on the official source."
            )

        explainability = {
            "why_matched": why_matched,
            "profile_facts_helped": profile_facts_helped if profile_facts_helped else ["General study level alignment"],
            "conditions_to_verify": conditions_to_verify if conditions_to_verify else ["Provider final verification at submission"],
            "readiness_actions": readiness_actions,
            "match_strength_label": rating,
        }

        return OpportunityEligibility(
            opportunity_id=opp.id,
            title=opp.title,
            category=opp.category,
            amount_inr=opp.amount_inr,
            amount_usd=opp.amount_usd,
            match_score=score,
            rating=rating,
            checks=checks,
            key_reasoning=reasoning,
            explainability=explainability,
        )

