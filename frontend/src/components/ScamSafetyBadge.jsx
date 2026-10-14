import React, { useState } from "react";
import { Shield, ShieldCheck, Clock, Globe, BadgeDollarSign, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

export default function ScamSafetyBadge({ opportunity, inline = false }) {
  const [open, setOpen] = useState(false);
  if (!opportunity) return null;

  const { source_verified, is_official_domain, requires_application_fee, last_reviewed_date, risk_level = "SAFE" } = opportunity;

  const isSafe = source_verified && is_official_domain && !requires_application_fee;
  const needsReview = risk_level === "REVIEW" || !source_verified;

  const checks = [
    { label: "Official domain verified",       ok: is_official_domain,            icon: Globe },
    { label: "Source authenticity confirmed",   ok: source_verified,               icon: ShieldCheck },
    { label: "Zero application fee",            ok: !requires_application_fee,     icon: BadgeDollarSign },
    { label: `Last reviewed ${last_reviewed_date || "recently"}`, ok: !!last_reviewed_date, icon: Clock },
  ];

  if (inline) {
    // Compact badge only
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: ".3rem",
        padding: ".2rem .55rem", borderRadius: 999, fontSize: ".65rem", fontWeight: 700,
        background: isSafe ? "rgba(22,113,58,.12)" : "rgba(180,35,24,.1)",
        color: isSafe ? "#16713a" : "#b42318",
        border: `1px solid ${isSafe ? "rgba(22,113,58,.25)" : "rgba(180,35,24,.2)"}`,
      }}>
        {isSafe ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
        {isSafe ? "Safety Verified" : "Review Required"}
      </span>
    );
  }

  return (
    <div style={{ border: `1px solid ${isSafe ? "rgba(22,113,58,.22)" : "rgba(180,35,24,.22)"}`, borderRadius: 12, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: ".7rem 1rem", background: isSafe ? "rgba(22,113,58,.06)" : "rgba(180,35,24,.06)",
          border: "none", cursor: "pointer", gap: ".75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
          {isSafe ? <ShieldCheck size={16} color="#16713a" /> : <AlertTriangle size={16} color="#b42318" />}
          <span style={{ fontWeight: 700, fontSize: ".82rem", color: isSafe ? "#16713a" : "#b42318" }}>
            {isSafe ? "Scam Safety: Verified ✓" : "Scam Safety: Review Required"}
          </span>
          <span style={{
            padding: ".15rem .4rem", borderRadius: 999, fontSize: ".62rem", fontWeight: 800,
            background: isSafe ? "#16713a" : "#b42318", color: "#fff",
          }}>{isSafe ? "SAFE" : "REVIEW"}</span>
        </div>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>

      {open && (
        <div style={{ padding: ".75rem 1rem", display: "flex", flexDirection: "column", gap: ".5rem", background: "#fff" }}>
          {checks.map(({ label, ok, icon: Icon }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: ok ? "rgba(22,113,58,.14)" : "rgba(180,35,24,.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={12} color={ok ? "#16713a" : "#b42318"} />
              </div>
              <span style={{ fontSize: ".78rem", color: ok ? "var(--text-primary)" : "#b42318", fontWeight: ok ? 500 : 700 }}>{label}</span>
              <span style={{ marginLeft: "auto", fontSize: ".68rem", fontWeight: 800, color: ok ? "#16713a" : "#b42318" }}>
                {ok ? "✓" : "✗"}
              </span>
            </div>
          ))}
          {needsReview && (
            <div style={{ marginTop: ".35rem", padding: ".55rem .7rem", background: "rgba(180,35,24,.06)", border: "1px solid rgba(180,35,24,.15)", borderRadius: 8, fontSize: ".72rem", color: "#b42318", lineHeight: 1.45 }}>
              ⚠ Always verify the official scholarship website directly. Legitimate scholarships never request upfront payment.
            </div>
          )}
          <div style={{ marginTop: ".35rem", padding: ".55rem .7rem", background: "rgba(18,163,165,.05)", border: "1px solid rgba(18,163,165,.15)", borderRadius: 8, fontSize: ".72rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
            🔒 EduFund checks official domains and fee requirements. Always protect your login credentials and personal documents.
          </div>
        </div>
      )}
    </div>
  );
}
