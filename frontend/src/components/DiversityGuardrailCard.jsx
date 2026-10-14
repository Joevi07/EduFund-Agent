import React from "react";
import { BarChart3, AlertTriangle, Lightbulb, Globe, Tag, Building } from "lucide-react";

function MiniBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".6rem", fontSize: ".78rem" }}>
      <span style={{ minWidth: 130, color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width .4s ease" }} />
      </div>
      <span style={{ minWidth: 36, textAlign: "right", fontWeight: 700, color }}>{pct}%</span>
    </div>
  );
}

const RISK_CONFIG = {
  BALANCED:      { color: "#16713a", bg: "rgba(22,113,58,.08)", label: "Well Balanced" },
  LOW:           { color: "#16713a", bg: "rgba(22,113,58,.08)", label: "Well Balanced" },
  MODERATE_RISK: { color: "#d97706", bg: "rgba(217,119,6,.08)", label: "Moderate Risk — Rebalance Advised" },
  HIGH_RISK:     { color: "#b42318", bg: "rgba(180,35,24,.08)", label: "High Risk — Rebalance Urgently" },
};

export default function DiversityGuardrailCard({ diversityGuardrail }) {
  if (!diversityGuardrail) return null;
  const dg = diversityGuardrail;
  const cfg = RISK_CONFIG[dg.risk_level] || RISK_CONFIG.BALANCED;
  const totalApps = Object.values(dg.category_breakdown || {}).reduce((s, v) => s + v, 0);

  const sections = [
    { title: "By Source",    icon: Building, data: dg.source_breakdown   || {}, color: "#0891b2" },
    { title: "By Country",   icon: Globe,    data: dg.country_breakdown   || {}, color: "#7c3aed" },
    { title: "By Category",  icon: Tag,      data: dg.category_breakdown  || {}, color: "#16713a" },
  ];

  return (
    <div className="bento-box" style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          <div style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}cc)`, borderRadius: 9, padding: 7, boxShadow: `0 3px 12px ${cfg.color}40` }}>
            <BarChart3 size={17} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Portfolio Diversity Guardrail</h3>
            <p style={{ fontSize: ".75rem", color: "var(--text-secondary)", margin: 0 }}>Risk analysis across your application strategy</p>
          </div>
        </div>
        <div style={{ padding: ".35rem .85rem", borderRadius: 999, background: cfg.color, color: "#fff", fontSize: ".72rem", fontWeight: 800 }}>
          {cfg.label}
        </div>
      </div>

      {/* Concentration score */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.8rem", fontWeight: 900, color: cfg.color, lineHeight: 1 }}>{dg.concentration_score}</div>
          <div style={{ fontSize: ".62rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Concentration</div>
          <div style={{ fontSize: ".6rem", color: "var(--text-muted)" }}>Lower = Better</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${dg.concentration_score}%`, height: "100%", background: `linear-gradient(90deg,#16713a,${cfg.color})`, borderRadius: 999, transition: "width .4s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".62rem", color: "var(--text-muted)", marginTop: 4 }}>
            <span>Diverse</span><span>Concentrated</span>
          </div>
        </div>
      </div>

      {/* Breakdown sections */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "1rem" }}>
        {sections.map(({ title, icon: Icon, data, color }) => (
          <div key={title} style={{ background: "rgba(255,255,255,.7)", border: "1px solid var(--border-subtle)", borderRadius: 10, padding: ".75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".6rem" }}>
              <Icon size={14} color={color} />
              <span style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".38rem" }}>
              {Object.entries(data).map(([key, val]) => (
                <MiniBar key={key} label={key} count={val} total={totalApps || 1} color={color} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {dg.warnings?.length > 0 && (
        <div style={{ marginBottom: ".75rem", padding: ".7rem .85rem", background: "rgba(180,35,24,.07)", border: "1px solid rgba(180,35,24,.2)", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".4rem" }}>
            <AlertTriangle size={14} color="#b42318" />
            <span style={{ fontSize: ".75rem", fontWeight: 800, color: "#b42318" }}>Risk Warnings</span>
          </div>
          {dg.warnings.map((w, i) => <p key={i} style={{ fontSize: ".75rem", color: "#b42318", margin: ".15rem 0 0", lineHeight: 1.45 }}>• {w}</p>)}
        </div>
      )}

      {/* Recommendations */}
      {dg.recommendations?.length > 0 && (
        <div style={{ padding: ".7rem .85rem", background: "rgba(22,113,58,.06)", border: "1px solid rgba(22,113,58,.2)", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".4rem" }}>
            <Lightbulb size={14} color="#16713a" />
            <span style={{ fontSize: ".75rem", fontWeight: 800, color: "#16713a" }}>Recommendations</span>
          </div>
          {dg.recommendations.map((r, i) => <p key={i} style={{ fontSize: ".75rem", color: "var(--text-secondary)", margin: ".15rem 0 0", lineHeight: 1.45 }}>• {r}</p>)}
        </div>
      )}
    </div>
  );
}
