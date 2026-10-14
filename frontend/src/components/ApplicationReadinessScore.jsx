import React from "react";
import { CheckCircle, FileText, Edit3, Clock, Star } from "lucide-react";

const DIMENSIONS = [
  { key: "eligibility",  label: "Eligibility Match",       weight: 25, icon: CheckCircle, color: "#0891b2" },
  { key: "documents",    label: "Required Documents",       weight: 25, icon: FileText,    color: "#16713a" },
  { key: "essay",        label: "Essay / Statement",        weight: 20, icon: Edit3,       color: "#7c3aed" },
  { key: "deadline",     label: "Deadline Urgency",         weight: 15, icon: Clock,       color: "#d97706" },
  { key: "review",       label: "Student Self-Review",      weight: 15, icon: Star,        color: "#db2777" },
];

function computeDimensionScores({ matchScore = 0, docCount = 0, requiredDocCount = 0, hasDraft = false, daysLeft = 60, selfReviewDone = false }) {
  const eligibility = Math.round(((matchScore / 100) * 25));
  const documents   = requiredDocCount > 0 ? Math.round((docCount / requiredDocCount) * 25) : 20;
  const essay       = hasDraft ? 20 : 5;
  const deadline    = daysLeft <= 0 ? 0 : daysLeft <= 7 ? 15 : daysLeft <= 21 ? 12 : daysLeft <= 60 ? 8 : 5;
  const review      = selfReviewDone ? 15 : 5;
  return { eligibility, documents, essay, deadline, review };
}

export default function ApplicationReadinessScore({ opportunity, matchScore = 0, uploadedDocs = [], hasDraft = false, selfReviewDone = false, compact = false }) {
  const requiredDocCount = opportunity?.required_documents?.length || 0;
  const docCount = Math.min(uploadedDocs.length, requiredDocCount);
  const daysLeft = opportunity?.days_left ?? 60;

  const scores = computeDimensionScores({ matchScore, docCount, requiredDocCount, hasDraft, daysLeft, selfReviewDone });
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0);

  const totalColor = total >= 75 ? "#16713a" : total >= 50 ? "#0891b2" : total >= 30 ? "#d97706" : "#b42318";
  const totalLabel = total >= 75 ? "Application Ready" : total >= 50 ? "Good Progress" : total >= 30 ? "Needs Attention" : "Getting Started";

  // SVG radial ring
  const r = 38, cx = 48, cy = 48, circ = 2 * Math.PI * r;
  const dashOffset = circ - (total / 100) * circ;

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem", padding: ".5rem .75rem", background: `${totalColor}10`, border: `1px solid ${totalColor}30`, borderRadius: 10 }}>
        <svg width={36} height={36} viewBox="0 0 96 96">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={9} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={totalColor} strokeWidth={9} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset} transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset .5s ease" }} />
          <text x={cx} y={cy + 5} textAnchor="middle" fontWeight="800" fontSize="22" fill={totalColor}>{total}</text>
        </svg>
        <div>
          <div style={{ fontSize: ".8rem", fontWeight: 800, color: totalColor }}>{totalLabel}</div>
          <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>Readiness Score / 100</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: ".85rem 1rem", background: "linear-gradient(135deg,rgba(8,145,178,.06),rgba(18,163,165,.04))", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: ".7rem" }}>
        <svg width={72} height={72} viewBox="0 0 96 96">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={10} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={totalColor} strokeWidth={10} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset} transform="rotate(-90 48 48)" style={{ transition: "stroke-dashoffset .5s ease" }} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontWeight="800" fontSize="24" fill={totalColor}>{total}</text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontWeight="600" fontSize="12" fill="var(--text-muted)">/100</text>
        </svg>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: totalColor }}>{totalLabel}</div>
          <div style={{ fontSize: ".76rem", color: "var(--text-secondary)", marginTop: 2 }}>Application Readiness Score — 5 dimensions</div>
        </div>
      </div>
      <div style={{ padding: ".75rem 1rem", display: "grid", gap: ".5rem" }}>
        {DIMENSIONS.map(({ key, label, weight, icon: Icon, color }) => {
          const score = scores[key];
          const pct = Math.round((score / weight) * 100);
          return (
            <div key={key} style={{ display: "grid", gridTemplateColumns: "20px 1fr auto 48px", alignItems: "center", gap: ".6rem" }}>
              <Icon size={14} color={color} />
              <div>
                <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--text-primary)" }}>{label}</div>
                <div style={{ height: 5, background: "#e5e7eb", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" }} />
                </div>
              </div>
              <span style={{ fontSize: ".68rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>/{weight}pts</span>
              <strong style={{ fontSize: ".82rem", textAlign: "right", color }}>{score}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
