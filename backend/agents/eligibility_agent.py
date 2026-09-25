from typing import List
from models import Opportunity, StudentProfile, OpportunityEligibility, EligibilityCheck

class EligibilityAgent:
    def __init__(self):
        self.agent_name = "Eligibility Reasoning Agent"

    def evaluate_opportunity(self, profile: StudentProfile, opp: Opportunity) -> OpportunityEligibility:
        checks: List[EligibilityCheck] = []
        score = 100
        fail_count = 0

        # 1. Degree Level Check
        student_level = profile.education_level.lower()
        level_match = any(deg.lower() == student_level for deg in opp.degree_levels)
        if level_match:
            checks.append(EligibilityCheck(
                criterion="Education Level",
                status="PASS",
                detail=f"Student level ({profile.education_level}) matches requirement ({', '.join(opp.degree_levels)})."
            ))
        else:
            score -= 30
            fail_count += 1
            checks.append(EligibilityCheck(
                criterion="Education Level",
                status="FAIL",
                detail=f"Student is {profile.education_level}, but opportunity requires {', '.join(opp.degree_levels)}."
            ))

        # 2. Academic / GPA Check
        raw_gpa = float(profile.academic_profile.get("gpa", 0.0) or 0.0)
        max_gpa = float(profile.academic_profile.get("max_gpa", 4.0) or 4.0)
        student_gpa = round((raw_gpa / max_gpa) * 4.0, 2) if max_gpa else raw_gpa
        if opp.min_gpa is not None:
            if student_gpa >= opp.min_gpa:
                checks.append(EligibilityCheck(
                    criterion="Academic Requirement",
                    status="PASS",
                    detail=f"Student CGPA ({raw_gpa}/{max_gpa} ≈ {student_gpa}/4.0) meets minimum required ({opp.min_gpa})."
                ))
            else:
                score -= 25
                fail_count += 1
                checks.append(EligibilityCheck(
                    criterion="Academic Requirement",
                    status="FAIL",
                    detail=f"Student CGPA ({raw_gpa}/{max_gpa} ≈ {student_gpa}/4.0) is below minimum requirement ({opp.min_gpa})."
                ))
        else:
            checks.append(EligibilityCheck(
                criterion="Academic Requirement",
                status="PASS",
                detail="No minimum GPA restriction specified."
            ))

        # 3. Income / Financial Need Check
        student_income = profile.financial_constraints.get("annual_family_income_inr", 0)
        if opp.max_family_income_inr is not None:
            if student_income <= opp.max_family_income_inr:
                checks.append(EligibilityCheck(
                    criterion="Financial Eligibility",
                    status="PASS",
                    detail=f"Family income (₹{student_income:,}) is within ceiling (₹{opp.max_family_income_inr:,})."
                ))
            else:
                score -= 30
                fail_count += 1
                checks.append(EligibilityCheck(
                    criterion="Financial Eligibility",
                    status="FAIL",
                    detail=f"Family income (₹{student_income:,}) exceeds limit of ₹{opp.max_family_income_inr:,}."
                ))
        else:
            checks.append(EligibilityCheck(
                criterion="Financial Eligibility",
                status="PASS",
                detail="Open to all income brackets."
            ))

        # 4. Target Course Check
        student_course = profile.course.lower()
        course_match = any(
            c.lower() in student_course or student_course in c.lower() or c.lower() == "all courses"
            for c in opp.target_courses
        )
        if course_match:
            checks.append(EligibilityCheck(
                criterion="Course & Field Fit",
                status="PASS",
                detail=f"Course '{profile.course}' matches target areas ({', '.join(opp.target_courses)})."
            ))
        else:
            score -= 15
            checks.append(EligibilityCheck(
                criterion="Course & Field Fit",
                status="WARN",
                detail=f"Course '{profile.course}' is outside primary targets ({', '.join(opp.target_courses)})."
            ))

        # 5. Location / Domicile Check
        student_country = profile.location.get("country", "")
        student_state = profile.location.get("state", "")
        if opp.location_restrictions:
            loc_pass = any(
                loc.lower() in student_country.lower() or loc.lower() in student_state.lower() or loc.lower() == "global"
                for loc in opp.location_restrictions
            )
            if loc_pass:
                checks.append(EligibilityCheck(
                    criterion="Location & Residency",
                    status="PASS",
                    detail=f"Residency ({student_state}, {student_country}) meets regional criteria."
                ))
            else:
                score -= 20
                checks.append(EligibilityCheck(
                    criterion="Location & Residency",
                    status="FAIL",
                    detail=f"Residency does not match restrictions ({', '.join(opp.location_restrictions)})."
                ))
        else:
            checks.append(EligibilityCheck(
                criterion="Location & Residency",
                status="PASS",
                detail="Open globally."
            ))

        # Final Rating
        score = max(0, min(100, score))
        if score >= 80:
            rating = "HIGH"
            reasoning = "High eligibility match! Student qualifies on all primary academic, financial, and degree parameters."
        elif score >= 50:
            rating = "MEDIUM"
            reasoning = "Moderate match. Potential restrictions exist (e.g. minor course misalignment or tight deadline)."
        else:
            rating = "LOW"
            reasoning = "Low eligibility match due to unmet core income, GPA, or degree level criteria."

        return OpportunityEligibility(
            opportunity_id=opp.id,
            title=opp.title,
            category=opp.category,
            amount_inr=opp.amount_inr,
            amount_usd=opp.amount_usd,
            match_score=score,
            rating=rating,
            checks=checks,
            key_reasoning=reasoning
        )
