import React from "react";
import { Search, IndianRupee, DollarSign, Bell, Mail, Globe, Menu } from "lucide-react";

export default function TopBar({ currency, setCurrency, backendConnected, searchQuery, setSearchQuery, user }) {
  return (
    <header style={{
      height: "65px",
      borderBottom: "1px solid #e4e7ea",
      background: "#ffffff",
      position: "sticky",
      top: 0,
      zIndex: 90,
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1.5rem"
    }}>
      {/* Left: Red Toggle Button & Search Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        <button style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "#e74c3c",
          border: "none",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(231, 76, 60, 0.3)"
        }}>
          <Menu size={18} />
        </button>

        <div style={{ position: "relative", width: "320px", maxWidth: "100%" }}>
          <Search size={16} color="#8796a6" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: "2.4rem",
              height: "36px",
              background: "#ffffff",
              fontSize: "0.85rem",
              borderRadius: "4px",
              border: "1px solid #e4e7ea"
            }}
          />
        </div>
      </div>

      {/* Right Controls: Notifications, Language, Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
        {/* Notification Icons with Badges (Exact SufeeAdmin style) */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Bell size={18} color="#636c72" />
            <span style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "#ff5252",
              color: "#ffffff",
              fontSize: "0.62rem",
              fontWeight: 700,
              padding: "0.1rem 0.3rem",
              borderRadius: "50%"
            }}>
              3
            </span>
          </div>

          <div style={{ position: "relative", cursor: "pointer" }}>
            <Mail size={18} color="#636c72" />
            <span style={{
              position: "absolute",
              top: "-6px",
              right: "-8px",
              background: "#f39c12",
              color: "#ffffff",
              fontSize: "0.62rem",
              fontWeight: 700,
              padding: "0.1rem 0.3rem",
              borderRadius: "50%"
            }}>
              7
            </span>
          </div>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: "flex", alignItems: "center", background: "#f1f2f7", padding: "0.15rem", borderRadius: "4px", border: "1px solid #e4e7ea" }}>
          <button
            onClick={() => setCurrency("INR")}
            style={{
              background: currency === "INR" ? "#20a8d8" : "transparent",
              color: currency === "INR" ? "#ffffff" : "#636c72",
              border: "none",
              padding: "0.25rem 0.55rem",
              borderRadius: "4px",
              fontSize: "0.72rem",
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
              background: currency === "USD" ? "#20a8d8" : "transparent",
              color: currency === "USD" ? "#ffffff" : "#636c72",
              border: "none",
              padding: "0.25rem 0.55rem",
              borderRadius: "4px",
              fontSize: "0.72rem",
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

        {/* User Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#20a8d8",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.8rem"
          }}>
            {(user?.name || "Student").split(" ").map(n => n[0]).slice(0,2).join("")}
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#272c33" }}>{user?.name || "Student"}</span>
        </div>
      </div>
    </header>
  );
}
