from typing import List, Dict, Any
from agents.eligibility_agent import EligibilityAgent
from models import (
    FundingPlan,
    Opportunity,
    StrategyItem,
    StrategySimulateRequest,
    StudentProfile,
    FundingGapRescuePlan,
    RescuePlanComponent,
    PortfolioDiversityGuardrail,
)


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

    def evaluate_portfolio_diversity(
        self, strategy: List[StrategyItem], opportunities: List[Opportunity]
    ) -> PortfolioDiversityGuardrail:
        opp_map = {o.id: o for o in opportunities}
        category_counts: Dict[str, int] = {}
        country_counts: Dict[str, int] = {}
        source_counts: Dict[str, int] = {}

        for item in strategy:
            category_counts[item.category] = category_counts.get(item.category, 0) + 1
            opp = opp_map.get(item.opportunity_id)
            if opp:
                # Country / Jurisdiction
                country = opp.country if hasattr(opp, "country") and opp.country else "India"
                if opp.location_restrictions and "Global" in opp.location_restrictions:
                    country = "Global"
                country_counts[country] = country_counts.get(country, 0) + 1

                # Source type based on provider
                prov = opp.provider.lower()
                if "government" in prov or "ministry" in prov or "aicte" in prov or "department" in prov or "ugc" in prov:
                    source_type = "Government"
                elif "foundation" in prov or "trusts" in prov:
                    source_type = "Philanthropic Foundation"
                elif "google" in prov or "corporate" in prov:
                    source_type = "Corporate STEM"
                else:
                    source_type = "Institutional"
                source_counts[source_type] = source_counts.get(source_type, 0) + 1

        total_apps = len(strategy)
        warnings: List[str] = []
        recommendations: List[str] = []

        if total_apps == 0:
            return PortfolioDiversityGuardrail(
                concentration_score=0,
                risk_level="BALANCED",
                source_breakdown=source_counts,
                country_breakdown=country_counts,
                category_breakdown=category_counts,
                warnings=["No applications currently selected in your portfolio."],
                recommendations=["Select at least 2 opportunities across different categories to establish a strategy."],
            )

        # Check category over-reliance
        scholarship_only = category_counts.get("Scholarship", 0) == total_apps
        if scholarship_only and total_apps >= 2:
            warnings.append(f"Your plan depends entirely on {total_apps} competitive scholarships without institutional safety nets.")
            recommendations.append("Add one fee-waiver or institutional grant to protect your funding baseline.")

        # Check source over-reliance
        for source, count in source_counts.items():
            if total_apps >= 2 and (count / total_apps) >= 0.75:
                warnings.append(f"{round((count/total_apps)*100)}% of your applications rely on {source} sources.")
                recommendations.append(f"Diversify beyond {source} by including private, corporate, or university-direct aid.")

        # Check country over-reliance
        for country, count in country_counts.items():
            if total_apps >= 3 and (count / total_apps) == 1.0:
                warnings.append(f"All target applications are concentrated in a single jurisdiction ({country}).")
                recommendations.append("Consider international or cross-border fellowship options to widen opportunities.")

        # Calculate concentration score (0 = perfectly diverse, 100 = single point of failure)
        max_cat_pct = max(category_counts.values()) / total_apps if total_apps else 0
        max_src_pct = max(source_counts.values()) / total_apps if total_apps else 0
        concentration_score = int(round(((max_cat_pct * 0.5) + (max_src_pct * 0.5)) * 100))

        if concentration_score >= 80:
            risk_level = "HIGH_RISK"
        elif concentration_score >= 60:
            risk_level = "MODERATE_RISK"
        else:
            risk_level = "BALANCED"

        if not recommendations:
            recommendations.append("Portfolio is well-balanced across award types and provider institutions.")

        return PortfolioDiversityGuardrail(
            concentration_score=concentration_score,
            risk_level=risk_level,
            source_breakdown=source_counts,
            country_breakdown=country_counts,
            category_breakdown=category_counts,
            warnings=warnings,
            recommendations=recommendations,
        )

    def build_funding_gap_rescue_plan(
        self,
        funding_gap_inr: float,
        potential_coverage_inr: float,
        usd_rate: float = 83.0,
    ) -> FundingGapRescuePlan:
        uncovered_after_scholarships = max(0.0, funding_gap_inr - potential_coverage_inr)

        # Layer 1: Scholarship Portfolio
        scholarship_component = RescuePlanComponent(
            layer="Scholarship Portfolio",
            title="Merit & Need Scholarship Pipeline",
            amount_inr=potential_coverage_inr,
            amount_usd=round(potential_coverage_inr / usd_rate, 2),
            description="Anticipated award pool from top-ranked applications in your portfolio.",
            checklist=[
                "Confirm eligibility criteria against official provider guidelines",
                "Complete tailored essay statement and peer review",
                "Submit all verified documents before published deadline",
            ],
            action_label="Prioritize in Autopilot Studio",
        )

        # Layer 2: Institutional Fee-Waiver Options
        # Estimated realistic waiver (e.g. 25-50% tuition or up to ₹30,000)
        fee_waiver_est = min(uncovered_after_scholarships, 30000.0) if uncovered_after_scholarships > 0 else (25000.0 if funding_gap_inr > 0 else 0.0)
        uncovered_after_waivers = max(0.0, uncovered_after_scholarships - fee_waiver_est)

        fee_waiver_component = RescuePlanComponent(
            layer="Fee-Waiver Options",
            title="Institutional Tuition Fee Waiver (TFW) & Concessions",
            amount_inr=fee_waiver_est,
            amount_usd=round(fee_waiver_est / usd_rate, 2),
            description="University and state board tuition fee waivers for economically weaker meritorious students.",
            checklist=[
                "Verify family income certificate with tehsildar/revenue authority",
                "Apply during semester registration to college finance office",
                "Maintain minimum 75% attendance and CGPA 7.0 for renewal",
            ],
            action_label="Submit college fee-waiver request",
        )

        # Layer 3: Work-Study or Part-Time Support Estimate
        # Estimated 10-15 hrs/month tutoring or TA (approx ₹20,000 / year)
        work_study_est = min(uncovered_after_waivers, 20000.0) if uncovered_after_waivers > 0 else (15000.0 if funding_gap_inr > 0 else 0.0)
        uncovered_after_work = max(0.0, uncovered_after_waivers - work_study_est)

        work_study_component = RescuePlanComponent(
            layer="Work-Study Support",
            title="Campus Teaching / Lab Assistantship & Peer Mentorship",
            amount_inr=work_study_est,
            amount_usd=round(work_study_est / usd_rate, 2),
            description="On-campus student employment, lab assisting, or peer coaching (10–12 hours/week).",
            checklist=[
                "Register with departmental student employment coordinator",
                "Submit CV highlighting technical coursework & past projects",
                "Align weekly working hours with academic lecture timetable",
            ],
            action_label="Explore campus job board",
        )

        # Layer 4: Education Loan Readiness Checklist (Fallback Bridge)
        loan_est = uncovered_after_work  # Closes whatever remains!
        remaining_gap = max(0.0, uncovered_after_work - loan_est)

        loan_component = RescuePlanComponent(
            layer="Education Loan Readiness",
            title="Priority Sector Education Loan (Vidya Lakshmi Scheme)",
            amount_inr=loan_est,
            amount_usd=round(loan_est / usd_rate, 2),
            description="Low-interest, government-subsidized collateral-free student loan covering residual educational gap.",
            checklist=[
                "Register on the official PM Vidya Lakshmi student loan portal",
                "Gather co-applicant KYC documents & latest 2 years ITR",
                "Obtain official admission letter & approved college fee schedule",
                "Apply for Central Sector Interest Subsidy (CSIS) during moratorium",
            ],
            action_label="Review loan readiness checklist",
        )

        components = [scholarship_component, fee_waiver_component, work_study_component, loan_component]
        total_covered = potential_coverage_inr + fee_waiver_est + work_study_est + loan_est

        if funding_gap_inr == 0:
            summary = "No funding gap currently exists. Your confirmed financial aid completely satisfies the target educational cost."
        elif remaining_gap == 0:
            summary = (
                f"Multi-layered Rescue Plan covers 100% of your ₹{funding_gap_inr:,.0f} gap: "
                f"₹{potential_coverage_inr:,.0f} from targeted scholarships, ₹{fee_waiver_est:,.0f} institutional waiver, "
                f"₹{work_study_est:,.0f} work-study, and ₹{loan_est:,.0f} through low-interest loan readiness."
            )
        else:
            summary = f"Rescue strategy addresses ₹{total_covered:,.0f} of your educational gap, leaving ₹{remaining_gap:,.0f}."

        return FundingGapRescuePlan(
            funding_gap_inr=funding_gap_inr,
            funding_gap_usd=round(funding_gap_inr / usd_rate, 2),
            scholarship_coverage_inr=potential_coverage_inr,
            scholarship_coverage_usd=round(potential_coverage_inr / usd_rate, 2),
            fee_waiver_coverage_inr=fee_waiver_est,
            fee_waiver_coverage_usd=round(fee_waiver_est / usd_rate, 2),
            work_study_coverage_inr=work_study_est,
            work_study_coverage_usd=round(work_study_est / usd_rate, 2),
            loan_coverage_inr=loan_est,
            loan_coverage_usd=round(loan_est / usd_rate, 2),
            remaining_gap_after_plan_inr=remaining_gap,
            remaining_gap_after_plan_usd=round(remaining_gap / usd_rate, 2),
            rescue_strategy_summary=summary,
            components=components,
        )

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
        eligibility_evaluations = []
        for opp in opportunities:
            eval_result = self.eligibility_agent.evaluate_opportunity(profile, opp)
            eligibility_evaluations.append(eval_result)
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

        # Build Rescue Plan & Diversity Guardrail
        rescue_plan = self.build_funding_gap_rescue_plan(funding_gap_inr, potential_coverage_inr, usd_rate)
        diversity_guardrail = self.evaluate_portfolio_diversity(strategy, opportunities)

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
            eligibility_evaluations=eligibility_evaluations,
            agent_advice=advice,
            rescue_plan=rescue_plan,
            diversity_guardrail=diversity_guardrail,
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
