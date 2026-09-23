import React, { useState } from "react";
import { Upload, FileCheck, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { auditDocuments } from "../services/api";

export default function DocumentAuditorWidget({ opportunityId, requiredDocuments }) {
  const [uploaded, setUploaded] = useState(["Official_Transcript.pdf"]);
  const [auditResult, setAuditResult] = useState(null);
  const [auditing, setAuditing] = useState(false);

  const handleSimulateUpload = async (docName) => {
    const fileName = docName.replace(/ /g, "_").toLowerCase() + ".pdf";
    if (!uploaded.includes(fileName)) {
      const nextUploaded = [...uploaded, fileName];
      setUploaded(nextUploaded);
      setAuditing(true);
      try {
        const res = await auditDocuments(opportunityId || "opp_001", nextUploaded);
        setAuditResult(res);
      } catch (err) {
        console.error("Audit error:", err);
      } finally {
        setAuditing(false);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ShieldCheck size={18} color="var(--neon-emerald)" /> Document Verification Auditor
        </h3>
        <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>AUTOPILOT OCR</span>
      </div>

      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        Drag mock files to verify marksheets, income certificates, and recommendations against eligibility constraints.
      </p>

      {/* Mock Document Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {(requiredDocuments || ["10th & 12th Marksheets", "Income Certificate", "Letter of Recommendation"]).map((doc, idx) => (
          <button
            key={idx}
            className="btn-secondary"
            onClick={() => handleSimulateUpload(doc)}
            style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-sm)" }}
          >
            + Attach {doc}
          </button>
        ))}
      </div>

      {/* Verification Status List */}
      {auditResult && (
        <div style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "var(--radius-sm)",
          padding: "0.8rem",
          fontSize: "0.8rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "var(--neon-emerald)", marginBottom: "0.4rem" }}>
            <CheckCircle2 size={16} /> Audit Result: {auditResult.verification_status}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>{auditResult.audit_notes}</p>
        </div>
      )}
    </div>
  );
}
