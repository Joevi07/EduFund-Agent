import React, { useState } from "react";
import { 
  X, 
  Bot, 
  HelpCircle, 
  UserCheck, 
  Compass, 
  CheckCircle2, 
  Target, 
  FileText, 
  Kanban, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Zap, 
  ArrowRight,
  Layers,
  AlertTriangle
} from "lucide-react";

export default function HowItWorksDrawer({ isOpen, onClose, onNavigate }) {
  const [activeTab, setActiveTab] = useState("agents");

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(6px)",
      zIndex: 300,
      display: "flex",
      justifyContent: "flex-end",
      transition: "all 0.3s ease"
    }}>
      {/* Slide-over Right Panel Container */}
      <div style={{
        width: "540px",
        maxWidth: "90vw",
        height: "100vh",
        background: "#ffffff",
        boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        animation: "slideInRight 0.3s ease",
        overflow: "hidden"
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: "1.5rem 1.8rem",
          borderBottom: "1px solid #e4e7ea",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f8f9fa"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff"
            }}>
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#272c33" }}>How EduFund Works</h3>
              <div style={{ fontSize: "0.75rem", color: "#8796a6" }}>Interactive Multi-Agent System Guide</div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: "#e2e8f0",
              border: "none",
              color: "#64748b",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", borderBottom: "1px solid #e4e7ea", background: "#ffffff", padding: "0 1rem" }}>
          {[
            { id: "agents", label: "🤖 6-Agent Flow" },
            { id: "fintech", label: "💰 Funding Gap" },
            { id: "autopilot", label: "🔥 Autopilot" },
            { id: "reuse", label: "🗺️ Document Reuse" }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "0.8rem 0.9rem",
                border: "none",
                background: "transparent",
                borderBottom: activeTab === t.id ? "3px solid #4f46e5" : "3px solid transparent",
                color: activeTab === t.id ? "#4f46e5" : "#636c72",
                fontWeight: activeTab === t.id ? 700 : 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Content */}
        <div style={{ flex: 1, padding: "1.5rem 1.8rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {/* TAB 1: 6-AGENT FLOW */}
          {activeTab === "agents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                Instead of a basic search directory, EduFund executes a <strong>6-stage agentic pipeline</strong> to discover, evaluate, and plan your funding:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#4f46e5", fontSize: "0.88rem" }}>
                    <UserCheck size={16} /> 1. Profile Agent
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#636c72", marginTop: "0.2rem" }}>
                    Normalizes academic credentials (GPA, major, achievements) and target budget (tuition + living expenses).
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#0077b5", fontSize: "0.88rem" }}>
                    <Compass size={16} /> 2. Opportunity Discovery Agent
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#636c72", marginTop: "0.2rem" }}>
                    Queries curated repositories across scholarships, fee waivers, grants, competitions, and institutional aid.
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#059669", fontSize: "0.88rem" }}>
                    <CheckCircle2 size={16} /> 3. Eligibility Reasoning Agent
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#636c72", marginTop: "0.2rem" }}>
                    Evaluates criteria line-by-line (Degree level, GPA, Income limit, Course fit, Location) producing transparent checklist checkmarks (`✓`/`✗`).
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#d97706", fontSize: "0.88rem" }}>
                    <Target size={16} /> 4. Funding Planner Agent ⭐
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#636c72", marginTop: "0.2rem" }}>
                    Calculates your Education Funding Gap and solves an optimal portfolio stack ranked by Expected Value ($EV$).
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#7c3aed", fontSize: "0.88rem" }}>
                    <FileText size={16} /> 5. Application Autopilot Agent
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#636c72", marginTop: "0.2rem" }}>
                    Drafts tailored SOP statements, verifies fact claims, and enforces human-in-the-loop safety controls.
                  </div>
                </div>

                <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#e4405f", fontSize: "0.88rem" }}>
                    <Kanban size={16} /> 6. Deadline & Follow-up Agent
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#636c72", marginTop: "0.2rem" }}>
                    Monitors closing dates, maps document reuse, and detects deadline collisions in a Kanban board.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINTECH FUNDING GAP */}
          {activeTab === "fintech" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#e0e7ff", border: "1px solid #c7d2fe", padding: "1rem", borderRadius: "12px", color: "#3730a3" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.4rem" }}>The Education Funding Gap Equation</h4>
                <div style={{ fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700, background: "#ffffff", padding: "0.6rem", borderRadius: "6px", textAlign: "center", color: "#1e293b" }}>
                  Target Annual Cost − Confirmed Aid = Funding Gap
                </div>
              </div>

              <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                For example, if your total tuition and expenses are <strong>₹1,20,000</strong> and confirmed family aid is <strong>₹60,000</strong>, your remaining funding gap is <strong>₹60,000</strong>.
                <br /><br />
                The **Funding Planner Agent** selects the optimal combination of scholarships, fee waivers, and grants to cover 100% of that gap!
              </div>

              <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "1rem", borderRadius: "12px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b", marginBottom: "0.4rem" }}>
                  📊 Funding Confidence Meter
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Evaluates portfolio Expected Value ($EV$), document readiness, and time-to-deadline buffer to produce an overall confidence rating (e.g. 88% High Confidence).
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATION AUTOPILOT */}
          {activeTab === "autopilot" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "1rem", borderRadius: "12px", color: "#065f46" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShieldCheck size={18} /> Safety Control Guarantee
                </h4>
                <div style={{ fontSize: "0.82rem" }}>
                  The AI Agent <strong>never submits financial or official forms automatically</strong>. The student must review and authorize every packet.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "#475569" }}>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>Autopilot Features:</div>
                <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <li><strong>AI Essay Refiner</strong>: Modify tone instantly (`⚡ Persuasive`, `🎓 Academic Rigor`, `✂️ Shorten`).</li>
                  <li><strong>Document Auditor</strong>: Upload mock PDFs to check marksheets and income certificates against rules.</li>
                  <li><strong>AI Evidence Checker</strong>: Verifies factual statements in your essay against your verified profile.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENT REUSE */}
          {activeTab === "reuse" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "1rem", borderRadius: "12px", color: "#92400e" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Copy size={18} /> Repetitive Effort Reduction
                </h4>
                <div style={{ fontSize: "0.82rem" }}>
                  Students waste hours uploading the same documents. EduFund maps reusable files to eliminate repetitive effort.
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.85rem", color: "#475569" }}>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>Collision & Reuse Audit:</div>
                <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <li><strong>Document Reuse Map</strong>: Shows how 1 Income Certificate satisfies 3 scholarship requirements.</li>
                  <li><strong>Deadline Collision Detector</strong>: Audits closing dates to detect application collisions within tight 3–7 day windows.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div style={{
          padding: "1.2rem 1.8rem",
          borderTop: "1px solid #e4e7ea",
          background: "#f8f9fa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{ fontSize: "0.85rem" }}
          >
            Close Guide
          </button>
          <button 
            className="btn-primary" 
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate("planner");
            }}
            style={{ fontSize: "0.85rem" }}
          >
            Explore Funding Planner <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
