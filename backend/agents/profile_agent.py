from typing import Dict, Any, List
from models import StudentProfile, ProfileCompletionCoach

class ProfileAgent:
    def __init__(self):
        self.agent_name = "Profile Agent"

    def coach_profile(self, profile: StudentProfile) -> ProfileCompletionCoach:
        """
        Analyzes student profile completeness, missing elements, and unlocks.
        """
        checks = [
            ("Education Level", bool((profile.education_level or "").strip()), "Specify your academic degree level"),
            ("Course / Field", bool((profile.course or "").strip()), "Add your major or specialization"),
            ("GPA & Grading Scale", bool(profile.academic_profile.get("gpa") and profile.academic_profile.get("max_gpa")), "Provide current CGPA and scale"),
            ("Year of Study", bool((profile.academic_profile.get("year_of_study") or "").strip()), "Indicate current academic year"),
            ("Standardized Test / Rank", bool((profile.academic_profile.get("standardized_test") or "").strip()), "Add entrance exam scores or percentiles"),
            ("Country & Region", bool(profile.location.get("country") and (profile.location.get("state") or profile.location.get("city"))), "Specify country and state/region"),
            ("Study Destination", bool((profile.location.get("study_destination") or "").strip()), "Add target study country preferences"),
            ("Family Income", bool(profile.financial_constraints.get("annual_family_income_inr")), "Provide annual family income for need-based matching"),
            ("Annual Education Cost", bool(profile.financial_constraints.get("target_annual_cost_inr")), "Set target tuition & living cost"),
            ("Achievements", bool(profile.achievements and len(profile.achievements) > 0), "List awards, projects, or leadership roles"),
            ("Interests & Skills", bool(profile.interests and len(profile.interests) > 0), "Add research or domain interests"),
        ]

        completed = [item[0] for item in checks if item[1]]
        missing = [
            {"field": item[0], "hint": item[2]}
            for item in checks if not item[1]
        ]
        percentage = int(round((len(completed) / len(checks)) * 100))

        if percentage >= 90:
            improvement = "Profile is fully optimized! Maximum eligibility matching and scholarship discovery active."
        elif percentage >= 70:
            improvement = f"Completing {len(missing)} missing field{'s' if len(missing) != 1 else ''} will unlock up to +35% more matched opportunities and verified eligibility checks."
        elif percentage >= 40:
            improvement = f"Completing {len(missing)} missing fields will unlock up to +60% more funding opportunities and tailored essay assistance."
        else:
            improvement = "Complete foundational profile fields to enable multi-agent eligibility matching and funding planning."

        quick_tips = [
            "Accurate family income unlocks merit-cum-means scholarships and fee waivers.",
            "Adding achievements helps the Autopilot Studio generate evidence-backed draft essays.",
            "Listing standardized test percentiles improves merit rank matching.",
        ]

        return ProfileCompletionCoach(
            completion_percentage=percentage,
            completed_fields=completed,
            missing_fields=missing,
            estimated_improvement=improvement,
            quick_tips=quick_tips,
        )

    def process_profile(self, profile: StudentProfile) -> dict:
        """
        Normalizes student profile and calculates financial baseline metrics.
        """
        fin = profile.financial_constraints
        target_cost_inr = fin.get("target_annual_cost_inr", 120000)
        confirmed_aid_inr = fin.get("confirmed_aid_inr", 60000)
        funding_gap_inr = max(0.0, target_cost_inr - confirmed_aid_inr)
        
        # USD conversion at approximate 1 USD = 83 INR
        usd_rate = 83.0
        target_cost_usd = round(target_cost_inr / usd_rate, 2)
        confirmed_aid_usd = round(confirmed_aid_inr / usd_rate, 2)
        funding_gap_usd = round(funding_gap_inr / usd_rate, 2)

        coach_data = self.coach_profile(profile)

        return {
            "student_id": profile.id,
            "student_name": profile.name,
            "course": profile.course,
            "education_level": profile.education_level,
            "financial_summary": {
                "target_cost_inr": target_cost_inr,
                "target_cost_usd": target_cost_usd,
                "confirmed_aid_inr": confirmed_aid_inr,
                "confirmed_aid_usd": confirmed_aid_usd,
                "funding_gap_inr": funding_gap_inr,
                "funding_gap_usd": funding_gap_usd,
                "gap_percentage": round((funding_gap_inr / target_cost_inr) * 100, 1) if target_cost_inr > 0 else 0
            },
            "achievements_count": len(profile.achievements),
            "coach": coach_data.model_dump(),
            "status": "PROFILE_PARSED_SUCCESS"
        }
