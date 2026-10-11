import React from "react";
import { Bot, Calculator, Info, Target, TrendingUp, Zap } from "lucide-react";
import StrategySimulatorWidget from "./StrategySimulatorWidget";

export default function FundingPlannerView({ plan, profile, currency, onNavigate, onScenarioResult }) {
  const isINR = currency === "INR";
  const fmt = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;
  const hasFundingGap = plan.funding_gap_inr > 0;
  const coveragePercentage = hasFundingGap ? Math.min(100, plan.coverage_percentage || 0) : 100;

  const equations = [
    { label:"Total Annual Cost", val:fmt(plan.total_cost_inr, plan.total_cost_usd), color:"var(--text-primary)", bg:"rgba(255,255,255,.7)" },
    { label:"Confirmed Aid", val:`− ${fmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd)}`, color:"var(--accent-sage)", bg:"rgba(41,165,87,.08)", border:"rgba(41,165,87,.2)" },
    { label:"Remaining Funding Gap", val:`= ${fmt(plan.funding_gap_inr, plan.funding_gap_usd)}`, color:"var(--amber-500)", bg:"rgba(217,119,6,.08)", border:"rgba(217,119,6,.2)" },
  ];

  const priorityFactors = [
    { weight:"55%", label:"Eligibility / match strength", detail:"How closely the profile fits the published eligibility criteria." },
    { weight:"25%", label:"Funding relevance", detail:"Award amount ÷ remaining funding gap, capped at 100." },
    { weight:"20%", label:"Deadline urgency", detail:"100 at 0–14 days, 75 at 15–30, 50 at 31–60, and 25 beyond 60." },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".3rem" }}>
          <div style={{ background:"linear-gradient(135deg,var(--teal-500),var(--teal-600))", borderRadius:9, padding:7, boxShadow:"0 3px 12px rgba(18,163,165,.3)" }}>
            <Target size={18} color="#fff"/>
          </div>
          <h2 style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-.035em" }}>Funding Planner — Strategy Engine</h2>
        </div>
        <p style={{ color:"var(--text-secondary)", fontSize:".88rem", marginLeft:"2.5rem" }}>
          Ranks applications with a transparent priority score while keeping advertised award amounts separate.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:"1.4rem" }}>
        <div className="bento-box" style={{ background:"linear-gradient(145deg,rgba(14,122,124,.94),rgba(8,100,100,.97))", border:"1px solid rgba(255,255,255,.18)" }}>
          <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:"#fff", marginBottom:"1.1rem", display:"flex", alignItems:"center", gap:".45rem" }}>
            <Calculator size={18}/> Funding Equation
          </h3>
          <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
            {equations.map(({ label, val, color, bg, border }) => (
              <div key={label} style={{
                background:bg,
                border:`1px solid ${border || "rgba(255,255,255,.15)"}`,
                backdropFilter:"blur(8px)", padding:".85rem 1rem", borderRadius:10,
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:".82rem", color:border ? color : "rgba(255,255,255,.8)", fontWeight:500 }}>{label}</span>
                <strong style={{ fontSize:"1.1rem", color:border ? color : "#fff", fontWeight:800 }}>{val}</strong>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"1rem", padding:".8rem 1rem", background:"rgba(255,255,255,.08)", backdropFilter:"blur(8px)", borderRadius:10, border:"1px solid rgba(255,255,255,.15)", fontSize:".82rem", color:"rgba(255,255,255,.85)", lineHeight:1.5 }}>
            <Bot size={16} style={{ verticalAlign:"middle", marginRight:".35rem" }}/><strong style={{ color:"#fff" }}>Planner Agent:</strong> {plan.agent_advice}
          </div>
        </div>

        <div className="bento-box">
          <StrategySimulatorWidget profile={profile} currency={currency} onScenarioResult={onScenarioResult}/>
        </div>
      </div>

      <div className="bento-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", flexWrap:"wrap" }}>
          <div>
            <h3 style={{ fontSize:"1.05rem", fontWeight:700, display:"flex", alignItems:"center", gap:".5rem" }}>
              <TrendingUp size={18} color="var(--accent-teal)"/> Funding Coverage Outlook
            </h3>
            <p style={{ fontSize:".78rem", color:"var(--text-secondary)", marginTop:".28rem" }}>
              Compares listed scholarship amounts with the gap remaining after confirmed aid.
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <strong style={{ color:"var(--teal-700)", fontSize:"1.55rem", lineHeight:1 }}>{hasFundingGap ? `${coveragePercentage}%` : "Covered"}</strong>
            <span style={{ display:"block", color:"var(--text-muted)", fontSize:".68rem", fontWeight:700, marginTop:".25rem" }}>{hasFundingGap ? "potential gap coverage" : "no remaining funding gap"}</span>
          </div>
        </div>
        <div style={{ height:12, overflow:"hidden", borderRadius:999, background:"#e5eeee", margin:"1rem 0 .8rem" }}>
          <span style={{ display:"block", width:`${coveragePercentage}%`, height:"100%", background:"var(--accent-sage)" }}/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:".65rem" }}>
          <div style={{ padding:".65rem", border:"1px solid var(--border-subtle)", borderRadius:8 }}><span style={{ display:"block", fontSize:".7rem", color:"var(--text-muted)" }}>Remaining gap</span><strong>{fmt(plan.funding_gap_inr, plan.funding_gap_usd)}</strong></div>
          <div style={{ padding:".65rem", border:"1px solid var(--border-subtle)", borderRadius:8 }}><span style={{ display:"block", fontSize:".7rem", color:"var(--text-muted)" }}>Listed awards counted</span><strong>{fmt(plan.potential_coverage_inr, plan.potential_coverage_usd)}</strong></div>
          <div style={{ padding:".65rem", border:"1px solid var(--border-subtle)", borderRadius:8 }}><span style={{ display:"block", fontSize:".7rem", color:"var(--text-muted)" }}>Still uncovered</span><strong>{fmt(plan.remaining_gap_inr, plan.remaining_gap_usd)}</strong></div>
        </div>
        <p style={{ marginTop:".8rem", padding:".55rem .65rem", borderRadius:8, background:"#fff8e9", border:"1px solid #f4dfad", color:"#885c12", fontSize:".72rem" }}>
          This is a nominal coverage outlook based on listed award amounts, not a forecast or probability. Awards are not guaranteed.
        </p>
      </div>

      <div className="bento-box">
        <div style={{ display:"flex", gap:".55rem", alignItems:"flex-start", marginBottom:"1rem" }}>
          <Info size={18} color="var(--accent-teal)" style={{ flexShrink:0, marginTop:2 }}/>
          <div>
            <h3 style={{ fontSize:"1.05rem", fontWeight:700 }}>Application Priority Score</h3>
            <p style={{ fontSize:".8rem", color:"var(--text-secondary)", marginTop:".25rem" }}>
              Score = 55% match strength + 25% funding relevance + 20% deadline urgency. It ranks application effort; it is not a probability of winning or an expected monetary return.
            </p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:".75rem" }}>
          {priorityFactors.map(factor => (
            <div key={factor.label} style={{ padding:".8rem", border:"1px solid var(--border-subtle)", borderRadius:10, background:"rgba(18,163,165,.04)" }}>
              <strong style={{ color:"var(--teal-700)", fontSize:"1.05rem" }}>{factor.weight}</strong>
              <div style={{ fontSize:".8rem", fontWeight:700, margin:".2rem 0" }}>{factor.label}</div>
              <p style={{ fontSize:".72rem", color:"var(--text-secondary)", lineHeight:1.4 }}>{factor.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bento-box">
        <h3 style={{ fontSize:"1.05rem", fontWeight:700, marginBottom:".35rem", display:"flex", alignItems:"center", gap:".5rem" }}>
          <TrendingUp size={18} color="var(--accent-sage)"/> Priority Application Portfolio
        </h3>
        <p style={{ fontSize:".75rem", color:"var(--text-secondary)", marginBottom:"1rem" }}>
          Potential coverage uses listed award amounts only and does not assume that an award will be won.
        </p>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", textAlign:"left", fontSize:".84rem" }}>
            <thead>
              <tr style={{ borderBottom:"2px solid var(--border-subtle)" }}>
                {["Rank","Opportunity","Category","Award amount","Priority score","Score inputs","Action"].map(header => (
                  <th key={header} style={{ padding:".7rem .75rem", color:"var(--text-muted)", fontWeight:700, fontSize:".7rem", textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plan.recommended_strategy.map((item, index) => (
                <tr key={item.opportunity_id || index} style={{ borderBottom:"1px solid var(--border-subtle)", transition:"background .15s" }}
                  onMouseEnter={event => event.currentTarget.style.background="rgba(18,163,165,.04)"}
                  onMouseLeave={event => event.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:".75rem" }}><span className="badge badge-indigo">#{item.priority_rank}</span></td>
                  <td style={{ padding:".75rem", fontWeight:700, color:"var(--text-primary)", maxWidth:220 }}>{item.title}</td>
                  <td style={{ padding:".75rem" }}><span className="badge badge-teal">{item.category}</span></td>
                  <td style={{ padding:".75rem", fontWeight:700 }}>{fmt(item.amount_inr, item.amount_usd)}</td>
                  <td style={{ padding:".75rem" }}><strong style={{ color:"var(--teal-700)", fontSize:"1rem" }}>{item.application_priority_score}/100</strong></td>
                  <td style={{ padding:".75rem", minWidth:180, fontSize:".72rem", color:"var(--text-secondary)", lineHeight:1.55 }}>
                    <div>Match: <strong>{item.match_score}</strong> × 55%</div>
                    <div>Funding: <strong>{item.funding_relevance_score}</strong> × 25%</div>
                    <div>Deadline: <strong>{item.deadline_urgency_score}</strong> × 20%</div>
                  </td>
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
