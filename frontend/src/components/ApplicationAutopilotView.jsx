import React, { useState, useEffect } from "react";
import { 
  FileText, 
  CheckSquare, 
  AlertOctagon, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  RefreshCw, 
  CheckCircle,
  Wand2,
  BookOpen,
  Clock,
  Layers,
  Gauge,
  GraduationCap,
  Scissors
} from "lucide-react";
import { generateAutopilotDraft, refineAutopilotDraft } from "../services/api";
import DocumentAuditorWidget from "./DocumentAuditorWidget";

export default function ApplicationAutopilotView({ selectedOpportunity, profile, currency, onUpdateStatus }) {
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [autopilotData, setAutopilotData] = useState(null);
  const [editedDraft, setEditedDraft] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0.5);
  const [appliedStyle, setAppliedStyle] = useState("Standard Initial Draft");

  const [safetyApproved, setSafetyApproved] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  const oppId = selectedOpportunity ? selectedOpportunity.id : "opp_001";
  const oppTitle = selectedOpportunity ? selectedOpportunity.title : "Reliance Foundation STEM Scholarship";

  useEffect(() => {
    async function loadAutopilot() {
      setLoading(true);
      try {
        const res = await generateAutopilotDraft(oppId, 0, profile);
        setAutopilotData(res);
        setEditedDraft(res.draft_response || "");
        const words = (res.draft_response || "").split(" ").length;
        setWordCount(words);
        setReadingTime(Math.max(0.5, Math.round((words / 200) * 10) / 10));
        onUpdateStatus?.(oppId, "DRAFTING", res.draft_response || "");
      } catch (err) {
        console.error("Autopilot error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAutopilot();
  }, [oppId, profile]);

  const handleRefine = async (instruction) => {
    setRefining(true);
    try {
      const res = await refineAutopilotDraft(oppId, editedDraft, instruction);
      setEditedDraft(res.refined_draft);
      setWordCount(res.word_count);
      setReadingTime(res.reading_time_mins);
      setAppliedStyle(res.applied_style);
    } catch (err) {
      console.error("Refine error:", err);
    } finally {
      setRefining(false);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setEditedDraft(val);
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setReadingTime(Math.max(0.5, Math.round((words / 200) * 10) / 10));
  };

  const handleSafetySubmit = async () => {
    if (!safetyApproved) return;
    setSubmissionComplete(true);
    await onUpdateStatus?.(oppId, "READY_TO_SUBMIT", editedDraft);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".3rem" }}>
          <div style={{ background:"linear-gradient(135deg,var(--accent-teal),var(--teal-600))", borderRadius:9, padding:7, boxShadow:"0 3px 12px rgba(18,163,165,.3)", display:"flex" }}>
            <Sparkles size={18} color="#fff"/>
          </div>
          <h2 style={{ fontSize: "1.55rem", fontWeight: 800, letterSpacing:"-.035em" }}>AI Application Autopilot Studio</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: ".88rem", marginLeft:"2.5rem" }}>
          Extracts requirements, audits documents, refines essays with AI tone modifiers, and enforces human safety review.
        </p>
      </div>

      {/* Target Opportunity Header */}
      <div className="bento-box" style={{ background:"linear-gradient(145deg,rgba(14,122,124,.94),rgba(8,100,100,.97))", border:"1px solid rgba(255,255,255,.18)" }}>
        <span className="badge" style={{ background:"rgba(255,255,255,.2)", color:"#fff", border:"1px solid rgba(255,255,255,.3)" }}>ACTIVE AUTOPILOT TARGET</span>
        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginTop: ".5rem", marginBottom: ".25rem", color:"#fff", letterSpacing:"-.03em" }}>{oppTitle}</h3>
        <p style={{ color: "rgba(255,255,255,.78)", fontSize: ".85rem" }}>
          Applicant: <strong style={{ color:"#fff" }}>{profile.name}</strong> · {profile.course}
        </p>
      </div>

      {loading ? (
        <div className="bento-box" style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
          <RefreshCw size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem", color:"var(--accent-teal)" }} />
          <div>Autopilot Agent is analyzing requirements and synthesizing response draft...</div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "1.5rem"
        }}>
          {/* Left Column: Document Auditor & Requirements */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Missing Information Alert */}
            {autopilotData?.missing_information?.length > 0 && (
              <div className="bento-box" style={{ background:"rgba(217,119,6,.07)", border:"1px solid rgba(217,119,6,.22)" }}>
                <h4 style={{ fontSize: ".92rem", fontWeight: 700, color: "var(--amber-500)", display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".6rem" }}>
                  <AlertOctagon size={16}/> Missing Information Detected
                </h4>
                <ul style={{ paddingLeft: "1.2rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {autopilotData.missing_information.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "0.25rem" }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Document Auditor Widget */}
            <div className="bento-box">
              <DocumentAuditorWidget 
                opportunityId={oppId}
                requiredDocuments={selectedOpportunity?.required_documents}
              />
            </div>
          </div>

          {/* Right Column: AI Essay Studio & Refiner Toolbar */}
          <div className="bento-box" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Wand2 size={18} color="var(--neon-indigo)" /> AI Essay Studio & Refiner
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <span>Words: <strong>{wordCount}</strong></span>
                  <span>Est. Read: <strong>{readingTime}m</strong></span>
                  <span className="badge badge-indigo" style={{ fontSize: "0.62rem" }}>{appliedStyle}</span>
                </div>
              </div>

              {/* Refiner Preset Toolbar */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleRefine("persuasive")} 
                  disabled={refining}
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem", borderRadius: "4px" }}
                >
                  <Gauge size={14}/> High Impact & Persuasive
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleRefine("academic")} 
                  disabled={refining}
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem", borderRadius: "4px" }}
                >
                  <GraduationCap size={14}/> Academic Rigor
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleRefine("shorten")} 
                  disabled={refining}
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem", borderRadius: "4px" }}
                >
                  <Scissors size={14}/> Shorten (&lt;100w)
                </button>
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontStyle: "italic" }}>
                Prompt: "{autopilotData?.prompt}"
              </div>

              <textarea 
                rows={10} 
                value={editedDraft}
                onChange={handleTextChange}
                style={{
                  width: "100%",
                  lineHeight: 1.6,
                  fontFamily: "var(--font-main)",
                  fontSize: "0.88rem",
                  marginBottom: "1rem"
                }}
              />
            </div>

            {/* Human Safety Control */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
              <div style={{
                background: "rgba(41,165,87,.08)",
                border: "1px solid rgba(41,165,87,.22)",
                padding: ".8rem 1rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: ".8rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", fontWeight: 700, color: "var(--accent-sage)", fontSize: ".85rem", marginBottom: ".3rem" }}>
                  <ShieldCheck size={16}/> Human Review Safety Protocol
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                  AI will never submit financial forms without explicit student review and authorization.
                </p>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.6rem", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={safetyApproved} 
                    onChange={e => setSafetyApproved(e.target.checked)}
                    style={{ width: "15px", height: "15px" }}
                  />
                  I have reviewed the draft and authorize application preparation.
                </label>
              </div>

              {submissionComplete ? (
                <div className="btn-emerald" style={{ width: "100%", justifyContent: "center", padding: "0.7rem" }}>
                  <CheckCircle size={16} /> Application Verified & Ready for Portal Submission!
                </div>
              ) : (
                <button 
                  className="btn-primary" 
                  disabled={!safetyApproved}
                  onClick={handleSafetySubmit}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "0.7rem",
                    opacity: safetyApproved ? 1 : 0.5,
                    cursor: safetyApproved ? "pointer" : "not-allowed"
                  }}
                >
                  <Send size={16} /> Authorize & Finalize Application Packet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
