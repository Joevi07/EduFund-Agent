import React, { useState } from "react";
import { Layers, ChevronDown, ChevronUp, GraduationCap, BadgeIndianRupee, Briefcase, BookOpen, CheckSquare } from "lucide-react";

const LAYER_ICONS = {
  "Scholarship Portfolio":    { icon: GraduationCap, color: "#0891b2", bg: "rgba(8,145,178,.1)"  },
  "Fee-Waiver Options":       { icon: BadgeIndianRupee, color: "#16713a", bg: "rgba(22,113,58,.1)" },
  "Work-Study Support":       { icon: Briefcase,      color: "#7c3aed", bg: "rgba(124,58,237,.1)"  },
  "Education Loan Readiness": { icon: BookOpen,       color: "#d97706", bg: "rgba(217,119,6,.1)"  },
};

function RescueLayer({ comp, currency, usdRate = 83 }) {
  const [open, setOpen] = useState(false);
  const isINR = currency === "INR";
  const fmt = (inr) => isINR ? `₹${inr.toLocaleString()}` : `$${(inr / usdRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const { icon: Icon, color, bg } = LAYER_ICONS[comp.layer] || { icon: Layers, color: "var(--teal-600)", bg: "rgba(18,163,165,.1)" };

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 11, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: ".75rem",
          padding: ".75rem 1rem", background: bg, border: "none", cursor: "pointer",
        }}
      >
        <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={color} />
        </div>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--text-primary)" }}>{comp.title}</div>
          <div style={{ fontSize: ".68rem", color: "var(--text-muted)", marginTop: 2 }}>{comp.layer}</div>
        </div>
        <strong style={{ fontSize: ".95rem", color, flexShrink: 0 }}>{fmt(comp.amount_inr)}</strong>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ padding: ".75rem 1rem", background: "#fff", borderTop: "1px solid var(--border-subtle)" }}>
          <p style={{ fontSize: ".78rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 .65rem" }}>{comp.description}</p>
          {comp.checklist?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
              {comp.checklist.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: ".45rem", alignItems: "flex-start" }}>
                  <CheckSquare size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: ".75rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>
          )}
          <button style={{
            marginTop: ".75rem", padding: ".35rem .85rem", fontSize: ".72rem", fontWeight: 700,
            background: color, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
          }}>
            {comp.action_label} →
          </button>
        </div>
      )}
    </div>
  );
}

export default function FundingGapRescuePlan({ rescuePlan, currency }) {
  if (!rescuePlan) return null;
  const isINR = currency === "INR";
  const fmt = (inr, usd) => isINR ? `₹${Number(inr).toLocaleString()}` : `$${Number(usd).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const totalCovered = rescuePlan.scholarship_coverage_inr + rescuePlan.fee_waiver_coverage_inr + rescuePlan.work_study_coverage_inr + rescuePlan.loan_coverage_inr;
  const coveragePct = rescuePlan.funding_gap_inr > 0 ? Math.min(100, Math.round((totalCovered / rescuePlan.funding_gap_inr) * 100)) : 100;

  return (
    <div className="bento-box" style={{ background: "linear-gradient(145deg,rgba(8,145,178,.03),rgba(18,163,165,.06))", border: "1px solid rgba(18,163,165,.2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".3rem" }}>
        <div style={{ background: "linear-gradient(135deg,#0891b2,#0e7490)", borderRadius: 9, padding: 7, boxShadow: "0 3px 12px rgba(8,145,178,.3)" }}>
          <Layers size={17} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Funding Gap Rescue Plan</h3>
          <p style={{ fontSize: ".75rem", color: "var(--text-secondary)", margin: 0 }}>Multi-layered strategy to close your remaining educational funding gap</p>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ margin: "1rem 0 .75rem", padding: ".85rem 1rem", background: "rgba(8,145,178,.08)", border: "1px solid rgba(8,145,178,.2)", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem" }}>
          <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#0891b2" }}>Total Rescue Coverage</span>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0891b2" }}>{coveragePct}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(8,145,178,.15)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${coveragePct}%`, height: "100%", background: "linear-gradient(90deg,#0891b2,#06b6d4)", borderRadius: 999, transition: "width .4s ease" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: ".5rem", marginTop: ".75rem", fontSize: ".72rem" }}>
          <div><span style={{ color: "var(--text-muted)" }}>Total gap</span><br /><strong>{fmt(rescuePlan.funding_gap_inr, rescuePlan.funding_gap_usd)}</strong></div>
          <div><span style={{ color: "var(--text-muted)" }}>Plan covers</span><br /><strong style={{ color: "#16713a" }}>{fmt(totalCovered, totalCovered / 83)}</strong></div>
          <div><span style={{ color: "var(--text-muted)" }}>Remaining after plan</span><br /><strong style={{ color: rescuePlan.remaining_gap_after_plan_inr > 0 ? "#b42318" : "#16713a" }}>{fmt(rescuePlan.remaining_gap_after_plan_inr, rescuePlan.remaining_gap_after_plan_usd)}</strong></div>
        </div>
      </div>

      <p style={{ fontSize: ".78rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: ".85rem" }}>{rescuePlan.rescue_strategy_summary}</p>

      {/* Layers */}
      <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
        {(rescuePlan.components || []).map((comp, i) => (
          <RescueLayer key={i} comp={comp} currency={currency} />
        ))}
      </div>
    </div>
  );
}
