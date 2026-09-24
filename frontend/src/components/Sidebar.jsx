import React from "react";
import {
  Bot, LayoutDashboard, UserCheck, Target, Compass,
  FileText, Kanban, ChevronLeft, ChevronRight,
  Settings, BookOpen, LogOut
} from "lucide-react";

const NAV_MAIN = [
  { id: "dashboard", label: "Dashboard",       icon: LayoutDashboard },
  { id: "planner",   label: "Funding Planner", icon: Target           },
  { id: "guide",     label: "How It Works",    icon: BookOpen         },
];
const NAV_AGENTS = [
  { id: "profile",   label: "Profile Agent",     icon: UserCheck },
  { id: "discovery", label: "Opportunity Market", icon: Compass   },
  { id: "autopilot", label: "Autopilot Studio",   icon: FileText  },
  { id: "pipeline",  label: "Pipeline & Deadlines",icon: Kanban   },
];

export default function Sidebar({ activeTab, setActiveTab, profile, user, onLogout, collapsed, setCollapsed }) {
  const nav = user?.role === "admin"
    ? [...NAV_MAIN, { id: "admin", label: "Admin Console", icon: Settings }]
    : NAV_MAIN;

  return (
    <aside
      className="app-sidebar"
      style={{ width: collapsed ? "70px" : "260px" }}
    >
      {/* ── INNER SCROLL CONTAINER ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>

        {/* ── BRAND HEADER ── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "1.15rem 0" : "1.15rem 1rem 1.15rem 1.2rem",
          borderBottom: "1px solid rgba(18,163,165,0.12)",
          gap: ".6rem",
          flexShrink: 0,
        }}>
          {/* Logo icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#12a3a5,#0e7a7c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(18,163,165,.35)",
          }}>
            <Bot size={20} color="#fff" />
          </div>

          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize:"1.1rem", fontWeight:800, color:"var(--text-primary)", letterSpacing:"-.04em", lineHeight:1.1 }}>
                Edu<span style={{ color:"var(--accent-teal)" }}>Fund</span>
              </div>
              <div style={{ fontSize:".58rem", color:"var(--text-muted)", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase" }}>
                AI Agent Platform
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "rgba(18,163,165,.08)",
              border: "1px solid rgba(18,163,165,.15)",
              color: "var(--text-muted)",
              borderRadius: 7,
              width: 26, height: 26,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "background .15s",
              flexShrink: 0,
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* ── NAV SECTION 1 ── */}
        <NavSection label="Dashboards" collapsed={collapsed}>
          {nav.map(item => (
            <NavItem key={item.id} item={item} active={activeTab === item.id} collapsed={collapsed} onClick={() => setActiveTab(item.id)} />
          ))}
        </NavSection>

        {/* ── NAV SECTION 2 ── */}
        <NavSection label="Agent Modules" collapsed={collapsed}>
          {NAV_AGENTS.map(item => (
            <NavItem key={item.id} item={item} active={activeTab === item.id} collapsed={collapsed} onClick={() => setActiveTab(item.id)} />
          ))}
        </NavSection>
      </div>

      {/* ── USER FOOTER ── */}
      <div style={{
        padding: collapsed ? ".9rem 0" : ".9rem 1rem",
        borderTop: "1px solid rgba(18,163,165,.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: ".65rem",
        flexShrink: 0,
      }}>
        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#62dadb,#12a3a5)",
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: ".82rem",
          boxShadow: "0 3px 10px rgba(18,163,165,.28)",
        }}>
          {(user?.name || profile?.name || "S").charAt(0).toUpperCase()}
        </div>

        {!collapsed && (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize:".82rem", fontWeight:700, color:"var(--text-primary)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {user?.name || profile?.name || "Student"}
            </div>
            <div style={{ fontSize:".68rem", color:"var(--text-muted)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:".4rem" }}>
              <span>{user?.role === "admin" ? "Administrator" : "Student"}</span>
              <button
                onClick={onLogout}
                style={{ background:"none", border:0, color:"var(--accent-teal)", cursor:"pointer", fontSize:".68rem", fontWeight:700, display:"flex", alignItems:"center", gap:"3px", fontFamily:"var(--font-main)", padding:0 }}
              >
                <LogOut size={11} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Section wrapper ── */
function NavSection({ label, collapsed, children }) {
  return (
    <div style={{ padding: collapsed ? ".75rem 0 .25rem" : ".85rem 0 .25rem", flexShrink: 0 }}>
      {!collapsed && (
        <div style={{
          padding: "0 1.2rem .45rem",
          fontSize: ".6rem", fontWeight: 800,
          color: "var(--text-muted)",
          letterSpacing: ".1em", textTransform: "uppercase",
        }}>
          {label}
        </div>
      )}
      <nav style={{ display:"flex", flexDirection:"column", gap:2, paddingRight: collapsed ? 0 : "8px" }}>
        {children}
      </nav>
    </div>
  );
}

/* ── Individual nav button ── */
function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <div style={{ position: "relative" }} className="sidebar-nav-item-wrapper">
      <button
        onClick={onClick}
        title={collapsed ? item.label : ""}
        style={{
          background:   active ? "rgba(18,163,165,.12)" : "transparent",
          color:        active ? "var(--accent-teal)"   : "var(--text-secondary)",
          border:       "none",
          borderLeft:   active ? "3px solid var(--accent-teal)" : "3px solid transparent",
          borderRadius: "0 10px 10px 0",
          padding:      collapsed ? ".72rem 0" : ".65rem .95rem",
          width:        "100%",
          fontSize:     ".855rem",
          fontWeight:   active ? 700 : 500,
          cursor:       "pointer",
          display:      "flex",
          alignItems:   "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap:          ".75rem",
          transition:   "all .16s ease",
          fontFamily:   "var(--font-main)",
          letterSpacing:"-.01em",
          whiteSpace:   "nowrap",
        }}
      >
        <Icon size={17} color={active ? "var(--accent-teal)" : "var(--text-muted)"} style={{ flexShrink:0 }} />
        {!collapsed && <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{item.label}</span>}
      </button>

      {/* Floating tooltip for collapsed state */}
      {collapsed && (
        <span style={{
          position: "absolute",
          left: "calc(100% + 10px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(15,42,42,.92)",
          backdropFilter: "blur(12px)",
          color: "#fff",
          fontSize: ".78rem",
          fontWeight: 600,
          padding: ".4rem .75rem",
          borderRadius: 8,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity .15s ease",
          zIndex: 200,
          boxShadow: "0 4px 20px rgba(10,50,50,.22)",
          border: "1px solid rgba(18,163,165,.2)",
        }}
        className="sidebar-tooltip"
        >
          {item.label}
        </span>
      )}
    </div>
  );
}
