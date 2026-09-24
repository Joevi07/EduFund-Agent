import React, { useState, useEffect } from "react";
import { Copy, AlertTriangle, Clock, CheckCircle2, Layers } from "lucide-react";
import { fetchDocumentCollisions } from "../services/api";

export default function DocumentCollisionWidget({ profile }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchDocumentCollisions(profile);
        setData(res);
      } catch (err) {
        console.error("Collision error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  if (loading || !data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Copy size={18} color="#20a8d8" /> Document Reuse & Deadline Collision Audit
        </h3>
        <span className="badge badge-high">{data.total_repetition_saved_pct}% EFFORT SAVED</span>
      </div>

      {/* Collision Alert Banner */}
      {data.collision_alerts.length > 0 && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffeba5", color: "#856404", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={16} color="#d97706" />
          <span>{data.collision_alerts[0]}</span>
        </div>
      )}

      {/* Document Reuse Matrix */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#636c72" }}>REUSABLE DOCUMENT MAP</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {data.reusable_documents.map((doc, idx) => (
            <div key={idx} style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8rem" }}>
              <div style={{ fontWeight: 700, color: "#272c33", marginBottom: "0.2rem" }}>{doc.document_name}</div>
              <div style={{ color: "#20a8d8", fontWeight: 600, fontSize: "0.75rem" }}>
                Satisfies {doc.reuse_count} applications ({doc.effort_saved_hours} hrs saved)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
