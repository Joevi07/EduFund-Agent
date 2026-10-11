from typing import List

from agents.eligibility_agent import EligibilityAgent
from models import FundingPlan, Opportunity, StrategyItem, StrategySimulateRequest, StudentProfile


class PlannerAgent:
    def __init__(self):
        self.agent_name = "Funding Planner Agent"
        self.eligibility_agent = EligibilityAgent()

    @staticmethod
    def _deadline_urgency_score(days_left: int) -> int:
        if days_left < 0:
            return 0
        if days_left <= 14:
            return 100
        if days_left <= 30:
            return 75
        if days_left <= 60:
            return 50
        return 25

    def generate_plan(self, profile: StudentProfile, opportunities: List[Opportunity]) -> FundingPlan:
        fin = profile.financial_constraints
        target_cost_inr = fin.get("target_annual_cost_inr", 120000.0)
        confirmed_aid_inr = fin.get("confirmed_aid_inr", 60000.0)
        funding_gap_inr = max(0.0, target_cost_inr - confirmed_aid_inr)

        usd_rate = 83.0
        target_cost_usd = round(target_cost_inr / usd_rate, 2)
        confirmed_aid_usd = round(confirmed_aid_inr / usd_rate, 2)
        funding_gap_usd = round(funding_gap_inr / usd_rate, 2)

        scored_items = []
        for opp in opportunities:
            eval_result = self.eligibility_agent.evaluate_opportunity(profile, opp)
            match_score = max(0, min(100, eval_result.match_score))
            funding_relevance_score = (
                min(100.0, max(0.0, (opp.amount_inr / funding_gap_inr) * 100.0))
                if funding_gap_inr > 0
                else 0.0
            )
            deadline_urgency_score = self._deadline_urgency_score(opp.days_left)
            application_priority_score = round(
                (match_score * 0.55)
                + (funding_relevance_score * 0.25)
                + (deadline_urgency_score * 0.20),
                1,
            )

            scored_items.append({
                "opp": opp,
                "match_score": match_score,
                "funding_relevance_score": round(funding_relevance_score, 1),
                "deadline_urgency_score": deadline_urgency_score,
                "application_priority_score": application_priority_score,
            })

        scored_items.sort(
            key=lambda item: (
                item["application_priority_score"],
                item["match_score"],
                item["opp"].amount_inr,
            ),
            reverse=True,
        )

        strategy: List[StrategyItem] = []
        potential_coverage_inr = 0.0

        for item in scored_items:
            opp = item["opp"]
            if opp.days_left >= 0 and item["match_score"] >= 50 and potential_coverage_inr < funding_gap_inr:
                strategy.append(StrategyItem(
                    opportunity_id=opp.id,
                    title=opp.title,
                    category=opp.category,
                    amount_inr=opp.amount_inr,
                    amount_usd=opp.amount_usd,
                    match_score=item["match_score"],
                    funding_relevance_score=item["funding_relevance_score"],
                    deadline_urgency_score=item["deadline_urgency_score"],
                    application_priority_score=item["application_priority_score"],
                    priority_rank=len(strategy) + 1,
                    urgency=opp.urgency,
                ))
                potential_coverage_inr = min(funding_gap_inr, potential_coverage_inr + opp.amount_inr)

        remaining_gap_inr = max(0.0, funding_gap_inr - potential_coverage_inr)
        potential_coverage_usd = round(potential_coverage_inr / usd_rate, 2)
        remaining_gap_usd = round(remaining_gap_inr / usd_rate, 2)

        if funding_gap_inr > 0:
            coverage_pct = round(min(100.0, (potential_coverage_inr / funding_gap_inr) * 100.0), 1)
        else:
            coverage_pct = 100.0

        if funding_gap_inr == 0:
            advice = "Confirmed aid currently covers the target annual cost, so there is no remaining funding gap to prioritize."
        elif remaining_gap_inr == 0:
            advice = (
                f"The listed award amounts in your {len(strategy)} highest-priority applications could cover "
                f"your ₹{funding_gap_inr:,.0f} gap. Awards are not guaranteed."
            )
        else:
            advice = (
                f"Listed awards in the priority strategy could cover ₹{potential_coverage_inr:,.0f}, leaving "
                f"₹{remaining_gap_inr:,.0f}. Use the priority score to decide where to apply first; "
                "it is not an award probability."
            )

        return FundingPlan(
            total_cost_inr=target_cost_inr,
            total_cost_usd=target_cost_usd,
            confirmed_aid_inr=confirmed_aid_inr,
            confirmed_aid_usd=confirmed_aid_usd,
            funding_gap_inr=funding_gap_inr,
            funding_gap_usd=funding_gap_usd,
            potential_coverage_inr=potential_coverage_inr,
            potential_coverage_usd=potential_coverage_usd,
            remaining_gap_inr=remaining_gap_inr,
            remaining_gap_usd=remaining_gap_usd,
            coverage_percentage=coverage_pct,
            recommended_strategy=strategy,
            agent_advice=advice,
        )

    def simulate_scenario(self, req: StrategySimulateRequest, opportunities: List[Opportunity]) -> FundingPlan:
        prof = req.profile.model_copy(deep=True)
        fin = prof.financial_constraints

        original_aid = fin.get("confirmed_aid_inr", 60000.0)
        new_aid = original_aid + req.increased_family_aid_inr + req.extra_work_study_inr
        fin["confirmed_aid_inr"] = new_aid

        plan = self.generate_plan(prof, opportunities)
        plan.agent_advice = (
            f"Scenario Simulation Active: Added ₹{req.increased_family_aid_inr:,.0f} aid + "
            f"₹{req.extra_work_study_inr:,.0f} work-study. "
            f"Target coverage target: {req.desired_coverage_target_pct}%."
        )
        return plan
