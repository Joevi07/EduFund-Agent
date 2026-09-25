import React, { useEffect, useState } from "react";
import { Kanban, Clock, AlertTriangle, ChevronRight, FileStack, CalendarRange, CheckCircle2 } from "lucide-react";
import { fetchDeadlines, fetchOpportunities } from "../services/api";

const COLUMNS = [
  { id:"DISCOVERED",      label:"Discovered",        badge:"badge-teal",   next:"PLANNED"          },
  { id:"PLANNED",         label:"Strategy Stack",    badge:"badge-indigo", next:"DRAFTING"         },
  { id:"DRAFTING",        label:"Drafting",          badge:"badge-medium", next:"READY_TO_SUBMIT"  },
  { id:"READY_TO_SUBMIT", label:"Ready to Submit",   badge:"badge-high",   next:"SUBMITTED"        },
  { id:"SUBMITTED",       label:"Submitted",         badge:"badge-success"                         },
];

const COL_COLORS = {
  DISCOVERED:      "rgba(18,163,165,.08)",
  PLANNED:         "rgba(99,102,241,.07)",
  DRAFTING:        "rgba(217,119,6,.07)",
  READY_TO_SUBMIT: "rgba(41,165,87,.08)",
  SUBMITTED:       "rgba(41,165,87,.12)",
};

const canonicalDocument = (document) => document;

