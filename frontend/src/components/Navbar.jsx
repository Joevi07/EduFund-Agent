import React from "react";
import { 
  Bot, 
  LayoutDashboard, 
  Target, 
  Compass, 
  FileText, 
  Kanban, 
  UserCheck, 
  DollarSign, 
  IndianRupee 
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, currency, setCurrency, backendConnected }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Student Profile", icon: UserCheck },
    { id: "planner", label: "Funding Planner", icon: Target },
    { id: "discovery", label: "Opportunity Market", icon: Compass },
    { id: "autopilot", label: "Autopilot Workspace", icon: FileText },
    { id: "pipeline", label: "Pipeline & Deadlines", icon: Kanban },
  ];

  return (
    <header style={{
      borderBottom: "1px solid var(--border-color)",
      background: "rgba(10, 14, 23, 0.9)",
      backdropFilter: "blur(20px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
      padding: "0.8rem 2rem"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        {/* Logo & Agent Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--accent-indigo), #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)"
          }}>
            <Bot size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Edu<span style={{ color: "var(--accent-emerald)" }}>Fund</span>
              </h1>
              <span className="badge badge-indigo" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                AI AGENT PLATFORM
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <div className="agent-dot" style={{ backgroundColor: backendConnected ? "var(--accent-emerald)" : "var(--accent-amber)" }} />
              <span>{backendConnected ? "Python Multi-Agent API Active" : "Local Client Agent Active"}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", gap: "0.4rem", overflowX: "auto" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                  color: isActive ? "var(--accent-indigo)" : "var(--text-secondary)",
                  border: isActive ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                  padding: "0.5rem 0.9rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Currency Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(255, 255, 255, 0.05)", padding: "0.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
          <button
            onClick={() => setCurrency("INR")}
            style={{
              background: currency === "INR" ? "var(--accent-emerald)" : "transparent",
              color: currency === "INR" ? "#ffffff" : "var(--text-secondary)",
              border: "none",
              padding: "0.3rem 0.65rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem"
            }}
          >
            <IndianRupee size={12} /> INR (₹)
          </button>
          <button
            onClick={() => setCurrency("USD")}
            style={{
              background: currency === "USD" ? "var(--accent-indigo)" : "transparent",
              color: currency === "USD" ? "#ffffff" : "var(--text-secondary)",
              border: "none",
              padding: "0.3rem 0.65rem",
              borderRadius: "4px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem"
            }}
          >
            <DollarSign size={12} /> USD ($)
          </button>
        </div>
      </div>
    </header>
  );
}
