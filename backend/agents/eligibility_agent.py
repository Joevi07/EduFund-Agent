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
        )
