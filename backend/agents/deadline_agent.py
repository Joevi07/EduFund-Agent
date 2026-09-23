from typing import List, Dict, Any
from datetime import date
from models import Opportunity

class DeadlineAgent:
    def __init__(self):
        self.agent_name = "Deadline & Follow-up Agent"

    def audit_deadlines(self, opportunities: List[Opportunity]) -> Dict[str, Any]:
        """
        Groups opportunities by deadline urgency and calculates risk alerts.
        """
        urgent = []
        upcoming = []
        normal = []

        for opp in opportunities:
            try:
                days = (date.fromisoformat(opp.deadline) - date.today()).days
            except ValueError:
                days = opp.days_left
            item = {
                "id": opp.id,
                "title": opp.title,
                "provider": opp.provider,
                "deadline": opp.deadline,
                "days_left": days,
                "urgency": opp.urgency,
                "amount_inr": opp.amount_inr,
                "amount_usd": opp.amount_usd
            }
            if days <= 15:
                urgent.append(item)
            elif days <= 45:
                upcoming.append(item)
            else:
                normal.append(item)

        urgent.sort(key=lambda x: x["days_left"])
        upcoming.sort(key=lambda x: x["days_left"])

        alerts = []
        if urgent:
            alerts.append(f"⚠️ URGENT: {len(urgent)} funding opportunity deadlines closing within 15 days!")
        if upcoming:
            alerts.append(f"📅 UPCOMING: {len(upcoming)} opportunities due within 45 days.")

        return {
            "urgent_count": len(urgent),
            "upcoming_count": len(upcoming),
            "normal_count": len(normal),
            "urgent_items": urgent,
            "upcoming_items": upcoming,
            "normal_items": normal,
            "alerts": alerts
        }
