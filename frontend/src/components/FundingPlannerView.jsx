import React from "react";
import { Target, TrendingUp, Zap, Sliders } from "lucide-react";
import StrategySimulatorWidget from "./StrategySimulatorWidget";

export default function FundingPlannerView({ plan, profile, currency, onNavigate, onScenarioResult }) {
  const isINR = currency === "INR";
  const sym = isINR ? "₹" : "$";
  const formatAmt = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;

  const gap = isINR ? plan.funding_gap_inr : plan.funding_gap_usd;
  const coverage = isINR ? plan.potential_coverage_inr : plan.potential_coverage_usd;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
          <Target size={22} color="var(--neon-indigo)" />
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Agent 3 — Funding Planner Strategy Engine</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Solves for optimal funding coverage to close the Education Funding Gap using Expected Value ($EV$).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* FinTech Gap Breakdown Card */}
        <div className="bento-box" style={{ background: "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(5,8,17,0.95))" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>Education Funding Equation</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.85rem", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Total Annual Cost</span>
              <strong style={{ fontSize: "1.1rem" }}>{formatAmt(plan.total_cost_inr, plan.total_cost_usd)}</strong>
            </div>

            <div style={{ background: "rgba(16,185,129,0.08)", padding: "0.85rem", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--neon-emerald)" }}>Confirmed Aid</span>
              <strong style={{ fontSize: "1.1rem", color: "var(--neon-emerald)" }}>− {formatAmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd)}</strong>
            </div>

            <div style={{ background: "rgba(245,158,11,0.08)", padding: "0.85rem", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", border: "1px solid rgba(245,158,11,0.3)" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--neon-amber)" }}>Remaining Funding Gap</span>
              <strong style={{ fontSize: "1.2rem", color: "var(--neon-amber)" }}>= {formatAmt(plan.funding_gap_inr, plan.funding_gap_usd)}</strong>
            </div>
          </div>

          <div style={{ marginTop: "1rem", padding: "0.8rem", background: "rgba(99, 102, 241, 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(99, 102, 241, 0.25)", fontSize: "0.82rem", color: "#a5b4fc" }}>
            🤖 <strong>Planner Agent Guidance:</strong> {plan.agent_advice}
          </div>
        </div>

        {/* Live Scenario Simulator */}
        <div className="bento-box">
          <StrategySimulatorWidget 
            profile={profile}
            currency={currency}
            onScenarioResult={onScenarioResult}
          />
        </div>
      </div>

      {/* Portfolio Strategy Stack Table */}
      <div className="bento-box">
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={18} color="var(--neon-emerald)" /> Expected Value (EV) Strategy Portfolio
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "0.75rem" }}>RANK</th>
                <th style={{ padding: "0.75rem" }}>OPPORTUNITY</th>
                <th style={{ padding: "0.75rem" }}>CATEGORY</th>
                <th style={{ padding: "0.75rem" }}>AMOUNT</th>
                <th style={{ padding: "0.75rem" }}>MATCH SCORE</th>
                <th style={{ padding: "0.75rem" }}>EXPECTED VALUE</th>
                <th style={{ padding: "0.75rem" }}>URGENCY</th>
                <th style={{ padding: "0.75rem" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {plan.recommended_strategy.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <span className="badge badge-indigo">#{item.priority_rank}</span>
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: 600 }}>{item.title}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-primary)" }}>
                      {item.category}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: 700 }}>
                    {formatAmt(item.amount_inr, item.amount_usd)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className="badge badge-high">{item.match_score}% MATCH</span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "var(--neon-emerald)", fontWeight: 700 }}>
                    {formatAmt(item.expected_value_inr, item.expected_value_usd)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span className={`badge badge-${item.urgency.toLowerCase()}`}>{item.urgency}</span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
                      onClick={() => onNavigate("autopilot")}
                    >
                      Autopilot Studio <Zap size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
