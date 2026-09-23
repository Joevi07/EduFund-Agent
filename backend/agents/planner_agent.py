from typing import List
from models import StudentProfile, Opportunity, FundingPlan, StrategyItem, StrategySimulateRequest
from agents.eligibility_agent import EligibilityAgent

class PlannerAgent:
    def __init__(self):
        self.agent_name = "Funding Planner Agent"
        self.eligibility_agent = EligibilityAgent()

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
            match_score = eval_result.match_score
            urgency_weight = 1.2 if opp.urgency == "HIGH" else (1.0 if opp.urgency == "MEDIUM" else 0.8)

            ev_inr = round(opp.amount_inr * (match_score / 100.0) * urgency_weight, 2)
            ev_usd = round(opp.amount_usd * (match_score / 100.0) * urgency_weight, 2)

            scored_items.append({
                "opp": opp,
                "match_score": match_score,
                "rating": eval_result.rating,
                "ev_inr": ev_inr,
                "ev_usd": ev_usd
            })

        scored_items.sort(key=lambda x: (x["ev_inr"], x["match_score"]), reverse=True)

        strategy: List[StrategyItem] = []
        potential_coverage_inr = 0.0
        potential_coverage_usd = 0.0

        for rank, item in enumerate(scored_items, 1):
            opp = item["opp"]
            # A portfolio is assembled by expected value, never by nominal award
            # value, so the remaining gap is a realistic planning estimate.
            if item["match_score"] >= 50 and potential_coverage_inr < funding_gap_inr:
                strategy.append(StrategyItem(
                    opportunity_id=opp.id,
                    title=opp.title,
                    category=opp.category,
                    amount_inr=opp.amount_inr,
                    amount_usd=opp.amount_usd,
                    match_score=item["match_score"],
                    expected_value_inr=item["ev_inr"],
                    expected_value_usd=item["ev_usd"],
                    priority_rank=rank,
                    urgency=opp.urgency
                ))
                potential_coverage_inr += item["ev_inr"]
                potential_coverage_usd += item["ev_usd"]

        remaining_gap_inr = max(0.0, funding_gap_inr - potential_coverage_inr)
        remaining_gap_usd = max(0.0, funding_gap_usd - potential_coverage_usd)

        if funding_gap_inr > 0:
            coverage_pct = round(min(100.0, (potential_coverage_inr / funding_gap_inr) * 100.0), 1)
        else:
            coverage_pct = 100.0

        if remaining_gap_inr == 0:
            advice = f"Success! Your strategy stack of {len(strategy)} targeted opportunities fully covers your funding gap of ₹{funding_gap_inr:,.0f}."
        else:
            advice = (
                f"Your strategy potential coverage (₹{potential_coverage_inr:,.0f}) leaves a remaining gap of "
                f"₹{remaining_gap_inr:,.0f}. Focus on top high-EV applications first."
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
            agent_advice=advice
        )

    def simulate_scenario(self, req: StrategySimulateRequest, opportunities: List[Opportunity]) -> FundingPlan:
        # Clone profile and apply scenario parameter overrides
        prof = req.profile.model_copy(deep=True)
        fin = prof.financial_constraints

        # Extra aid & work-study additions
        original_aid = fin.get("confirmed_aid_inr", 60000.0)
        new_aid = original_aid + req.increased_family_aid_inr + req.extra_work_study_inr
        fin["confirmed_aid_inr"] = new_aid

        plan = self.generate_plan(prof, opportunities)
        plan.agent_advice = (
            f"Scenario Simulation Active: Added ₹{req.increased_family_aid_inr:,.0f} aid + ₹{req.extra_work_study_inr:,.0f} work-study. "
            f"Target coverage target: {req.desired_coverage_target_pct}%."
        )
        return plan
