import React, { useState } from "react";
import { Sliders, RefreshCw, Zap, TrendingUp } from "lucide-react";
import { simulateStrategyScenario } from "../services/api";

export default function StrategySimulatorWidget({ profile, currency, onScenarioResult }) {
  const [coverageTarget, setCoverageTarget] = useState(100);
  const [extraWorkStudy, setExtraWorkStudy] = useState(10000);
  const [increasedAid, setIncreasedAid] = useState(15000);
  const [simulating, setSimulating] = useState(false);

  const isINR = currency === "INR";
  const sym = isINR ? "₹" : "$";

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await simulateStrategyScenario(profile, coverageTarget, extraWorkStudy, increasedAid);
      if (onScenarioResult) onScenarioResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={18} color="var(--neon-emerald)" /> Strategy Scenario Simulator
        </h3>
        <span className="badge badge-high" style={{ fontSize: "0.65rem" }}>REAL-TIME SOLVER</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        {/* Slider 1: Increased Family/Institutional Aid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Increased Family / Inst. Aid</span>
            <strong style={{ color: "var(--neon-emerald)" }}>{sym}{increasedAid.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="50000" 
            step="2500" 
            value={increasedAid} 
            onChange={e => setIncreasedAid(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "var(--neon-emerald)", cursor: "pointer" }}
          />
        </div>

        {/* Slider 2: Work-Study Stipend */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.3rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Work-Study / Assistantship Aid</span>
            <strong style={{ color: "var(--neon-indigo)" }}>{sym}{extraWorkStudy.toLocaleString()}</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30000" 
            step="2000" 
            value={extraWorkStudy} 
            onChange={e => setExtraWorkStudy(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "var(--neon-indigo)", cursor: "pointer" }}
          />
        </div>
      </div>

      <button 
        className="btn-emerald" 
        onClick={handleSimulate}
        disabled={simulating}
        style={{ width: "100%", justifyContent: "center", padding: "0.55rem", fontSize: "0.85rem", marginTop: "0.4rem" }}
      >
        <Zap size={16} /> Re-Solve Strategy Scenario
      </button>
    </div>
  );
}
