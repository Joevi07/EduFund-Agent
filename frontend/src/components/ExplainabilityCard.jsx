import React, { useState } from "react";
import { Sparkles, CheckCircle, AlertCircle, Zap, ChevronDown, ChevronUp } from "lucide-react";

export default function ExplainabilityCard({ explainability, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  if (!explainability) return null;

  const { why_matched, profile_facts_helped = [], conditions_to_verify = [], readiness_actions = [], match_strength_label = "MEDIUM" } = explainability;

  const strengthColors = {
    HIGH:   { bg: "linear-gradient(135deg,rgba(22,113,58,.12),rgba(22,113,58,.06))", border: "rgba(22,113,58,.25)", badge: "#16713a", label: "Strong Match" },
    MEDIUM: { bg: "linear-gradient(135deg,rgba(18,163,165,.1),rgba(18,163,165,.04))", border: "rgba(18,163,165,.25)", badge: "var(--teal-600)", label: "Good Match" },
    LOW:    { bg: "linear-gradient(135deg,rgba(180,35,24,.08),rgba(180,35,24,.04))", border: "rgba(180,35,24,.2)", badge: "#b42318", label: "Low Alignment" },
  };
  const colors = strengthColors[match_strength_label] || strengthColors.MEDIUM;

  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem", padding: ".75rem 1rem", cursor: compact ? "pointer" : "default" }}
        onClick={() => compact && setExpanded(v => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <Sparkles size={15} color={colors.badge} />
          <span style={{ fontWeight: 700, fontSize: ".82rem", color: colors.badge }}>{colors.label} — Why this match?</span>
        </div>
        {compact && (
          <button style={{ border: "none", background: "none", cursor: "pointer", color: colors.badge, padding: 0, display: "flex" }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ padding: "0 1rem 1rem", display: "flex", flexDirection: "column", gap: ".65rem" }}>
          {/* Why matched summary */}
          <p style={{ fontSize: ".8rem", color: "var(--text-primary)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
            "{why_matched}"
          </p>

          {/* Two-column details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: ".65rem" }}>
            {profile_facts_helped.length > 0 && (
              <div style={{ background: "rgba(22,113,58,.06)", border: "1px solid rgba(22,113,58,.18)", borderRadius: 9, padding: ".65rem .75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".45rem" }}>
                  <CheckCircle size={13} color="#16713a" />
                  <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#16713a", textTransform: "uppercase", letterSpacing: ".04em" }}>Profile Facts That Helped</span>
                </div>
                {profile_facts_helped.map((fact, i) => (
                  <p key={i} style={{ fontSize: ".72rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: ".2rem 0 0" }}>• {fact}</p>
                ))}
              </div>
            )}

            {conditions_to_verify.length > 0 && (
              <div style={{ background: "rgba(161,92,0,.05)", border: "1px solid rgba(161,92,0,.18)", borderRadius: 9, padding: ".65rem .75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".45rem" }}>
                  <AlertCircle size={13} color="#a15c00" />
                  <span style={{ fontSize: ".7rem", fontWeight: 800, color: "#a15c00", textTransform: "uppercase", letterSpacing: ".04em" }}>Conditions to Verify</span>
                </div>
                {conditions_to_verify.map((cond, i) => (
                  <p key={i} style={{ fontSize: ".72rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: ".2rem 0 0" }}>• {cond}</p>
                ))}
              </div>
            )}
          </div>

          {readiness_actions.length > 0 && (
            <div style={{ background: "rgba(18,163,165,.06)", border: "1px solid rgba(18,163,165,.18)", borderRadius: 9, padding: ".65rem .75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".45rem" }}>
                <Zap size={13} color="var(--teal-600)" />
                <span style={{ fontSize: ".7rem", fontWeight: 800, color: "var(--teal-600)", textTransform: "uppercase", letterSpacing: ".04em" }}>Readiness Actions</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: ".22rem" }}>
                {readiness_actions.map((action, i) => (
                  <div key={i} style={{ display: "flex", gap: ".5rem", alignItems: "flex-start" }}>
                    <span style={{ minWidth: 18, height: 18, borderRadius: "50%", background: "var(--teal-500)", color: "#fff", fontSize: ".6rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontSize: ".72rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
