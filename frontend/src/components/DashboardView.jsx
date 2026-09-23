import React, { useState } from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Terminal,
  Zap,
  Target,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Share2,
  FileText,
  Compass,
  Award
} from "lucide-react";
import AgentNodeGraph from "./AgentNodeGraph";
import StrategySimulatorWidget from "./StrategySimulatorWidget";

export default function DashboardView({ profile, plan, currency, onNavigate, onScenarioResult }) {
  const [logFilter, setLogFilter] = useState("All");
  const [showAlert, setShowAlert] = useState(true);

  const logs = [
    { type: "Profile", text: "🤖 Profile Agent initialized for Aarav Sharma (Computer Science & AI)" },
    { type: "Discovery", text: "🔍 Opportunity Discovery Agent queried 8 curated funding databases" },
    { type: "Eligibility", text: "⚡ Eligibility Agent evaluated 5 candidates: 3 High Match, 2 Medium Match" },
    { type: "Planner", text: "💰 Funding Planner Agent computed Funding Gap: ₹60,000" },
    { type: "Planner", text: "🎯 Strategy Stack assembled: 100% gap coverage potential" },
    { type: "Autopilot", text: "📝 Application Autopilot Agent generated draft response for STEM Scholarship" }
  ];

  const isINR = currency === "INR";
  const formatAmt = (inr, usd) => isINR ? `₹${inr.toLocaleString()}` : `$${usd.toLocaleString()}`;

  const cost = isINR ? plan.total_cost_inr : plan.total_cost_usd;
  const aid = isINR ? plan.confirmed_aid_inr : plan.confirmed_aid_usd;
  const gap = isINR ? plan.funding_gap_inr : plan.funding_gap_usd;
  const coverage = isINR ? plan.potential_coverage_inr : plan.potential_coverage_usd;

  const aidDeg = Math.round((aid / (cost || 1)) * 360);
  const filteredLogs = logFilter === "All" ? logs : logs.filter(l => l.type === logFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#272c33" }}>Dashboard</h2>
        <div style={{ fontSize: "0.82rem", color: "#20a8d8", cursor: "pointer", fontWeight: 600 }}>Home / Dashboard</div>
      </div>

      {/* Success Alert Banner (Exact SufeeAdmin Style) */}
      {showAlert && (
        <div className="alert-success-box">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="badge badge-success">Success</span>
            <span>Agentic loop evaluated 5 opportunities: <strong>100% gap coverage strategy assembled!</strong></span>
          </div>
          <button onClick={() => setShowAlert(false)} style={{ background: "none", border: "none", color: "#155724", cursor: "pointer", fontWeight: 700, fontSize: "1.1rem" }}>
            ×
          </button>
        </div>
      )}

      {/* Top Row: 4 Vibrant Solid KPI Cards (SufeeAdmin Style) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {/* Card 1: Cyan (Total Cost) */}
        <div className="kpi-card kpi-card-cyan">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>{formatAmt(plan.total_cost_inr, plan.total_cost_usd)}</span>
              <Layers size={20} opacity={0.8} />
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.95, marginTop: "0.2rem" }}>Target Annual Education Cost</div>
          </div>
          {/* Mini Sparkline SVG curve */}
          <svg viewBox="0 0 100 25" style={{ width: "100%", height: "25px", stroke: "rgba(255,255,255,0.7)", strokeWidth: 2, fill: "none", marginTop: "0.8rem" }}>
            <path d="M0 20 Q 25 5, 50 15 T 100 5" />
          </svg>
        </div>

        {/* Card 2: Coral Red (Remaining Funding Gap) */}
        <div className="kpi-card kpi-card-red">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>{formatAmt(plan.funding_gap_inr, plan.funding_gap_usd)}</span>
              <AlertTriangle size={20} opacity={0.8} />
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.95, marginTop: "0.2rem" }}>Remaining Education Funding Gap</div>
          </div>
          <svg viewBox="0 0 100 25" style={{ width: "100%", height: "25px", stroke: "rgba(255,255,255,0.7)", strokeWidth: 2, fill: "none", marginTop: "0.8rem" }}>
            <path d="M0 15 Q 25 22, 50 8 T 100 18" />
          </svg>
        </div>

        {/* Card 3: Golden Amber (Confirmed Aid) */}
        <div className="kpi-card kpi-card-amber">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>{formatAmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd)}</span>
              <ShieldCheck size={20} opacity={0.8} />
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.95, marginTop: "0.2rem" }}>Confirmed Aid & Support</div>
          </div>
          <svg viewBox="0 0 100 25" style={{ width: "100%", height: "25px", stroke: "rgba(255,255,255,0.7)", strokeWidth: 2, fill: "none", marginTop: "0.8rem" }}>
            <path d="M0 22 Q 25 8, 50 18 T 100 10" />
          </svg>
        </div>

        {/* Card 4: Emerald Green (Strategy Potential) */}
        <div className="kpi-card kpi-card-green">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>{formatAmt(plan.potential_coverage_inr, plan.potential_coverage_usd)}</span>
              <TrendingUp size={20} opacity={0.8} />
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.95, marginTop: "0.2rem" }}>Strategy Potential Coverage</div>
          </div>
          <svg viewBox="0 0 100 25" style={{ width: "100%", height: "25px", stroke: "rgba(255,255,255,0.7)", strokeWidth: 2, fill: "none", marginTop: "0.8rem" }}>
            <path d="M0 18 Q 25 10, 50 20 T 100 5" />
          </svg>
        </div>
      </div>

      {/* Middle Row: Bento Content Grid */}
      <div className="bento-grid">
        {/* Donut Chart Gauge */}
        <div className="bento-box col-span-4" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#636c72", fontSize: "0.82rem", fontWeight: 600, marginBottom: "1rem" }}>
              <span>FUNDING PROGRESS RING</span>
              <Target size={18} color="#20a8d8" />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "1rem 0" }}>
              <div 
                className="donut-gauge"
                style={{
                  background: `conic-gradient(#2ecc71 0deg ${aidDeg}deg, #ff5252 ${aidDeg}deg 360deg)`
                }}
              >
                <div className="donut-inner">
                  <div style={{ fontSize: "0.68rem", color: "#8796a6", fontWeight: 600 }}>GAP</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#ff5252" }}>
                    {formatAmt(plan.funding_gap_inr, plan.funding_gap_usd)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e4e7ea", paddingTop: "0.8rem", fontSize: "0.8rem", display: "flex", justifyContent: "space-between" }}>
            <span>Confirmed: <strong style={{ color: "#2ecc71" }}>{formatAmt(plan.confirmed_aid_inr, plan.confirmed_aid_usd)}</strong></span>
            <span>Total: <strong>{formatAmt(plan.total_cost_inr, plan.total_cost_usd)}</strong></span>
          </div>
        </div>

        {/* Multi-Agent Node Graph */}
        <div className="bento-box col-span-8">
          <AgentNodeGraph onSelectAgentNode={(nodeId) => console.log("Selected node:", nodeId)} />
        </div>

        {/* Live Scenario Simulator */}
        <div className="bento-box col-span-4">
          <StrategySimulatorWidget 
            profile={profile}
            currency={currency}
            onScenarioResult={onScenarioResult}
          />
        </div>

        {/* Priority EV Opportunity Queue */}
        <div className="bento-box col-span-8">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={18} color="#2ecc71" /> Priority EV Opportunity Queue
            </h3>
            <button 
              style={{ background: "none", border: "none", color: "#20a8d8", cursor: "pointer", fontSize: "0.82rem", fontWeight: 700 }}
              onClick={() => onNavigate("planner")}
            >
              Full Strategy Stack →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {plan.recommended_strategy.slice(0, 3).map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: "#f8f9fa",
                  border: "1px solid #e4e7ea",
                  borderRadius: "8px",
                  padding: "0.85rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="badge badge-indigo" style={{ fontSize: "0.68rem" }}>RANK #{item.priority_rank}</span>
                    <span className="badge badge-high" style={{ fontSize: "0.68rem" }}>{item.match_score}% MATCH</span>
                  </div>
                  <h4 style={{ fontSize: "0.92rem", fontWeight: 700, marginTop: "0.3rem", color: "#272c33" }}>{item.title}</h4>
                  <div style={{ fontSize: "0.78rem", color: "#636c72", marginTop: "0.15rem" }}>
                    EV Coverage: <strong style={{ color: "#2ecc71" }}>{formatAmt(item.expected_value_inr, item.expected_value_usd)}</strong>
                  </div>
                </div>

                <button 
                  className="btn-primary" 
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.78rem" }}
                  onClick={() => onNavigate("autopilot")}
                >
                  Autopilot <Zap size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: 4 Solid Color Block Cards (SufeeAdmin Channel Cards style) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
        <div className="block-card block-card-blue" onClick={() => onNavigate("discovery")} style={{ cursor: "pointer" }}>
          <Compass size={32} style={{ marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>12 Found</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Discovery Catalog</div>
        </div>

        <div className="block-card block-card-dark" onClick={() => onNavigate("autopilot")} style={{ cursor: "pointer" }}>
          <FileText size={32} style={{ marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>Autopilot</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>AI Essay Studio</div>
        </div>

        <div className="block-card block-card-cyan" onClick={() => onNavigate("planner")} style={{ cursor: "pointer" }}>
          <Target size={32} style={{ marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>EV Solver</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Strategy Planner</div>
        </div>

        <div className="block-card block-card-coral" onClick={() => onNavigate("pipeline")} style={{ cursor: "pointer" }}>
          <Award size={32} style={{ marginBottom: "0.5rem" }} />
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>Pipeline</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>Deadline Tracker</div>
        </div>
      </div>
    </div>
  );
}
