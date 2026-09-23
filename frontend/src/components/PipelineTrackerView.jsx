import React, { useEffect, useState } from "react";
import { Kanban, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { fetchDeadlines } from "../services/api";

export default function PipelineTrackerView({ opportunities, currency, applications = [], onUpdateStatus }) {
  const isINR = currency === "INR";
  const formatAmt = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;
  const [deadlineData, setDeadlineData] = useState(null);

  useEffect(() => { fetchDeadlines().then(setDeadlineData); }, []);

  const columns = [
    { id: "DISCOVERED", label: "Discovered", badge: "badge-indigo", next: "PLANNED" },
    { id: "PLANNED", label: "Planner Strategy Stack", badge: "badge-high", next: "DRAFTING" },
    { id: "DRAFTING", label: "Autopilot Drafting", badge: "badge-medium", next: "READY_TO_SUBMIT" },
    { id: "READY_TO_SUBMIT", label: "Ready to Submit", badge: "badge-high", next: "SUBMITTED" },
    { id: "SUBMITTED", label: "Submitted", badge: "badge-high" }
  ];

  const getColItems = (colId) => {
    return opportunities.filter(o => (applications.find(a => a.opportunity_id === o.id)?.status || "DISCOVERED") === colId);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
          <Kanban size={24} color="var(--accent-indigo)" />
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Agent 7 — Pipeline & Deadline Tracker</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Persisted application workflow from discovery through student-authorized submission. Move cards forward as work is completed.
        </p>
      </div>

      {/* Deadline Urgency Banner */}
      <div className="glass-card" style={{ padding: "1.2rem 1.8rem", borderColor: "rgba(245, 158, 11, 0.4)", background: "rgba(245, 158, 11, 0.05)", display: "flex", alignItems: "center", gap: "1rem" }}>
        <AlertTriangle size={24} color="var(--accent-amber)" />
        <div>
          <strong style={{ color: "var(--accent-amber)" }}>Deadline Agent Urgency Alert:</strong> 
          <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
            {deadlineData?.alerts?.[0] || "No deadline alerts right now."}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.2rem",
        alignItems: "start"
      }}>
        {columns.map(col => {
          const items = getColItems(col.id);
          return (
            <div key={col.id} className="glass-card" style={{ padding: "1.2rem", background: "rgba(17, 24, 39, 0.6)", minHeight: "400px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{col.label}</h3>
                <span className={`badge ${col.badge}`}>{items.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {items.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center", padding: "2rem 0" }}>
                    No items in stage
                  </div>
                ) : (
                  items.map(opp => (
                    <div 
                      key={opp.id} 
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        padding: "1rem"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.4rem" }}>
                        <span style={{ color: "var(--accent-indigo)", fontWeight: 600 }}>{opp.category}</span>
                        <span style={{ color: opp.days_left <= 15 ? "var(--accent-amber)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <Clock size={12} /> {opp.days_left}d left
                        </span>
                      </div>
                      <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.4rem" }}>{opp.title}</h4>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                        {formatAmt(opp.amount_inr, opp.amount_usd)}
                      </div>
                      {col.next && (
                        <button className="btn-secondary" onClick={() => onUpdateStatus?.(opp.id, col.next)} style={{ marginTop: "0.8rem", width: "100%", justifyContent: "center", fontSize: "0.75rem" }}>
                          Move to {columns.find(c => c.id === col.next)?.label} <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
