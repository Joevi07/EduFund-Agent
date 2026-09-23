import React, { useState } from "react";
import { UserCheck, Compass, CheckCircle2, Target, FileText, Kanban, ArrowRight } from "lucide-react";

export default function AgentNodeGraph({ onSelectAgentNode }) {
  const [activeNode, setActiveNode] = useState("planner");

  const nodes = [
    { id: "profile", title: "Profile Agent", icon: UserCheck, desc: "Parses student academic & financial parameters" },
    { id: "discovery", title: "Discovery Agent", icon: Compass, desc: "Queries curated database of 25+ funding sources" },
    { id: "eligibility", title: "Eligibility Agent", icon: CheckCircle2, desc: "Performs multi-attribute criteria reasoning" },
    { id: "planner", title: "Planner Agent", icon: Target, desc: "Calculates Funding Gap & solves optimal EV stack" },
    { id: "autopilot", title: "Autopilot Agent", icon: FileText, desc: "Drafts tailored essays & audits documents" },
    { id: "deadline", title: "Deadline Agent", icon: Kanban, desc: "Monitors closing urgency & pipeline status" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          ⚡ Multi-Agent Execution Flow Architecture
        </h3>
        <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>6 ACTIVE AGENTS</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
        gap: "0.8rem",
        position: "relative"
      }}>
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isSelected = activeNode === node.id;
          return (
            <div
              key={node.id}
              className={`agent-node ${isSelected ? "active" : ""}`}
              onClick={() => {
                setActiveNode(node.id);
                if (onSelectAgentNode) onSelectAgentNode(node.id);
              }}
              style={{
                borderColor: isSelected ? "var(--neon-indigo)" : "var(--border-subtle)",
                background: isSelected ? "rgba(99, 102, 241, 0.15)" : "rgba(15, 23, 42, 0.8)"
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: isSelected ? "var(--neon-indigo)" : "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Icon size={16} color={isSelected ? "#ffffff" : "var(--neon-indigo)"} />
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{node.title}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" }}>
                  {node.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
