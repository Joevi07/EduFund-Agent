import React, { useState, useMemo } from "react";
import { TrendingUp, ShieldCheck, ArrowRight, Zap, Target, Layers, AlertTriangle, Compass, FileText, Kanban, UserCheck, SearchCheck, CircleCheckBig, Calculator } from "lucide-react";
import AgentNodeGraph from "./AgentNodeGraph";
import StrategySimulatorWidget from "./StrategySimulatorWidget";

export default function DashboardView({ profile, plan, currency, onNavigate, onScenarioResult, opportunitiesCount = 0, opportunities = [] }) {
  const [logFilter, setLogFilter] = useState("All");
  const [showAlert, setShowAlert] = useState(true);

  const name    = profile?.name   || "Student";
  const course  = profile?.course || "your course";
  const gpa     = profile?.academic_profile?.gpa   ?? "—";
  const maxGpa  = profile?.academic_profile?.max_gpa ?? 4.0;
  const year    = profile?.academic_profile?.year_of_study || "";
  const interests = (profile?.interests || []).slice(0, 2).join(" & ") || "various fields";
  const city    = profile?.location?.city  || "";
  const country = profile?.location?.country || "";

  const isINR = currency === "INR";
  const fmt   = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;

  const stratCount  = plan?.recommended_strategy?.length ?? 0;
  const priorityItems = stratCount ? plan.recommended_strategy.slice(0, 3) : opportunities
    .filter(opp => opp.days_left >= 0)
    .sort((a, b) => (a.days_left - b.days_left) || (b.amount_inr - a.amount_inr))
    .slice(0, 3)
    .map((opp, index) => ({
      opportunity_id: opp.id,
      title: opp.title,
      priority_rank: index + 1,
      match_score: null,
      expected_value_inr: opp.amount_inr,
      expected_value_usd: opp.amount_usd,
      urgency: opp.urgency || "MEDIUM",
      fallback: true,
    }));
  const covPct      = plan?.coverage_percentage ?? 100;
  const aidDeg      = Math.round(((plan?.confirmed_aid_inr || 0) / ((plan?.total_cost_inr || 1))) * 360);

  // Personalised log entries derived from real profile/plan data
  const logs = useMemo(() => [
    { type: "Profile", Icon:UserCheck, text: `Profile is ready for ${name} (${course})` },
    { type: "Discovery", Icon:SearchCheck, text: `Discovery checked ${opportunitiesCount || "available"} verified funding sources` },
    { type: "Eligibility", Icon:CircleCheckBig, text: `Eligibility evaluated ${stratCount} candidates using GPA ${gpa}/${maxGpa}` },
    { type: "Planner", Icon:Calculator, text: `Funding Planner calculated a gap of ${fmt(plan?.funding_gap_inr || 0, plan?.funding_gap_usd || 0)}` },
    { type: "Planner", Icon:Target, text: `Strategy portfolio has ${covPct}% coverage potential` },
    { type: "Autopilot", Icon:FileText, text: `Autopilot is ready to prepare ${stratCount} application drafts` },
  ], [name, course, opportunitiesCount, stratCount, gpa, maxGpa, covPct]);

  const filteredLogs = logFilter === "All" ? logs : logs.filter(l => l.type === logFilter);
  const LOG_TYPES    = ["All", "Profile", "Discovery", "Eligibility", "Planner", "Autopilot"];

  const alertText = covPct >= 100
    ? `Your current strategy covers the full funding gap based on expected-value estimates.`
    : `Agentic loop found ${stratCount} opportunities covering ${covPct}% of your funding gap.`;

  // Block card data using real counts
  const blockCards = [
    { id:"discovery", label:"Opportunity Market", sub: `${opportunitiesCount || stratCount} Found`,  icon: Compass,  cls:"block-card-blue"  },
    { id:"autopilot", label:"Autopilot Studio",   sub: "AI Essay Studio",       icon: FileText, cls:"block-card-dark"  },
    { id:"planner",   label:"Funding Planner",    sub: `${covPct}% Coverage`,   icon: Target,   cls:"block-card-cyan"  },
    { id:"pipeline",  label:"Pipeline Tracker",   sub: `${stratCount} Active`,  icon: Kanban,   cls:"block-card-coral" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.4rem" }}>

      {/* ── Page heading ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <h2 style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-.03em", color:"var(--text-primary)" }}>
            Welcome back, {name.split(" ")[0]}
          </h2>
          <p style={{ fontSize:".88rem", color:"var(--text-secondary)", marginTop:".2rem" }}>
            {year && `${year} · `}{course}{city ? ` · ${city}` : ""}
          </p>
        </div>
        <div style={{ fontSize:".78rem", color:"var(--accent-teal)", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:".3rem" }}
          onClick={() => onNavigate("planner")}>
          View full strategy <ArrowRight size={14}/>
        </div>
      </div>

      {/* ── Success alert banner ── */}
      {showAlert && (
        <div className="alert-success-box">
          <div style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
            <CircleCheckBig size={18} color="var(--accent-sage)" aria-hidden="true" />
            <span style={{ fontSize:".87rem" }}>{alertText}</span>
          </div>
          <button onClick={() => setShowAlert(false)}
            style={{ background:"none", border:"none", color:"#166534", cursor:"pointer", fontSize:"1.2rem", fontWeight:700, lineHeight:1 }}>
            ×
          </button>
        </div>
      )}

      {/* ── KPI Cards row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1.1rem" }}>
        {[
          { cls:"kpi-card-cyan",  label:"Target Annual Cost",        val: fmt(plan.total_cost_inr, plan.total_cost_usd),        Icon:Layers,       sparkPath:"M0 20 Q 25 5, 50 15 T 100 5" },
          { cls:"kpi-card-red",   label:"Remaining Funding Gap",     val: fmt(plan.funding_gap_inr, plan.funding_gap_usd),       Icon:AlertTriangle, sparkPath:"M0 15 Q 25 22, 50 8 T 100 18" },
          { cls:"kpi-card-amber", label:"Confirmed Aid & Support",   val: fmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd),   Icon:ShieldCheck,   sparkPath:"M0 22 Q 25 8, 50 18 T 100 10" },
          { cls:"kpi-card-green", label:"Strategy Potential",        val: fmt(plan.potential_coverage_inr, plan.potential_coverage_usd), Icon:TrendingUp, sparkPath:"M0 18 Q 25 10, 50 20 T 100 5" },
        ].map(({ cls, label, val, Icon, sparkPath }) => (
          <div key={label} className={`kpi-card ${cls}`}>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <span style={{ fontSize:"1.75rem", fontWeight:900, letterSpacing:"-.03em", lineHeight:1.1 }}>{val}</span>
                <div style={{ background:"rgba(255,255,255,.18)", borderRadius:8, padding:6, backdropFilter:"blur(8px)" }}>
                  <Icon size={18} color="#fff" opacity={0.9}/>
                </div>
              </div>
              <div style={{ fontSize:".8rem", opacity:.9, marginTop:".3rem", fontWeight:500 }}>{label}</div>
            </div>
            <svg viewBox="0 0 100 25" style={{ width:"100%", height:22, stroke:"rgba(255,255,255,.5)", strokeWidth:2, fill:"none", marginTop:".7rem" }}>
              <path d={sparkPath}/>
            </svg>
          </div>
        ))}
      </div>

      {/* ── Middle bento grid ── */}
      <div className="bento-grid">

        {/* Donut gauge */}
        <div className="bento-box col-span-4" style={{ display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".75rem" }}>
            <span style={{ fontSize:".72rem", fontWeight:800, color:"var(--text-muted)", letterSpacing:".08em", textTransform:"uppercase" }}>Funding Ring</span>
            <Target size={17} color="var(--accent-teal)"/>
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", margin:"1rem 0" }}>
            <div className="donut-gauge" style={{ background:`conic-gradient(var(--accent-sage) 0deg ${aidDeg}deg, var(--coral-400) ${aidDeg}deg 360deg)` }}>
              <div className="donut-inner">
                <div style={{ fontSize:".65rem", color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Gap</div>
                <div style={{ fontSize:"1rem", fontWeight:900, color:"var(--coral-500)", letterSpacing:"-.03em" }}>
                  {fmt(plan.funding_gap_inr, plan.funding_gap_usd)}
                </div>
              </div>
            </div>
          </div>
          <div style={{ borderTop:"1px solid var(--border-subtle)", paddingTop:".75rem", fontSize:".78rem", display:"flex", justifyContent:"space-between", color:"var(--text-secondary)" }}>
            <span>Aid: <strong style={{ color:"var(--accent-sage)" }}>{fmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd)}</strong></span>
            <span>Total: <strong style={{ color:"var(--text-primary)" }}>{fmt(plan.total_cost_inr, plan.total_cost_usd)}</strong></span>
          </div>
        </div>

        {/* Agent graph */}
        <div className="bento-box col-span-8">
          <AgentNodeGraph onSelectAgentNode={(id) => {
            const destinations = {
              profile: "profile",
              discovery: "discovery",
              eligibility: "discovery",
              planner: "planner",
              autopilot: "autopilot",
              deadline: "pipeline",
            };
            onNavigate(destinations[id] || "dashboard");
          }}/>
        </div>

        {/* Strategy Simulator */}
        <div className="bento-box col-span-4">
          <StrategySimulatorWidget profile={profile} currency={currency} onScenarioResult={onScenarioResult}/>
        </div>

        {/* Priority opportunity queue */}
        <div className="bento-box col-span-8">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            <h3 style={{ fontSize:"1rem", fontWeight:700, display:"flex", alignItems:"center", gap:".45rem" }}>
              <TrendingUp size={17} color="var(--accent-sage)"/> Priority Opportunity Queue
            </h3>
            <button style={{ background:"none", border:"none", color:"var(--accent-teal)", cursor:"pointer", fontSize:".8rem", fontWeight:700, display:"flex", alignItems:"center", gap:".2rem" }}
              onClick={() => onNavigate("planner")}>
              Full strategy <ArrowRight size={13}/>
            </button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:".7rem" }}>
            {priorityItems.length ? priorityItems.map((item, idx) => (
              <div key={idx} style={{
                background:"rgba(255,255,255,.65)", backdropFilter:"blur(12px)",
                border:"1px solid rgba(18,163,165,.14)", borderRadius:10,
                padding:".85rem 1rem",
                display:"flex", justifyContent:"space-between", alignItems:"center",
                transition:"all .2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.9)"; e.currentTarget.style.borderColor="rgba(18,163,165,.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.65)"; e.currentTarget.style.borderColor="rgba(18,163,165,.14)"; }}
              >
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:".45rem", marginBottom:".3rem" }}>
                    <span className="badge badge-indigo" style={{ fontSize:".65rem" }}>RANK #{item.priority_rank}</span>
                    <span className="badge badge-high" style={{ fontSize:".65rem" }}>{item.fallback ? "CATALOGUE PRIORITY" : `${item.match_score}% MATCH`}</span>
                    <span className="badge badge-medium" style={{ fontSize:".65rem", display: item.urgency === "HIGH" ? "none" : undefined }}>{item.urgency}</span>
                  </div>
                  <div style={{ fontSize:".9rem", fontWeight:700, color:"var(--text-primary)" }}>{item.title}</div>
                  <div style={{ fontSize:".76rem", color:"var(--text-muted)", marginTop:".12rem" }}>
                    EV Coverage: <strong style={{ color:"var(--accent-sage)" }}>{fmt(item.expected_value_inr, item.expected_value_usd)}</strong>
                  </div>
                </div>
                <button className="btn-primary" style={{ padding:".4rem .85rem", fontSize:".76rem" }} onClick={() => onNavigate("autopilot")}>
                  Autopilot <Zap size={12}/>
                </button>
              </div>
            )) : <div style={{ padding:"1rem", color:"var(--text-secondary)", fontSize:".84rem", border:"1px dashed var(--border-subtle)", borderRadius:10 }}>Loading verified opportunities for your queue…</div>}
          </div>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="bento-box" style={{ padding:"1.4rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <h3 style={{ fontSize:"1rem", fontWeight:700 }}>Agent Activity Log</h3>
          <div style={{ display:"flex", gap:".35rem", flexWrap:"wrap" }}>
            {LOG_TYPES.map(t => (
              <button key={t}
                onClick={() => setLogFilter(t)}
                style={{
                  background: logFilter===t ? "linear-gradient(135deg,var(--teal-500),var(--teal-600))" : "rgba(255,255,255,.7)",
                  color: logFilter===t ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${logFilter===t ? "transparent" : "rgba(18,163,165,.18)"}`,
                  borderRadius:20, padding:".22rem .65rem",
                  fontSize:".7rem", fontWeight:700, cursor:"pointer",
                  backdropFilter:"blur(8px)",
                  transition:"all .15s ease",
                  fontFamily:"var(--font-main)",
                }}
              >{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:".5rem" }}>
          {filteredLogs.map((log, i) => {
            const LogIcon = log.Icon;
            return (
            <div key={i} style={{
              display:"flex", alignItems:"flex-start", gap:".75rem",
              padding:".7rem 1rem",
              background:"rgba(255,255,255,.6)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(18,163,165,.1)", borderRadius:10,
              fontSize:".83rem", color:"var(--text-secondary)",
              lineHeight:1.5,
            }}>
              <span style={{
                background:"rgba(18,163,165,.12)", color:"var(--accent-teal)",
                padding:".15rem .5rem", borderRadius:6,
                fontSize:".63rem", fontWeight:800, flexShrink:0,
                letterSpacing:".04em", textTransform:"uppercase",
                border:"1px solid rgba(18,163,165,.2)",
              }}>{log.type}</span>
              <LogIcon size={16} color="var(--accent-teal)" style={{ flexShrink:0, marginTop:2 }}/>{log.text}
            </div>
          )})}
        </div>
      </div>

      {/* ── Block nav cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:"1.1rem" }}>
        {blockCards.map(({ id, label, sub, icon:Icon, cls }) => (
          <div key={id} className={`block-card ${cls}`} onClick={() => onNavigate(id)}>
            <div style={{ background:"rgba(255,255,255,.15)", borderRadius:12, padding:10, marginBottom:".6rem", backdropFilter:"blur(8px)" }}>
              <Icon size={28} color="#fff"/>
            </div>
            <div style={{ fontSize:"1.25rem", fontWeight:900, letterSpacing:"-.03em" }}>{sub}</div>
            <div style={{ fontSize:".78rem", opacity:.88, marginTop:".2rem", fontWeight:500 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
