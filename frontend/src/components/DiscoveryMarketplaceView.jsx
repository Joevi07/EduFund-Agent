import React, { useState } from "react";
import { AlertCircle, CheckCircle2, CircleHelp, ExternalLink, Search, X, XCircle, Zap, Clock } from "lucide-react";
import { hasSourceUrl } from "../utils/actionCenter";
import ExplainabilityCard from "./ExplainabilityCard";
import ScamSafetyBadge from "./ScamSafetyBadge";
import DeadlineCountdown from "./DeadlineCountdown";
import MatchScoreRing from "./MatchScoreRing";

const CATEGORIES = ["All", "Scholarship", "Fee Waiver", "Grant", "Competition", "Institutional Aid"];

const URGENCY_BADGE = { HIGH:"badge-low", MEDIUM:"badge-medium", LOW:"badge-high" };
const CHECK_META = {
  PASS: { label:"Satisfied", Icon:CheckCircle2, color:"#16713a", background:"rgba(41,165,87,.07)", border:"rgba(41,165,87,.18)" },
  FAIL: { label:"Unsatisfied", Icon:XCircle, color:"#b42318", background:"rgba(180,35,24,.06)", border:"rgba(180,35,24,.18)" },
  WARN: { label:"Review", Icon:AlertCircle, color:"#a15c00", background:"rgba(217,119,6,.07)", border:"rgba(217,119,6,.2)" },
  UNAVAILABLE: { label:"Unavailable", Icon:CircleHelp, color:"#667085", background:"rgba(102,112,133,.06)", border:"rgba(102,112,133,.18)" },
};

