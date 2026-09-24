import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { checkEssayEvidence } from "../services/api";

export default function EssayEvidenceChecker({ opportunityId, essayDraft, profile }) {
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleVerify = async () => {
    setChecking(true);
    try {
      const res = await checkEssayEvidence(opportunityId || "opp_001", essayDraft, profile);
      setResult(res);
    } catch (err) {
      console.error("Evidence check error:", err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={18} color="#20a8d8" /> AI Essay Evidence Checker
        </h3>
        <button 
          className="btn-secondary" 
          onClick={handleVerify}
          disabled={checking}
          style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
        >
          {checking ? "Scanning Profile..." : "Verify Essay Claims"}
        </button>
      </div>

      {result && (
        <div style={{ background: "#f8f9fa", border: "1px solid #e4e7ea", padding: "0.85rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#272c33" }}>
              Fact Audit Validity Score: <strong style={{ color: "#2ecc71" }}>{result.overall_validity_score}%</strong>
            </span>
            <span className="badge badge-high">{result.verified_claims_count} Claims Verified</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {result.claim_verifications.map((item, idx) => (
              <div key={idx} style={{ padding: "0.45rem 0.6rem", background: "#ffffff", borderRadius: "6px", border: "1px solid #e4e7ea", fontSize: "0.78rem" }}>
                <div style={{ fontWeight: 600, color: item.verification_status === "VALIDATED" ? "#155724" : "#856404" }}>
                  {item.feedback_note}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#8796a6", marginTop: "0.15rem" }}>Source: {item.evidence_source}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
