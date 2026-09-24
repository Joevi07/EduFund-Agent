import React, { useState, useEffect } from "react";
import { ShieldCheck, TrendingUp, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import { fetchConfidenceMeter } from "../services/api";

export default function ConfidenceMeterWidget({ profile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfidence() {
      setLoading(true);
      try {
        const res = await fetchConfidenceMeter(profile);
        setData(res);
      } catch (err) {
        console.error("Confidence error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfidence();
  }, [profile]);

  if (loading || !data) return null;

  const score = data.overall_confidence_score;
  const isHigh = score >= 80;
  const badgeClass = isHigh ? "badge-high" : "badge-medium";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={18} color={isHigh ? "#059669" : "#d97706"} /> Funding Confidence Meter
        </h3>
        <span className={`badge ${badgeClass}`}>{score}% CONFIDENCE</span>
      </div>

      {/* Progress Score Bar */}
      <div style={{ background: "#e2e8f0", height: "10px", borderRadius: "9999px", overflow: "hidden" }}>
        <div 
          style={{ 
            width: `${score}%`, 
            height: "100%", 
            background: isHigh ? "linear-gradient(90deg, #059669, #10b981)" : "linear-gradient(90deg, #d97706, #f59e0b)",
            borderRadius: "9999px",
            transition: "width 0.8s ease" 
          }} 
        />
      </div>

      {/* Driver List */}
      <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "0.3rem", marginTop: "0.2rem" }}>
        {data.key_drivers.map((drv, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#155724" }}>
            <CheckCircle2 size={14} color="#059669" /> {drv}
          </div>
        ))}
      </div>
    </div>
  );
}
