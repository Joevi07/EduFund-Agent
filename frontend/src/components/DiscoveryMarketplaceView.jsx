import React, { useState } from "react";
import { Search, ExternalLink, Zap, Clock, X, CheckCircle2 } from "lucide-react";

const CATEGORIES = ["All", "Scholarship", "Fee Waiver", "Grant", "Competition", "Institutional Aid"];

const URGENCY_BADGE = { HIGH:"badge-low", MEDIUM:"badge-medium", LOW:"badge-high" };

export default function DiscoveryMarketplaceView({ opportunities, currency, onSelectAutopilot }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [selectedOpp,   setSelectedOpp]    = useState(null);

  const isINR = currency === "INR";
  const fmt   = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;

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
            Verified scholarships, grants & waivers — confirm details on official sources before applying.
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
                <span className={`badge ${URGENCY_BADGE[opp.urgency] || "badge-medium"}`} style={{ display:"flex", alignItems:"center", gap:".3rem" }}>
                  <Clock size={11}/> {opp.days_left}d left
                </span>
              </div>
              {/* Title */}
              <h3 style={{ fontSize:"1.05rem", fontWeight:700, marginBottom:".25rem", color:"var(--text-primary)", lineHeight:1.3 }}>{opp.title}</h3>
              <p style={{ color:"var(--text-secondary)", fontSize:".8rem", marginBottom:".75rem" }}>
                by <strong style={{ color:"var(--accent-teal)" }}>{opp.provider}</strong>
              </p>
              <p style={{ fontSize:".83rem", color:"var(--text-secondary)", lineHeight:1.55, marginBottom:"1rem" }}>{opp.description}</p>
            </div>

            {/* Footer */}
            <div style={{ borderTop:"1px solid var(--border-subtle)", paddingTop:".85rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:".68rem", color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em" }}>Award Value</div>
                <div style={{ fontSize:"1.25rem", fontWeight:900, color:"var(--accent-sage)", letterSpacing:"-.03em" }}>
                  {fmt(opp.amount_inr, opp.amount_usd)}
                </div>
              </div>
              <div style={{ display:"flex", gap:".45rem" }}>
                <button className="btn-secondary" style={{ padding:".42rem .75rem", fontSize:".78rem" }} onClick={() => setSelectedOpp(opp)}>
                  View Details
                </button>
                {opp.website_url && (
                  <a href={opp.website_url} target="_blank" rel="noreferrer"
                    className="btn-secondary" style={{ padding:".42rem .65rem", textDecoration:"none" }}>
                    <ExternalLink size={14}/>
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

            <h4 style={{ fontSize:".88rem", fontWeight:700, marginBottom:".65rem", color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:".06em" }}>Eligibility Checks</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:".55rem", marginBottom:"1.5rem" }}>
              {[
                { label:"Degree Level", detail:`${selectedOpp.degree_levels?.join(", ")} — matched ✓` },
                { label:"Min GPA",      detail:`${selectedOpp.min_gpa || "No requirement"} — met ✓` },
                { label:"Income Limit", detail:`₹${selectedOpp.max_family_income_inr?.toLocaleString() || "—"} — eligible ✓` },
              ].map(({ label, detail }) => (
                <div key={label} style={{ padding:".65rem .9rem", background:"rgba(41,165,87,.07)", border:"1px solid rgba(41,165,87,.18)", borderRadius:10, display:"flex", gap:".65rem", fontSize:".84rem", alignItems:"flex-start" }}>
                  <CheckCircle2 size={17} color="var(--accent-sage)" style={{ flexShrink:0, marginTop:1 }}/>
                  <div><strong style={{ color:"var(--text-primary)" }}>{label}:</strong> <span style={{ color:"var(--text-secondary)" }}>{detail}</span></div>
                </div>
              ))}
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