export default function PipelineTrackerView({ opportunities, currency, applications = [], plan, onUpdateStatus }) {
  const isINR = currency === "INR";
  const fmt   = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;
  const [deadlineData, setDeadlineData] = useState(null);
  const [catalogue, setCatalogue] = useState(opportunities);

  useEffect(() => { fetchDeadlines().then(setDeadlineData); }, []);
  useEffect(() => {
    fetchOpportunities("All", "").then((all) => {
      if (Array.isArray(all) && all.length) setCatalogue(all);
    }).catch(() => setCatalogue(opportunities));
  }, [opportunities]);

  const getColItems = (colId) =>
    opportunities.filter(o => (applications.find(a => a.opportunity_id === o.id)?.status || "DISCOVERED") === colId);
  const activeIds = new Set([...(applications || []).map(app => app.opportunity_id), ...(plan?.recommended_strategy || []).map(item => item.opportunity_id)]);
  const workspaceOpportunities = opportunities.filter(opp => activeIds.has(opp.id));
  const countryLabel = (opp) => {
    const locs = opp.location_restrictions || [];
    if (!locs.length || locs.some(loc => String(loc).toLowerCase() === "global")) return "Worldwide";
    return locs.join(", ");
  };
  const sourceOpportunities = (catalogue && catalogue.length ? catalogue : opportunities) || [];
  const documentUse = sourceOpportunities.flatMap(opp => (opp.required_documents || []).map(document => ({
    document: canonicalDocument(document),
    title: opp.title,
    country: countryLabel(opp)
  }))).reduce((map, item) => {
    map[item.document] = map[item.document] || [];
    map[item.document].push(item);
    return map;
  }, {});
  const reusableDocuments = Object.entries(documentUse).sort((a,b) => b[1].length - a[1].length);
  const upcoming = workspaceOpportunities.filter(opp => opp.days_left >= 0 && opp.days_left <= 30).sort((a,b) => a.days_left - b.days_left);
  const collisions = upcoming.filter((opp, index) => upcoming.some((other, otherIndex) => otherIndex !== index && Math.abs(other.days_left - opp.days_left) <= 7));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>

      {/* ── Heading ── */}
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:".3rem" }}>
          <div style={{ background:"linear-gradient(135deg,#6366f1,#4f46e5)", borderRadius:9, padding:7, boxShadow:"0 3px 12px rgba(99,102,241,.3)" }}>
            <Kanban size={18} color="#fff"/>
          </div>
          <h2 style={{ fontSize:"1.55rem", fontWeight:800, letterSpacing:"-.035em" }}>Pipeline & Deadline Tracker</h2>
        </div>
        <p style={{ color:"var(--text-secondary)", fontSize:".88rem", marginLeft:"2.5rem" }}>
          Application workflow from discovery to student-authorised submission. Move cards forward as work is completed.
        </p>
      </div>

      {/* ── Deadline alert ── */}
      <div className="bento-box" style={{
        padding:"1rem 1.5rem",
        background:"rgba(217,119,6,.08)",
        border:"1px solid rgba(217,119,6,.22)",
        display:"flex", alignItems:"center", gap:"1rem",
      }}>
        <div style={{ background:"rgba(217,119,6,.15)", borderRadius:9, padding:7, flexShrink:0 }}>
          <AlertTriangle size={18} color="var(--amber-500)"/>
        </div>
        <div>
          <strong style={{ color:"var(--amber-500)", fontSize:".88rem" }}>Deadline Agent: </strong>
          <span style={{ color:"var(--text-secondary)", fontSize:".85rem" }}>
            {deadlineData?.alerts?.[0] || "Checking for urgent deadlines…"}
          </span>
        </div>
      </div>

      <div className="pipeline-intelligence">
        <section className="bento-box intelligence-card">
          <div className="intelligence-title"><FileStack size={18}/><div><h3>Document Reuse Map</h3><p>Every required document across the worldwide catalogue, with all countries shown.</p></div></div>
          {reusableDocuments.length ? <div className="reuse-list">{reusableDocuments.map(([document, entries]) => {
            const countries = Array.from(new Set(entries.map(item => item.country)));
            return (
              <div key={document}>
                <strong>{document}</strong>
                <span>{entries.length} applications · {countries.length} {countries.length === 1 ? "region" : "regions"}</span>
                <div className="reuse-countries">{countries.map(country => <em key={country}>{country}</em>)}</div>
                <div className="reuse-apps">{entries.map((item, index) => <small key={`${item.title}-${index}`}>{item.title}<em>{item.country}</em></small>)}</div>
              </div>
            );
          })}</div> : <div className="intelligence-empty"><CheckCircle2 size={17}/>No catalogue documents yet. Once opportunities load, every reusable document and country will appear here.</div>}
        </section>
        <section className="bento-box intelligence-card">
          <div className="intelligence-title"><CalendarRange size={18}/><div><h3>Deadline Collision Detector</h3><p>Find active applications with deadlines within seven days of each other.</p></div></div>
          {collisions.length ? <div className="collision-list">{collisions.map(opp => <div key={opp.id}><strong>{opp.days_left} days left</strong><span>{opp.title}</span></div>)}</div> : <div className="intelligence-empty"><CheckCircle2 size={17}/>No deadline collisions in the next 30 days.</div>}
        </section>
      </div>

      {/* ── Kanban board ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"1rem", alignItems:"start" }}>
        {COLUMNS.map(col => {
          const items = getColItems(col.id);
          const nextLabel = COLUMNS.find(c => c.id === col.next)?.label;
          return (
            <div key={col.id} className="bento-box" style={{ padding:"1.1rem", background: COL_COLORS[col.id], minHeight:380 }}>
              {/* Column header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".9rem" }}>
                <h3 style={{ fontSize:".9rem", fontWeight:700, color:"var(--text-primary)" }}>{col.label}</h3>
                <span className={`badge ${col.badge}`}>{items.length}</span>
              </div>

              {/* Cards */}
              <div style={{ display:"flex", flexDirection:"column", gap:".7rem" }}>
                {items.length === 0 ? (
                  <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:".78rem", padding:"2rem 0", borderRadius:10, border:"2px dashed rgba(18,163,165,.15)", background:"rgba(255,255,255,.4)" }}>
                    No items
                  </div>
                ) : items.map(opp => (
                  <div key={opp.id} style={{
                    background:"rgba(255,255,255,.78)",
                    backdropFilter:"blur(12px)",
                    border:"1px solid rgba(18,163,165,.14)",
                    borderRadius:10, padding:".85rem",
                    transition:"all .2s ease",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.96)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(10,50,50,.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.78)"; e.currentTarget.style.boxShadow="none"; }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem", marginBottom:".35rem" }}>
                      <span style={{ color:"var(--accent-teal)", fontWeight:700 }}>{opp.category}</span>
                      <span style={{ color: opp.days_left <= 15 ? "var(--amber-500)" : "var(--text-muted)", display:"flex", alignItems:"center", gap:".2rem" }}>
                        <Clock size={11}/> {opp.days_left}d
                      </span>
                    </div>
                    <div style={{ fontSize:".87rem", fontWeight:700, color:"var(--text-primary)", marginBottom:".3rem", lineHeight:1.3 }}>{opp.title}</div>
                    <div style={{ fontSize:"1.05rem", fontWeight:900, color:"var(--accent-sage)", letterSpacing:"-.02em" }}>
                      {fmt(opp.amount_inr, opp.amount_usd)}
                    </div>
                    {col.next && (
                      <button className="btn-secondary" onClick={() => onUpdateStatus?.(opp.id, col.next)}
                        style={{ marginTop:".65rem", width:"100%", justifyContent:"center", fontSize:".74rem", padding:".38rem .65rem" }}>
                        → {nextLabel} <ChevronRight size={13}/>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
