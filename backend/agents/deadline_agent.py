from typing import List, Dict, Any
from models import (
    Opportunity, 
    StudentProfile, 
    DocumentReuseResponse, 
    DocumentReuseItem, 
    DeadlineCollision
)
from collections import defaultdict

class DeadlineAgent:
    def __init__(self):
        self.agent_name = "Deadline & Follow-up Agent"

    def audit_deadlines(self, opportunities: List[Opportunity]) -> Dict[str, Any]:
        urgent = []
        upcoming = []
        normal = []

        for opp in opportunities:
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

    # 🌟 NEW FEATURE 2: Document Reuse Map & Deadline Collision Detector
    def detect_collisions_and_reuse(self, opportunities: List[Opportunity], profile: StudentProfile) -> DocumentReuseResponse:
        doc_map = defaultdict(list)
        date_map = defaultdict(list)

        for opp in opportunities:
            # Map required documents
            for doc in opp.required_documents:
                doc_map[doc].append(opp.title)
            # Map deadlines
            date_map[opp.deadline].append(opp)

        reusable_items = []
        total_uses = 0

        for doc, titles in doc_map.items():
            reuse_cnt = len(titles)
            total_uses += reuse_cnt
            effort_hours = round(reuse_cnt * 1.5, 1)
            reusable_items.append(DocumentReuseItem(
                document_name=doc,
                required_by_opportunities=titles,
                reuse_count=reuse_cnt,
                effort_saved_hours=effort_hours
            ))

        reusable_items.sort(key=lambda x: x.reuse_count, reverse=True)

        # Detect deadline collisions (opportunities closing within same 7-day window)
        collisions = []
        alerts = []

        for date_str, opps in date_map.items():
            if len(opps) > 1:
                col_titles = [o.title for o in opps]
                col_ids = [o.id for o in opps]
                risk = "HIGH_COLLISION" if any(o.days_left <= 15 for o in opps) else "MODERATE_COLLISION"

                collisions.append(DeadlineCollision(
                    date=date_str,
                    colliding_opportunity_ids=col_ids,
                    colliding_titles=col_titles,
                    window_days=7,
                    risk_level=risk
                ))
                alerts.append(f"🚨 Deadline Collision Alert: {len(opps)} applications due on {date_str} ({', '.join(col_titles[:2])})")

        # Total repetition reduction calculation
        total_reqs = sum(len(o.required_documents) for o in opportunities)
        unique_reqs = len(doc_map)
        if total_reqs > 0:
            repetition_saved_pct = round(((total_reqs - unique_reqs) / float(total_reqs)) * 100.0, 1)
        else:
            repetition_saved_pct = 0.0

        # Timeline Queue
        timeline = []
        sorted_opps = sorted(opportunities, key=lambda x: x.days_left)
        for idx, opp in enumerate(sorted_opps, 1):
            timeline.append({
                "sequence": idx,
                "opportunity_id": opp.id,
                "title": opp.title,
                "deadline": opp.deadline,
                "days_left": opp.days_left,
                "suggested_start": f"Start immediately ({opp.days_left - 3} days before deadline)" if opp.days_left <= 15 else "Paced drafting"
            })

        return DocumentReuseResponse(
            reusable_documents=reusable_items,
            total_repetition_saved_pct=max(0.0, repetition_saved_pct),
            deadline_collisions=collisions,
            collision_alerts=alerts,
            suggested_timeline=timeline
        )
