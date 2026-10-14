import React from "react";
import { UserCheck, Star, Zap, AlertCircle } from "lucide-react";

const FIELD_GROUPS = [
  { key: "name",           label: "Full Name",              impact: 5 },
  { key: "education_level",label: "Education Level",        impact: 8 },
  { key: "course",         label: "Course / Field",         impact: 8 },
  { key: "gpa",            label: "GPA / Academic Score",   impact: 10 },
  { key: "location",       label: "Location / State",       impact: 7 },
  { key: "income",         label: "Family Income",          impact: 10 },
  { key: "interests",      label: "Interests & Goals",      impact: 8 },
  { key: "achievements",   label: "Achievements",           impact: 12 },
  { key: "study_dest",     label: "Study Destination",      impact: 7 },
  { key: "standardized",   label: "Test Score (SAT/JEE)",   impact: 10 },
];

function computeCompletion(profile) {
  if (!profile) return { pct: 0, completed: [], missing: [] };
  const completed = [], missing = [];
  const p = profile;
  const checks = {
    name:         !!p.name?.trim(),
    education_level: !!p.education_level?.trim(),
    course:       !!p.course?.trim(),
    gpa:          !!(p.academic_profile?.gpa > 0),
    location:     !!(p.location?.country || p.location?.state),
    income:       !!(p.financial_constraints?.annual_family_income_inr > 0),
    interests:    !!(p.interests?.length > 0),
    achievements: !!(p.achievements?.length > 0),
    study_dest:   !!(p.location?.study_destination),
    standardized: !!(p.academic_profile?.standardized_test),
  };
  let earned = 0;
  for (const f of FIELD_GROUPS) {
    if (checks[f.key]) { completed.push(f); earned += f.impact; }
    else missing.push(f);
  }
  return { pct: Math.min(100, earned), completed, missing };
}

export default function ProfileCompletionCoach({ profile, coach, onNavigate }) {
  // Use server data if provided, otherwise compute locally
  const { pct, completed, missing } = coach
    ? { pct: coach.completion_percentage, completed: [], missing: coach.missing_fields || [] }
    : computeCompletion(profile);

  const unlockEstimate = missing.length > 0 ? `+${missing.length * 3}–${missing.length * 5}% more awards unlocked` : "All fields complete — maximum discovery!";

  const r = 52, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;
  const ringColor = pct >= 80 ? "#16713a" : pct >= 50 ? "#0891b2" : "#d97706";

  return (
    <div className="bento-box" style={{ background: "linear-gradient(145deg,rgba(124,58,237,.04),rgba(18,163,165,.03))", border: "1px solid rgba(124,58,237,.18)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", borderRadius: 9, padding: 7, boxShadow: "0 3px 12px rgba(124,58,237,.3)" }}>
          <UserCheck size={17} color="#fff" />
        </div>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Profile Completion Coach</h3>
          <p style={{ fontSize: ".75rem", color: "var(--text-secondary)", margin: 0 }}>Complete your profile to unlock more funding opportunities</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {/* Radial ring */}
        <svg width={120} height={120} viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={10} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth={10} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dashOffset} transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset .5s ease" }} />
          <text x={cx} y={cy + 6} textAnchor="middle" fontWeight="900" fontSize="26" fill={ringColor}>{pct}%</text>
          <text x={cx} y={cy + 20} textAnchor="middle" fontWeight="600" fontSize="10" fill="var(--text-muted)">Complete</text>
        </svg>

        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: ".35rem" }}>
            {pct >= 80 ? "🎉 Excellent Profile!" : pct >= 50 ? "📈 Good Progress!" : "🚀 Let's Build Your Profile"}
          </div>
          <div style={{ padding: ".5rem .75rem", background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.2)", borderRadius: 9, fontSize: ".78rem", fontWeight: 700, color: "#7c3aed" }}>
            <Zap size={13} style={{ marginRight: ".3rem", verticalAlign: "middle" }} />{unlockEstimate}
          </div>

          {coach?.quick_tips?.length > 0 && (
            <div style={{ marginTop: ".6rem", fontSize: ".72rem", color: "var(--text-secondary)" }}>
              {coach.quick_tips.slice(0, 2).map((tip, i) => <p key={i} style={{ margin: ".18rem 0" }}>💡 {tip}</p>)}
            </div>
          )}
        </div>
      </div>

      {/* Missing fields */}
      {missing.length > 0 && (
        <div style={{ marginBottom: ".8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".5rem" }}>
            <AlertCircle size={14} color="#d97706" />
            <span style={{ fontSize: ".78rem", fontWeight: 800, color: "var(--text-primary)" }}>Missing Fields — Fill in to unlock more scholarships</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: ".4rem" }}>
            {(Array.isArray(missing) && typeof missing[0] === "object"
              ? missing.map(f => ({ label: f.label || f.field, impact: f.impact || 5 }))
              : missing.map(f => ({ label: f.label, impact: f.impact }))
            ).map(({ label, impact }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: ".45rem", padding: ".4rem .6rem", border: "1px solid rgba(217,119,6,.2)", borderRadius: 8, background: "rgba(217,119,6,.05)" }}>
                <Star size={11} color="#d97706" />
                <span style={{ fontSize: ".72rem", color: "var(--text-secondary)", flex: 1 }}>{label}</span>
                <span style={{ fontSize: ".6rem", fontWeight: 800, color: "#d97706" }}>+{impact}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onNavigate && (
        <button
          onClick={() => onNavigate("profile")}
          style={{ width: "100%", padding: ".6rem 1rem", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: ".82rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,.3)" }}
        >
          Complete Your Profile →
        </button>
      )}
    </div>
  );
}