export default function DiscoveryMarketplaceView({ opportunities, currency, onSelectAutopilot, eligibilityEvaluations = [], fundingGapInr = 0 }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [selectedOpp,   setSelectedOpp]    = useState(null);

  const isINR = currency === "INR";
  const fmt   = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;
  const evaluationById = Object.fromEntries(eligibilityEvaluations.map(result => [result.opportunity_id, result]));
  const selectedEvaluation = selectedOpp ? evaluationById[selectedOpp.id] : null;

  const filtered = opportunities.filter(o => {
    const matchCat  = activeCategory === "All" || o.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSrch = !searchQuery || o.title.toLowerCase().includes(searchQuery.toLowerCase()) || o.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSrch;
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

      {/* ── Heading + Search ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h2 style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-.035em" }}>Opportunity Marketplace</h2>
          <p style={{ color:"var(--text-secondary)", fontSize:".88rem", marginTop:".2rem" }}>
            Curated scholarships, grants & waivers with provider links — confirm current details on the official source before applying.
          </p>
        </div>
        <div style={{ position:"relative", minWidth:280 }}>
          <Search size={15} color="var(--text-muted)" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
          <input type="text" placeholder="Search scholarships, grants…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft:"2.2rem", height:40, fontSize:".84rem", borderRadius:10 }}
          />
        </div>
      </div>

      {/* ── Category pills ── */}
      <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap" }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory===cat ? "linear-gradient(135deg,var(--teal-500),var(--teal-600))" : "rgba(255,255,255,.72)",
              color: activeCategory===cat ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${activeCategory===cat ? "transparent" : "rgba(18,163,165,.18)"}`,
              borderRadius: 20, padding:".4rem 1rem",
              fontSize:".82rem", fontWeight:700, cursor:"pointer",
              backdropFilter:"blur(10px)",
              transition:"all .18s ease",
              fontFamily:"var(--font-main)",
              boxShadow: activeCategory===cat ? "0 3px 12px rgba(18,163,165,.3)" : "none",
            }}
          >{cat}</button>
        ))}
        <span style={{ fontSize:".78rem", color:"var(--text-muted)", alignSelf:"center", marginLeft:".5rem" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Cards grid ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(330px,1fr))", gap:"1.2rem" }}>
        {filtered.map(opp => (
          <div key={opp.id} className="glass-card" style={{ padding:"1.5rem", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <div>
              {/* Badges row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".85rem" }}>
                <span className="badge badge-teal">{opp.category}</span>
                <DeadlineCountdown deadline={opp.deadline} compact />
              </div>
              {/* Title */}
              <h3 style={{ fontSize:"1.05rem", fontWeight:700, marginBottom:".25rem", color:"var(--text-primary)", lineHeight:1.3 }}>{opp.title}</h3>
              <p style={{ color:"var(--text-secondary)", fontSize:".8rem", marginBottom:".75rem" }}>
                by <strong style={{ color:"var(--accent-teal)" }}>{opp.provider}</strong>
                {hasSourceUrl(opp.website_url) && <span style={{ marginLeft:".45rem", fontSize:".68rem", color:"var(--teal-700)", fontWeight:700 }}>· Official source linked</span>}
              </p>
              {evaluationById[opp.id] && <div style={{ display:"flex", gap:".55rem", alignItems:"center", marginBottom:".55rem" }}><MatchScoreRing score={evaluationById[opp.id].match_score} size={46}/><div style={{ fontSize:".7rem", color:"var(--text-secondary)" }}>Live eligibility match<br/><strong style={{ color:"var(--teal-700)", fontSize:".78rem" }}>{evaluationById[opp.id].rating.toLowerCase()} match based on your profile</strong></div></div>}
              <p style={{ fontSize:".83rem", color:"var(--text-secondary)", lineHeight:1.55, marginBottom:".55rem" }}>{opp.description}</p>
              <div style={{ display:"flex", gap:".4rem", flexWrap:"wrap", marginBottom:".55rem" }}>
                <ScamSafetyBadge opportunity={opp} inline />
                {opp.last_reviewed_date && <span style={{ fontSize:".62rem", padding:".15rem .45rem", borderRadius:999, background:"rgba(18,163,165,.08)", border:"1px solid rgba(18,163,165,.2)", color:"var(--teal-700)", fontWeight:700 }}>Reviewed {opp.last_reviewed_date}</span>}
              </div>
              {evaluationById[opp.id]?.explainability && <ExplainabilityCard explainability={evaluationById[opp.id].explainability} compact />}
            </div>

            {/* Footer */}
            <div style={{ borderTop:"1px solid var(--border-subtle)", paddingTop:".85rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:".68rem", color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Award Value</div>
                <div style={{ fontSize:"1.25rem", fontWeight:900, color:"var(--accent-sage)", letterSpacing:"-.03em" }}>
                  {fmt(opp.amount_inr, opp.amount_usd)}
                </div>
              </div>
              <div style={{ display:"flex", gap:".45rem", flexWrap:"wrap", justifyContent:"flex-end" }}>
                <button className="btn-secondary" style={{ padding:".42rem .75rem", fontSize:".78rem" }} onClick={() => setSelectedOpp(opp)}>
                  View Details
                </button>
                {hasSourceUrl(opp.website_url) && (
                  <a href={opp.website_url} target="_blank" rel="noreferrer"
                    className="btn-secondary" aria-label={`Open official source for ${opp.title}`} style={{ padding:".42rem .65rem", textDecoration:"none" }}>
                    Source <ExternalLink size={14}/>
                  </a>
                )}
                <button className="btn-primary" style={{ padding:".42rem .8rem", fontSize:".78rem" }} onClick={() => onSelectAutopilot(opp)}>
                  Apply <Zap size={13}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Detail Modal ── */}
      {selectedOpp && (
        <div style={{
          position:"fixed", inset:0,
          background:"rgba(8,40,40,.55)",
          backdropFilter:"blur(14px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:300, padding:"1rem",
        }} onClick={() => setSelectedOpp(null)}>
          <div
            className="glass-card"
            style={{ maxWidth:600, width:"100%", padding:"2rem", maxHeight:"90vh", overflowY:"auto", background:"rgba(255,255,255,.92)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
              <span className="badge badge-teal">Eligibility Trace</span>
              <button onClick={() => setSelectedOpp(null)}
                style={{ background:"rgba(18,163,165,.1)", border:"1px solid rgba(18,163,165,.2)", color:"var(--text-secondary)", borderRadius:8, width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16}/>
              </button>
            </div>

            <h3 style={{ fontSize:"1.3rem", fontWeight:800, marginBottom:".3rem", letterSpacing:"-.03em" }}>{selectedOpp.title}</h3>
            <p style={{ color:"var(--accent-sage)", fontWeight:800, fontSize:"1.2rem", marginBottom:"1.1rem", letterSpacing:"-.03em" }}>
              {fmt(selectedOpp.amount_inr, selectedOpp.amount_usd)}
            </p>

            <div style={{ display:"flex", gap:".6rem", flexWrap:"wrap", marginBottom:"1rem", fontSize:".72rem", color:"var(--text-secondary)" }}>
              <span>Provider: <strong>{selectedOpp.provider}</strong></span>
              <DeadlineCountdown deadline={selectedOpp.deadline} />
              <span>Funding-gap contribution: <strong>{fundingGapInr > 0 ? `${Math.min(100, Math.round((selectedOpp.amount_inr / fundingGapInr) * 100))}%` : "no remaining gap"}</strong></span>
              {hasSourceUrl(selectedOpp.website_url) && <a href={selectedOpp.website_url} target="_blank" rel="noreferrer" style={{ color:"var(--teal-700)", fontWeight:700, display:"inline-flex", gap:3, alignItems:"center" }}>Official source linked <ExternalLink size={12}/></a>}
            </div>

            <h4 style={{ fontSize:".88rem", fontWeight:700, marginBottom:".65rem", color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:".06em" }}>Eligibility Checks</h4>
            <p style={{ fontSize:".78rem", color:"var(--text-secondary)", marginBottom:".65rem" }}>
              {selectedEvaluation?.key_reasoning || "No profile-based eligibility evaluation is available yet."}
            </p>
            {selectedEvaluation && <div style={{ display:"flex", alignItems:"center", gap:".65rem", margin:".65rem 0 1rem", padding:".65rem", background:"rgba(18,163,165,.06)", borderRadius:10 }}><MatchScoreRing score={selectedEvaluation.match_score} size={64}/><div><strong style={{ color:"var(--text-primary)" }}>Animated profile match score</strong><span style={{ display:"block", color:"var(--text-secondary)", fontSize:".75rem", marginTop:3 }}>Updates whenever the profile or eligibility evaluation changes.</span></div></div>}
            <div style={{ display:"flex", flexDirection:"column", gap:".55rem", marginBottom:"1.5rem" }}>
              {(selectedEvaluation?.checks || []).map(check => {
                const meta = CHECK_META[check.status] || CHECK_META.UNAVAILABLE;
                const StatusIcon = meta.Icon;
                return <div key={check.criterion} style={{ padding:".65rem .9rem", background:meta.background, border:`1px solid ${meta.border}`, borderRadius:10, display:"flex", gap:".65rem", fontSize:".84rem", alignItems:"flex-start" }}>
                  <StatusIcon size={17} color={meta.color} style={{ flexShrink:0, marginTop:1 }}/>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:".4rem", flexWrap:"wrap" }}><strong style={{ color:"var(--text-primary)" }}>{check.criterion}</strong><span style={{ color:meta.color, fontSize:".66rem", fontWeight:800, textTransform:"uppercase" }}>{meta.label}</span></div>
                    <span style={{ color:"var(--text-secondary)", display:"block", marginTop:2 }}>{check.detail}</span>
                  </div>
                </div>;
              })}
              {!selectedEvaluation && <div style={{ padding:".75rem .9rem", background:CHECK_META.UNAVAILABLE.background, border:`1px solid ${CHECK_META.UNAVAILABLE.border}`, borderRadius:10, color:"var(--text-secondary)", fontSize:".8rem" }}>
                Open the Funding Planner after completing your profile to generate satisfied, unsatisfied, review, and unavailable criteria.
              </div>}
            </div>
            {selectedEvaluation?.explainability && (
              <div style={{ marginBottom:"1.25rem" }}>
                <h4 style={{ fontSize:".88rem", fontWeight:700, marginBottom:".55rem", color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:".06em" }}>AI Explainability</h4>
                <ExplainabilityCard explainability={selectedEvaluation.explainability} />
              </div>
            )}
            <div style={{ marginBottom:"1.25rem" }}>
              <ScamSafetyBadge opportunity={selectedOpp} />
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:".75rem" }}>
              <button className="btn-secondary" onClick={() => setSelectedOpp(null)}>Close</button>
              <button className="btn-primary" onClick={() => { const o = selectedOpp; setSelectedOpp(null); onSelectAutopilot(o); }}>
                Launch Autopilot <Zap size={15}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
