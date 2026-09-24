import React from "react";
import { 
  Bot, 
  LayoutDashboard, 
  UserCheck, 
  Target, 
  Compass, 
  FileText, 
  Kanban,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, profile, collapsed, setCollapsed, onOpenHowItWorks }) {
  const mainNav = [
    { id: "dashboard", label: "Main Dashboard", icon: LayoutDashboard },
    { id: "planner", label: "Funding Planner", icon: Target },
  ];

  const agentNav = [
    { id: "profile", label: "Profile Agent", icon: UserCheck },
    { id: "discovery", label: "Opportunity Market", icon: Compass },
    { id: "autopilot", label: "Autopilot Studio", icon: FileText },
    { id: "pipeline", label: "Pipeline & Deadlines", icon: Kanban },
  ];

  return (
    <aside className="app-sidebar" style={{ width: collapsed ? "70px" : "260px" }}>
      <div>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.8rem", padding: "0 1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#20a8d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Bot size={20} color="#ffffff" />
            </div>
            {!collapsed && (
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
                Edu<span style={{ color: "#20a8d8" }}>Fund</span>
              </h1>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "#383e47",
              border: "none",
              color: "#a0b0c0",
              borderRadius: "4px",
              padding: "0.25rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Section 1: Dashboards */}
        {!collapsed && (
          <div style={{ padding: "0 1.2rem", fontSize: "0.68rem", fontWeight: 700, color: "#6c7b88", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            DASHBOARDS
          </div>
        )}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginBottom: "1.5rem", padding: "0 0.6rem" }}>
          {mainNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? "#383e47" : "transparent",
                  color: isActive ? "#ffffff" : "#a0b0c0",
                  border: "none",
                  padding: collapsed ? "0.75rem 0" : "0.65rem 0.9rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: "0.75rem",
                  transition: "all 0.15s ease"
                }}
                title={collapsed ? item.label : ""}
              >
                <Icon size={16} color={isActive ? "#ffffff" : "#8796a6"} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Section 2: Agent Pipeline */}
        {!collapsed && (
          <div style={{ padding: "0 1.2rem", fontSize: "0.68rem", fontWeight: 700, color: "#6c7b88", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
            AGENT MODULES
          </div>
        )}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0 0.6rem", marginBottom: "1.5rem" }}>
          {agentNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? "#383e47" : "transparent",
                  color: isActive ? "#ffffff" : "#a0b0c0",
                  border: "none",
                  padding: collapsed ? "0.75rem 0" : "0.65rem 0.9rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: "0.75rem",
                  transition: "all 0.15s ease"
                }}
                title={collapsed ? item.label : ""}
              >
                <Icon size={16} color={isActive ? "#ffffff" : "#8796a6"} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* 🌟 NEW SIDEBAR BUTTON: How It Works Side Panel Trigger */}
        <div style={{ padding: "0 0.6rem" }}>
          <button
            onClick={onOpenHowItWorks}
            style={{
              width: "100%",
              background: "rgba(32, 168, 216, 0.15)",
              color: "#20a8d8",
              border: "1px solid rgba(32, 168, 216, 0.3)",
              padding: collapsed ? "0.75rem 0" : "0.65rem 0.9rem",
              borderRadius: "6px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "0.75rem"
            }}
            title="How It Works Guide"
          >
            <HelpCircle size={16} color="#20a8d8" />
            {!collapsed && <span>How It Works</span>}
          </button>
        </div>
      </div>

      {/* User Info Footer */}
      {!collapsed && (
        <div style={{
          padding: "0.8rem 1.2rem",
          borderTop: "1px solid #1f2328",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem"
        }}>
          <div style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "#383e47",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem"
          }}>
            {profile.name.charAt(0)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#8796a6" }}>Student User</div>
          </div>
        </div>
      )}
    </aside>
  );
}
