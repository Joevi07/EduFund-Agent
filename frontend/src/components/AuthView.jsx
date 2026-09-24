import React, { useState } from "react";
import { ArrowRight, Bot, CheckCircle2, Eye, EyeOff, ShieldCheck, Sparkles, UserCheck, Lock } from "lucide-react";

export default function AuthView({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onAuthenticated({
        user: {
          name: form.name || (form.email.includes("maya") ? "Maya Patel" : "Aarav Sharma"),
          email: form.email || "aarav.sharma@edufund.local",
          role: "student"
        }
      });
    }, 600);
  };

  const handleDemoLogin = (profileType) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (profileType === "aarav") {
        onAuthenticated({
          user: { name: "Aarav Sharma", email: "aarav.sharma@edufund.local", role: "student" },
          profilePreset: "aarav"
        });
      } else if (profileType === "maya") {
        onAuthenticated({
          user: { name: "Maya Patel", email: "maya.patel@edufund.local", role: "student" },
          profilePreset: "maya"
        });
      } else {
        onAuthenticated({
          user: { name: "EduFund Admin", email: "admin@edufund.local", role: "admin" },
          profilePreset: "admin"
        });
      }
    }, 400);
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #07090F 0%, #0F172A 50%, #1E293B 100%)",
      color: "#F8FAFC",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{
        maxWidth: "1050px",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        gap: "0",
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "24px",
        boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.6)",
        overflow: "hidden"
      }}>
        {/* Left Side: Brand Showcase */}
        <div style={{
          padding: "3.5rem 3rem",
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2.5rem" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px",
                background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF"
              }}>
                <Bot size={24} />
              </div>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Edu<span style={{ color: "#06B6D4" }}>Fund</span> AI
              </span>
            </div>

            <span style={{
              display: "inline-block", fontSize: "0.75rem", fontWeight: 800,
              color: "#06B6D4", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem"
            }}>
              Autonomous Education Funding Swarm
            </span>

            <h1 style={{ fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.25, marginBottom: "1rem", color: "#FFF" }}>
              Education should never stop at affordability.
            </h1>

            <p style={{ color: "#94A3B8", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Discover verified opportunities, build a net funding gap plan, generate prompt-aligned essays, and audit document claims with 6 autonomous AI agents.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.92rem", color: "#E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#10B981" />
                <span>Smart 100-Point Eligibility Solver</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#10B981" />
                <span>FinTech Funding Gap & Confidence Meter</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={18} color="#10B981" />
                <span>AI Essay Studio & Evidence Auditor</span>
              </div>
            </div>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: "8px", color: "#64748B", fontSize: "0.82rem",
            marginTop: "3rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem"
          }}>
            <ShieldCheck size={16} color="#06B6D4" />
            <span>Built for students. Decisions stay in your hands.</span>
          </div>
        </div>

        {/* Right Side: Auth Form & Quick Demo Logins */}
        <div style={{ padding: "3.5rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#06B6D4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
            </span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFF", marginTop: "0.25rem" }}>
              {mode === "login" ? "Sign in to EduFund" : "Start your funding journey"}
            </h2>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "1rem",
            marginBottom: "1.75rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "#06B6D4", fontWeight: 700, marginBottom: "0.75rem" }}>
              <Sparkles size={15} /> 1-Click Demo Login Shortcuts:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("aarav")}
                style={{
                  background: "rgba(6, 182, 212, 0.15)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  color: "#FFF",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                🎓 Aarav Sharma <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>CS Scholar (India)</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("maya")}
                style={{
                  background: "rgba(139, 92, 246, 0.15)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  color: "#FFF",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease"
                }}
              >
                🩺 Maya Patel <div style={{ fontSize: "0.7rem", color: "#94A3B8" }}>Pre-Med Fellow</div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {mode === "register" && (
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.35rem" }}>
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  style={{
                    width: "100%", padding: "10px 14px", background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", color: "#FFF", fontSize: "0.9rem"
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.35rem" }}>
                Email Address
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => update("email", e.target.value)}
                placeholder="student@example.com"
                style={{
                  width: "100%", padding: "10px 14px", background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", color: "#FFF", fontSize: "0.9rem"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#CBD5E1", marginBottom: "0.35rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%", padding: "10px 14px", paddingRight: "40px", background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", color: "#FFF", fontSize: "0.9rem"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", color: "#94A3B8", cursor: "pointer"
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#F43F5E", padding: "8px 12px", borderRadius: "6px", fontSize: "0.82rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px", background: "linear-gradient(135deg, #06B6D4, #3B82F6)",
                border: "none", borderRadius: "10px", color: "#FFF", fontWeight: 700, fontSize: "0.95rem",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                marginTop: "0.5rem", boxShadow: "0 4px 14px rgba(6, 182, 212, 0.3)"
              }}
            >
              {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "#94A3B8" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: "#06B6D4", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
            >
              {mode === "login" ? "Register now" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
