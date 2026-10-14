import React, { useState, useEffect } from "react";
import { X, FileText, Copy, Check, Printer, Download, Share2, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "../services/api";

const API = API_BASE_URL;

export default function AdvisorFundingBriefModal({ profile, currency, onClose }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const isINR = currency === "INR";
  const fmt = (inr, usd) => isINR ? `₹${Number(inr || 0).toLocaleString()}` : `$${Number(usd || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    fetch(`${API}/planner/advisor-brief`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
      .then(r => r.json())
      .then(data => { setBrief(data); setLoading(false); })
      .catch(err => { setError("Could not generate brief."); setLoading(false); });
  }, [profile]);

  // This is a public, read-only endpoint created specifically for the advisor.
  const shareUrl = brief ? `${API}/advisor-brief/${brief.share_token}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)", padding: "1rem" }}>
      <div className="printable-brief" style={{ background: "#fff", borderRadius: 18, boxShadow: "0 24px 80px rgba(0,0,0,.25)", width: "100%", maxWidth: 720, maxHeight: "90vh", overflow: "auto", position: "relative" }}>
        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.1rem 1.5rem", background: "linear-gradient(135deg,#0e7a7c,#12a3a5)", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <FileText size={20} />
            <div>
              <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>Advisor Funding Brief</h2>
              <p style={{ margin: 0, fontSize: ".72rem", opacity: .85 }}>Shareable funding overview for advisors, counselors, or family</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: 8, padding: ".4rem", cursor: "pointer", color: "#fff", display: "flex" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <div style={{ width: 36, height: 36, border: "3px solid var(--border-subtle)", borderTopColor: "var(--teal-500)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
              Generating advisor brief…
            </div>
          )}
          {error && <div style={{ color: "#b42318", textAlign: "center", padding: "2rem" }}>{error}</div>}

          {brief && (
            <>
              {/* Share controls */}
              <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", flex: 1, minWidth: 200, gap: ".4rem", padding: ".55rem .75rem", border: "1px solid var(--border-subtle)", borderRadius: 10, background: "rgba(18,163,165,.04)", alignItems: "center" }}>
                  <Share2 size={13} color="var(--teal-600)" />
                  <span style={{ fontSize: ".72rem", color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</span>
                </div>
                <button onClick={handleCopyLink} style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem .85rem", border: "1px solid rgba(18,163,165,.3)", borderRadius: 10, background: copied ? "rgba(22,113,58,.1)" : "rgba(18,163,165,.06)", color: copied ? "#16713a" : "var(--teal-700)", cursor: "pointer", fontSize: ".75rem", fontWeight: 700 }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied!" : "Copy Link"}
                </button>
                <a href={shareUrl} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem .85rem", border: "1px solid var(--border-subtle)", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".75rem", fontWeight: 700, color: "var(--text-secondary)", textDecoration: "none" }}>
                  <ExternalLink size={13} /> Open link
                </a>
                <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: ".4rem", padding: ".5rem .85rem", border: "1px solid var(--border-subtle)", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: ".75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  <Printer size={13} /> Print / PDF
                </button>
              </div>

              {/* Student summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: ".65rem", marginBottom: "1.25rem" }}>
                {[
                  { label: "Student",        value: brief.student_name },
                  { label: "Level",          value: brief.education_level },
                  { label: "Course",         value: brief.course },
                  { label: "Location",       value: brief.location },
                  { label: "Academics",      value: brief.academic_summary },
                  { label: "Profile Score",  value: `${brief.profile_completion_percentage}% complete` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: ".6rem .75rem", border: "1px solid var(--border-subtle)", borderRadius: 10, background: "rgba(18,163,165,.03)" }}>
                    <div style={{ fontSize: ".65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: ".2rem" }}>{label}</div>
                    <div style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--text-primary)" }}>{value || "—"}</div>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <h4 style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem" }}>Financial Overview</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: ".55rem", marginBottom: "1.25rem" }}>
                {[
                  { label: "Annual Cost",       inr: brief.financial_summary.target_annual_cost_inr,  usd: brief.financial_summary.target_annual_cost_inr / 83, color: "var(--text-primary)" },
                  { label: "Confirmed Aid",     inr: brief.financial_summary.confirmed_aid_inr,        usd: brief.financial_summary.confirmed_aid_inr / 83,       color: "#16713a" },
                  { label: "Funding Gap",       inr: brief.financial_summary.funding_gap_inr,          usd: brief.financial_summary.funding_gap_usd,              color: "#d97706" },
                  { label: "Potential Coverage",inr: brief.financial_summary.potential_coverage_inr,  usd: brief.financial_summary.potential_coverage_inr / 83,   color: "#0891b2" },
                ].map(({ label, inr, usd, color }) => (
                  <div key={label} style={{ padding: ".65rem .75rem", border: `1px solid ${color}33`, borderRadius: 10, background: `${color}08` }}>
                    <div style={{ fontSize: ".65rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 800, color, marginTop: ".15rem" }}>{fmt(inr, usd)}</div>
                  </div>
                ))}
              </div>

              {/* Top opportunities */}
              {brief.recommended_strategy?.length > 0 && (
                <>
                  <h4 style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem" }}>Top Recommended Opportunities</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: ".45rem", marginBottom: "1.25rem" }}>
                    {brief.recommended_strategy.slice(0, 5).map((item, i) => (
                      <div key={item.opportunity_id} style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".6rem .8rem", border: "1px solid var(--border-subtle)", borderRadius: 10, background: "rgba(18,163,165,.025)" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--teal-500)", color: "#fff", fontSize: ".65rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ flex: 1, fontSize: ".8rem", fontWeight: 700 }}>{item.title}</span>
                        <span style={{ fontSize: ".75rem", color: "#16713a", fontWeight: 700 }}>{fmt(item.amount_inr, item.amount_usd)}</span>
                        <span style={{ fontSize: ".68rem", color: "var(--text-muted)" }}>Score: {item.application_priority_score}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Documents checklist */}
              {brief.required_documents_checklist?.length > 0 && (
                <>
                  <h4 style={{ fontSize: ".9rem", fontWeight: 800, marginBottom: ".6rem" }}>Required Documents Checklist</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: ".35rem", marginBottom: "1rem" }}>
                    {brief.required_documents_checklist.map(doc => (
                      <div key={doc} style={{ display: "flex", gap: ".4rem", alignItems: "center", fontSize: ".75rem", color: "var(--text-secondary)" }}>
                        <div style={{ width: 14, height: 14, border: "1.5px solid #9ca3af", borderRadius: 3, flexShrink: 0 }} />
                        {doc}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div style={{ padding: ".6rem .75rem", background: "#fff8e9", border: "1px solid #f4dfad", borderRadius: 9, fontSize: ".7rem", color: "#885c12" }}>
                Generated {brief.generated_date} · EduFund AI Platform · Token: {brief.share_token} · This brief reflects EduFund AI estimates only and does not guarantee awards or admission.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
