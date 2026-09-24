import React from "react";
import { Search, IndianRupee, DollarSign } from "lucide-react";

export default function TopBar({ currency, setCurrency, backendConnected, searchQuery, setSearchQuery, user }) {
  const initials = (user?.name || "S").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="topbar-glass">
      {/* ── LEFT: Search ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", flex:1, minWidth:0 }}>
        <div style={{ position:"relative", width:320, maxWidth:"100%" }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}
          />
          <input
            type="text"
            placeholder="Search opportunities, scholarships…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: "2.2rem",
              height: 38,
              fontSize: ".84rem",
              borderRadius: 10,
              background: "rgba(255,255,255,.75)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(18,163,165,.18)",
              transition: "all .2s ease",
            }}
          />
        </div>
      </div>

      {/* ── RIGHT: Controls ── */}
      <div style={{ display:"flex", alignItems:"center", gap:"1rem", flexShrink:0 }}>

        {/* Currency switcher */}
        <div style={{
          display:"flex", alignItems:"center",
          background:"rgba(255,255,255,.7)",
          backdropFilter:"blur(10px)",
          border:"1px solid rgba(18,163,165,.18)",
          borderRadius:10, padding:"3px",
          gap:2,
        }}>
          {[
            { label:"INR (₹)", val:"INR", Icon:IndianRupee },
            { label:"USD ($)", val:"USD", Icon:DollarSign  },
          ].map(({ label, val, Icon }) => (
            <button
              key={val}
              onClick={() => setCurrency(val)}
              style={{
                background: currency===val
                  ? "linear-gradient(135deg,var(--teal-500),var(--teal-600))"
                  : "transparent",
                color: currency===val ? "#fff" : "var(--text-secondary)",
                border:"none",
                padding:".28rem .65rem",
                borderRadius:8,
                fontSize:".7rem",
                fontWeight:700,
                cursor:"pointer",
                display:"flex", alignItems:"center", gap:".22rem",
                transition:"all .18s ease",
                fontFamily:"var(--font-main)",
                boxShadow: currency===val ? "0 2px 8px rgba(18,163,165,.3)" : "none",
                whiteSpace:"nowrap",
              }}
            >
              <Icon size={11}/> {label}
            </button>
          ))}
        </div>

        {/* User avatar chip */}
        <div style={{
          display:"flex", alignItems:"center", gap:".5rem",
          cursor:"pointer",
          background:"rgba(255,255,255,.7)",
          backdropFilter:"blur(10px)",
          border:"1px solid rgba(18,163,165,.18)",
          borderRadius:10, padding:".3rem .75rem .3rem .3rem",
          transition:"background .18s ease",
        }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.92)"}
          onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.7)"}
        >
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:"linear-gradient(135deg,#62dadb,#12a3a5)",
            color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:800, fontSize:".75rem",
            boxShadow:"0 2px 8px rgba(18,163,165,.3)",
            flexShrink:0,
          }}>
            {initials}
          </div>
          <span style={{ fontSize:".82rem", fontWeight:600, color:"var(--text-primary)", whiteSpace:"nowrap" }}>
            {user?.name || "Student"}
          </span>
        </div>
      </div>
    </header>
  );
}
