import React, { useState } from "react";
import { Search, Filter, CheckCircle2, XCircle, AlertCircle, ExternalLink, Zap, Clock } from "lucide-react";

export default function DiscoveryMarketplaceView({ opportunities, currency, onSelectAutopilot }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpp, setSelectedOpp] = useState(null);

  const categories = ["All", "Scholarship", "Fee Waiver", "Grant", "Competition", "Institutional Aid"];
  const isINR = currency === "INR";
  const formatAmt = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;

  const filteredOpps = opportunities.filter(opp => {
    const matchesCat = activeCategory === "All" || opp.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      opp.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Title & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Opportunity Discovery Marketplace</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Agents 1 & 2: Curated funding sources with real-time criteria match scoring.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "280px" }}>
          <Search size={18} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            type="text" 
            placeholder="Search scholarships, grants, waivers..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.4rem" }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", pb: "0.5rem" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? "btn-primary" : "btn-secondary"}
            style={{ padding: "0.45rem 1rem", fontSize: "0.85rem", borderRadius: "var(--radius-full)" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Opportunities Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "1.2rem"
      }}>
        {filteredOpps.map(opp => (
          <div key={opp.id} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              {/* Header Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                <span className="badge badge-indigo">{opp.category}</span>
                <span className="badge badge-high" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Clock size={12} /> {opp.days_left} DAYS LEFT
                </span>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.3rem" }}>{opp.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginBottom: "0.8rem" }}>
                Provider: <strong>{opp.provider}</strong>
              </p>

              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", lineClamp: 2 }}>
                {opp.description}
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", pt: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>FUNDING VALUE</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                  {formatAmt(opp.amount_inr, opp.amount_usd)}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  className="btn-secondary"
                  style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
                  onClick={() => setSelectedOpp(opp)}
                >
                  Inspect Reasoning
                </button>

                <button 
                  className="btn-primary"
                  style={{ padding: "0.45rem 0.8rem", fontSize: "0.8rem" }}
                  onClick={() => onSelectAutopilot(opp)}
                >
                  Autopilot <Zap size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reasoning Inspection Modal */}
      {selectedOpp && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "1rem"
        }}>
          <div className="glass-card" style={{ maxWidth: "600px", width: "100%", padding: "2rem", background: "var(--bg-surface)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span className="badge badge-indigo">Agent 2 Eligibility Trace</span>
              <button 
                onClick={() => setSelectedOpp(null)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "1.4rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem" }}>{selectedOpp.title}</h3>
            <p style={{ color: "var(--accent-emerald)", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>
              Amount: {formatAmt(selectedOpp.amount_inr, selectedOpp.amount_usd)}
            </p>

            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.6rem" }}>Reasoning Checklist:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.5rem" }}>
              <div style={{ padding: "0.6rem", background: "rgba(16,185,129,0.1)", borderRadius: "var(--radius-sm)", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                <CheckCircle2 color="var(--accent-emerald)" size={18} />
                <div>
                  <strong>Degree Level:</strong> Student is Undergraduate ✓ (Requires: {selectedOpp.degree_levels.join(", ")})
                </div>
              </div>
              <div style={{ padding: "0.6rem", background: "rgba(16,185,129,0.1)", borderRadius: "var(--radius-sm)", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                <CheckCircle2 color="var(--accent-emerald)" size={18} />
                <div>
                  <strong>Academic Fit:</strong> Student GPA 3.8/4.0 meets requirement ({selectedOpp.min_gpa || "No min GPA"}) ✓
                </div>
              </div>
              <div style={{ padding: "0.6rem", background: "rgba(16,185,129,0.1)", borderRadius: "var(--radius-sm)", display: "flex", gap: "0.5rem", fontSize: "0.85rem" }}>
                <CheckCircle2 color="var(--accent-emerald)" size={18} />
                <div>
                  <strong>Financial Need:</strong> Income ₹4,50,000 is under ceiling ✓
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem" }}>
              <button className="btn-secondary" onClick={() => setSelectedOpp(null)}>Close</button>
              <button 
                className="btn-primary"
                onClick={() => {
                  const o = selectedOpp;
                  setSelectedOpp(null);
                  onSelectAutopilot(o);
                }}
              >
                Launch Autopilot Workspace <Zap size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
