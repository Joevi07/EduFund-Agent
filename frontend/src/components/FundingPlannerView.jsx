import React from "react";
import { Target, TrendingUp, Zap, Calculator, Bot, ShieldCheck, AlertTriangle } from "lucide-react";
import StrategySimulatorWidget from "./StrategySimulatorWidget";

export default function FundingPlannerView({ plan, profile, currency, onNavigate, onScenarioResult }) {
  const isINR = currency === "INR";
  const fmt   = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;

  const equations = [
    { label:"Total Annual Cost",     val: fmt(plan.total_cost_inr, plan.total_cost_usd),       op:"",  color:"var(--text-primary)",  bg:"rgba(255,255,255,.7)" },
    { label:"Confirmed Aid",         val:`− ${fmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd)}`, op:"-", color:"var(--accent-sage)",  bg:"rgba(41,165,87,.08)", border:"rgba(41,165,87,.2)" },
    { label:"Remaining Funding Gap", val:`= ${fmt(plan.funding_gap_inr, plan.funding_gap_usd)}`, op:"=",  color:"var(--amber-500)",     bg:"rgba(217,119,6,.08)", border:"rgba(217,119,6,.2)" },
  ];

  const urgencyColor = (u) => u === "HIGH" ? "badge-low" : u === "MEDIUM" ? "badge-medium" : "badge-high";
  const confidence = plan.confidence || {
    guaranteed_inr: plan.confirmed_aid_inr,
    probable_inr: Math.round(plan.potential_coverage_inr * .65),
    possible_inr: Math.round(plan.potential_coverage_inr * .35),
    remaining_risk_inr: plan.remaining_gap_inr,
    confidence_score: plan.coverage_percentage,
    explanation: "Confidence separates confirmed funding from likely and possible outcomes.",
  };
  const confidenceParts = [
    { label:"Guaranteed", value:confidence.guaranteed_inr, color:"#29a557" },
    { label:"Probable", value:confidence.probable_inr, color:"#12a3a5" },
    { label:"Possible", value:confidence.possible_inr, color:"#6366f1" },
    { label:"Risk", value:confidence.remaining_risk_inr, color:"#d97706" },
  ];
  const fmtInr = (amount) => isINR ? `₹${Math.round(amount).toLocaleString()}` : `$${Math.round(amount / 83).toLocaleString()}`;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

      {/* ── Heading ── */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".3rem" }}>
          <div style={{ background:"linear-gradient(135deg,var(--teal-500),var(--teal-600))", borderRadius:9, padding:7, boxShadow:"0 3px 12px rgba(18,163,165,.3)" }}>
            <Target size={18} color="#fff"/>
          </div>
          <h2 style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-.035em" }}>Funding Planner — Strategy Engine</h2>
        </div>
        <p style={{ color:"var(--text-secondary)", fontSize:".88rem", marginLeft:"2.5rem" }}>
          Solves for optimal coverage using Expected Value (EV) to close your education funding gap.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:"1.4rem" }}>

        {/* Funding equation card */}
        <div className="bento-box" style={{ background:"linear-gradient(145deg,rgba(14,122,124,.94),rgba(8,100,100,.97))", border:"1px solid rgba(255,255,255,.18)" }}>
          <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:"#fff", marginBottom:"1.1rem", display:"flex", alignItems:"center", gap:".45rem" }}>
            <Calculator size={18}/> Funding Equation
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
            {equations.map(({ label, val, color, bg, border }) => (
              <div key={label} style={{
                background: bg || "rgba(255,255,255,.1)",
                border: `1px solid ${border || "rgba(255,255,255,.15)"}`,
                backdropFilter:"blur(8px)",
                padding:".85rem 1rem", borderRadius:10,
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:".82rem", color: border ? color : "rgba(255,255,255,.8)", fontWeight:500 }}>{label}</span>
                <strong style={{ fontSize:"1.1rem", color: border ? color : "#fff", fontWeight:800 }}>{val}</strong>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"1rem", padding:".8rem 1rem", background:"rgba(255,255,255,.08)", backdropFilter:"blur(8px)", borderRadius:10, border:"1px solid rgba(255,255,255,.15)", fontSize:".82rem", color:"rgba(255,255,255,.85)", lineHeight:1.5 }}>
            <Bot size={16} style={{ verticalAlign:"middle", marginRight:".35rem" }}/><strong style={{ color:"#fff" }}>Planner Agent:</strong> {plan.agent_advice}
          </div>
        </div>

        {/* Scenario Simulator */}
        <div className="bento-box">
          <StrategySimulatorWidget profile={profile} currency={currency} onScenarioResult={onScenarioResult}/>
        </div>
      </div>

      <div className="bento-box confidence-meter">
        <div className="confidence-heading">
          <div>
            <h3><ShieldCheck size={18} color="var(--accent-teal)"/> Funding Confidence Meter</h3>
            <p>Expected-value outlook for this plan. It is a decision aid, not an award guarantee.</p>
          </div>
          <div className="confidence-score"><strong>{confidence.confidence_score}%</strong><span>coverage confidence</span></div>
        </div>
        <div className="confidence-track" aria-label="Funding confidence breakdown">
          {confidenceParts.map(part => <span key={part.label} style={{ width:`${Math.max(2, (part.value / Math.max(plan.total_cost_inr, 1)) * 100)}%`, background:part.color }} />)}
        </div>
        <div className="confidence-legend">
          {confidenceParts.map(part => <div key={part.label}><i style={{ background:part.color }}/><span>{part.label}</span><strong>{fmtInr(part.value)}</strong></div>)}
        </div>
        <div className="confidence-note"><AlertTriangle size={14}/>{confidence.explanation}</div>
      </div>

      {/* Strategy table */}
      <div className="bento-box">
        <h3 style={{ fontSize:"1.05rem", fontWeight:700, marginBottom:"1.1rem", display:"flex", alignItems:"center", gap:".5rem" }}>
          <TrendingUp size={18} color="var(--accent-sage)"/> EV Strategy Portfolio
        </h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"left", fontSize:".84rem" }}>
            <thead>
              <tr style={{ borderBottom:"2px solid var(--border-subtle)" }}>
                {["Rank","Opportunity","Category","Amount","Match","EV","Urgency","Action"].map(h => (
                  <th key={h} style={{ padding:".7rem .75rem", color:"var(--text-muted)", fontWeight:700, fontSize:".7rem", textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.recommended_strategy.map((item, idx) => (
                <tr key={idx} style={{ borderBottom:"1px solid var(--border-subtle)", transition:"background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(18,163,165,.04)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:".75rem" }}><span className="badge badge-indigo">#{item.priority_rank}</span></td>
                  <td style={{ padding:".75rem", fontWeight:700, color:"var(--text-primary)", maxWidth:200 }}>{item.title}</td>
                  <td style={{ padding:".75rem" }}><span className="badge badge-teal">{item.category}</span></td>
                  <td style={{ padding:".75rem", fontWeight:700 }}>{fmt(item.amount_inr, item.amount_usd)}</td>
                  <td style={{ padding:".75rem" }}><span className="badge badge-high">{item.match_score}%</span></td>
                  <td style={{ padding:".75rem", color:"var(--accent-sage)", fontWeight:800 }}>{fmt(item.expected_value_inr, item.expected_value_usd)}</td>
                  <td style={{ padding:".75rem" }}><span className={`badge ${urgencyColor(item.urgency)}`}>{item.urgency}</span></td>
                  <td style={{ padding:".75rem" }}>
                    <button className="btn-primary" style={{ padding:".35rem .75rem", fontSize:".75rem" }} onClick={() => onNavigate("autopilot")}>
                      Autopilot <Zap size={12}/>
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
