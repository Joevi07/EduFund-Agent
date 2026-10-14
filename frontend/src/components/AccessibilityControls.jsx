import React from "react";
import { Accessibility, Type, Sun, Wifi, Download } from "lucide-react";

export default function AccessibilityControls({ settings, onChange }) {
  const { fontSize = "normal", highContrast = false, lowBandwidth = false } = settings || {};

  const fontOptions = [
    { value: "normal",     label: "A",    tip: "Normal" },
    { value: "large",      label: "A+",   tip: "Large" },
    { value: "xlarge",     label: "A++",  tip: "Extra Large" },
  ];

  const set = (key, val) => onChange && onChange({ ...settings, [key]: val });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
      {/* Font size */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", marginBottom: ".45rem" }}>
          <Type size={13} color="var(--text-muted)" />
          <span style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--text-secondary)" }}>Text Size</span>
        </div>
        <div style={{ display: "flex", gap: ".35rem" }}>
          {fontOptions.map(opt => (
            <button
              key={opt.value}
              title={opt.tip}
              onClick={() => set("fontSize", opt.value)}
              style={{
                flex: 1, padding: ".4rem", border: fontSize === opt.value ? "2px solid var(--teal-500)" : "1px solid var(--border-subtle)",
                borderRadius: 9, background: fontSize === opt.value ? "rgba(18,163,165,.1)" : "#fff",
                color: fontSize === opt.value ? "var(--teal-700)" : "var(--text-secondary)",
                fontWeight: 800, fontSize: opt.value === "normal" ? ".8rem" : opt.value === "large" ? ".95rem" : "1.1rem",
                cursor: "pointer", transition: "all .15s ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* High contrast */}
      <button
        onClick={() => set("highContrast", !highContrast)}
        style={{
          display: "flex", alignItems: "center", gap: ".7rem", padding: ".5rem .85rem",
          border: highContrast ? "2px solid var(--teal-500)" : "1px solid var(--border-subtle)",
          borderRadius: 10, background: highContrast ? "rgba(18,163,165,.08)" : "#fff",
          cursor: "pointer", width: "100%", textAlign: "left",
        }}
      >
        <Sun size={15} color={highContrast ? "var(--teal-600)" : "var(--text-muted)"} />
        <div>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--text-primary)" }}>High Contrast Mode</div>
          <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>Enhanced readability for visual accessibility</div>
        </div>
        <div style={{ marginLeft: "auto", width: 32, height: 18, borderRadius: 999, background: highContrast ? "var(--teal-500)" : "#d1d5db", position: "relative", transition: "background .18s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 2, left: highContrast ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", transition: "left .18s" }} />
        </div>
      </button>

      {/* Low bandwidth */}
      <button
        onClick={() => set("lowBandwidth", !lowBandwidth)}
        style={{
          display: "flex", alignItems: "center", gap: ".7rem", padding: ".5rem .85rem",
          border: lowBandwidth ? "2px solid var(--teal-500)" : "1px solid var(--border-subtle)",
          borderRadius: 10, background: lowBandwidth ? "rgba(18,163,165,.08)" : "#fff",
          cursor: "pointer", width: "100%", textAlign: "left",
        }}
      >
        <Wifi size={15} color={lowBandwidth ? "var(--teal-600)" : "var(--text-muted)"} />
        <div>
          <div style={{ fontSize: ".78rem", fontWeight: 700, color: "var(--text-primary)" }}>Low-Bandwidth Mode</div>
          <div style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>Disables blurs & animations — instant text rendering</div>
        </div>
        <div style={{ marginLeft: "auto", width: 32, height: 18, borderRadius: 999, background: lowBandwidth ? "var(--teal-500)" : "#d1d5db", position: "relative", transition: "background .18s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 2, left: lowBandwidth ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", transition: "left .18s" }} />
        </div>
      </button>

      {/* Download offline plan */}
      <button
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem",
          padding: ".5rem .85rem", border: "1px solid var(--border-subtle)", borderRadius: 10,
          background: "#fff", cursor: "pointer", fontSize: ".75rem", fontWeight: 700, color: "var(--text-secondary)",
        }}
        onClick={() => {
          const data = "# EduFund Offline Funding Plan\n\nThis is your downloadable funding plan summary.\nPlease complete your profile and run the planner online for the full plan.";
          const blob = new Blob([data], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "edufund-offline-plan.md"; a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <Download size={14} /> Download Offline Plan (.md)
      </button>
    </div>
  );
}
