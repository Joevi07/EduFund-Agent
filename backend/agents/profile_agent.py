from models import StudentProfile

class ProfileAgent:
    def __init__(self):
        self.agent_name = "Profile Agent"

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
            "status": "PROFILE_PARSED_SUCCESS"
        }
