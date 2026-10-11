import React, { useMemo } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, FileText, Target } from "lucide-react";
import { averageCompletionPercentages, documentCompletion, hasSourceUrl, selectActionCenterTarget } from "../utils/actionCenter";

const presentText = value => typeof value === "string" && value.trim().length > 0;
const positiveNumber = value => Number.isFinite(Number(value)) && Number(value) > 0;

function profileReadiness(profile) {
  const fields = [
    { label: "education level", complete: presentText(profile?.education_level) },
    { label: "course or field", complete: presentText(profile?.course) },
    { label: "GPA and grading scale", complete: positiveNumber(profile?.academic_profile?.gpa) && positiveNumber(profile?.academic_profile?.max_gpa) },
    { label: "country", complete: presentText(profile?.location?.country) },
    { label: "annual family income", complete: positiveNumber(profile?.financial_constraints?.annual_family_income_inr) },
    { label: "target annual cost", complete: positiveNumber(profile?.financial_constraints?.target_annual_cost_inr) },
  ];
  const completeCount = fields.filter(field => field.complete).length;
  return {
    percentage: Math.round((completeCount / fields.length) * 100),
    missing: fields.filter(field => !field.complete).map(field => field.label),
  };
}

function deadlineState(daysLeft) {
  if (daysLeft < 0) return { label: "Deadline passed", color: "#b42318", background: "#fef3f2" };
  if (daysLeft <= 14) return { label: `${daysLeft} days left · urgent`, color: "#b42318", background: "#fef3f2" };
  if (daysLeft <= 30) return { label: `${daysLeft} days left · approaching`, color: "#a15c00", background: "#fff8e9" };
  return { label: `${daysLeft} days left`, color: "var(--teal-700)", background: "rgba(18,163,165,.08)" };
}

function eligibilityState(evaluation) {
  if (!evaluation) return { label: "Not evaluated", color: "#667085", background: "rgba(102,112,133,.08)" };
  const checks = evaluation.checks || [];
  if (checks.some(check => check.status === "FAIL")) return { label: "Unsatisfied", color: "#b42318", background: "#fef3f2" };
  if (checks.some(check => check.status === "UNAVAILABLE" && check.detail?.startsWith("Add "))) return { label: "Needs profile information", color: "#a15c00", background: "#fff8e9" };
  if (checks.some(check => check.status === "WARN")) return { label: "Review", color: "#a15c00", background: "#fff8e9" };
  return { label: "Available criteria satisfied", color: "#16713a", background: "rgba(41,165,87,.08)" };
}

export default function ActionCenter({
  profile,
  plan,
  opportunities = [],
  applications = [],
  documentReadiness = {},
  currency,
  onNavigate,
  onSelectAutopilot,
}) {
  const applicationById = useMemo(
    () => Object.fromEntries(applications.map(record => [record.opportunity_id, record])),
    [applications],
  );
  const evaluationById = useMemo(
    () => Object.fromEntries((plan?.eligibility_evaluations || []).map(result => [result.opportunity_id, result])),
    [plan],
  );
  const target = useMemo(() => {
    return selectActionCenterTarget(opportunities, applications, plan?.recommended_strategy || []);
  }, [applications, opportunities, plan?.recommended_strategy]);

  if (!target) {
    return <section className="bento-box" aria-labelledby="action-center-title">
      <h3 id="action-center-title" style={{ fontSize:"1.05rem", fontWeight:800 }}>EduFund Action Center</h3>
      <p style={{ marginTop:".45rem", color:"var(--text-secondary)", fontSize:".82rem" }}>No opportunity data is available yet. Open the Opportunity Market after the catalogue loads.</p>
    </section>;
  }

  const profileState = profileReadiness(profile);
  const evaluation = evaluationById[target.id];
  const application = applicationById[target.id];
  const requiredDocuments = target.required_documents || [];
  const documentResult = documentReadiness[target.id];
  const documentState = documentCompletion(requiredDocuments, documentResult);
  const documentPercentage = documentState.percentage;
  const draftAvailable = Boolean(application?.draft_text?.trim());
  const eligibility = eligibilityState(evaluation);
  const sourceAvailable = hasSourceUrl(target.website_url);
  const components = [
    { label: "Profile", value: profileState.percentage, detail: `${6 - profileState.missing.length}/6 core fields complete` },
    { label: "Eligibility", value: evaluation ? 100 : 0, detail: evaluation ? `evaluation complete · outcome: ${eligibility.label}` : "not evaluated" },
    {
      label: "Documents",
      value: documentPercentage,
      displayValue: documentState.available ? `${documentPercentage}%` : "Unavailable",
      detail: !documentState.available
        ? "requirements not listed · 0 readiness points counted"
        : documentResult
          ? `${documentResult.matched_count}/${documentResult.required_count} checklist items matched`
          : `0/${requiredDocuments.length} checklist items matched`,
    },
    { label: "Draft", value: draftAvailable ? 100 : 0, detail: draftAvailable ? "draft available" : "draft not prepared" },
  ];
  const readiness = averageCompletionPercentages(components.map(component => component.value));

  const missingDocuments = documentState.available
    ? documentResult?.missing_requirements || (documentPercentage < 100 ? requiredDocuments : [])
    : [];
  const incomplete = [
    ...profileState.missing.map(item => `Profile: ${item}`),
    ...(!evaluation ? ["Eligibility evaluation"] : []),
    ...(!documentState.available ? ["Document requirements are not listed in EduFund"] : []),
    ...missingDocuments.map(item => `Document: ${item}`),
    ...(!draftAvailable ? ["Application draft"] : []),
  ];

  let nextAction;
  if (target.days_left < 0) {
    nextAction = { label: "Review the saved record for this closed deadline", tab: "pipeline" };
  } else if (profileState.missing.length) {
    nextAction = { label: `Complete profile: ${profileState.missing[0]}`, tab: "profile" };
  } else if (!evaluation) {
    nextAction = { label: "Review this opportunity's listed eligibility criteria", tab: "discovery" };
  } else if (!documentState.available) {
    nextAction = { label: "Check the official source for required documents", tab: "discovery", url: sourceAvailable ? target.website_url : null };
  } else if (documentPercentage < 100) {
    nextAction = { label: `Add required document: ${missingDocuments[0] || "review checklist"}`, tab: "autopilot" };
  } else if (!draftAvailable) {
    nextAction = { label: "Prepare and review the application draft", tab: "autopilot" };
  } else if (application?.status !== "READY_TO_SUBMIT" && application?.status !== "SUBMITTED") {
    nextAction = { label: "Review the draft and mark the packet ready", tab: "autopilot" };
  } else if (application?.status === "READY_TO_SUBMIT") {
    nextAction = { label: "Prioritize final review before the deadline", tab: "autopilot" };
  } else {
    nextAction = { label: "Review submitted applications and upcoming deadlines", tab: "pipeline" };
  }

  const runNextAction = () => {
    if (nextAction.url) window.open(nextAction.url, "_blank", "noopener,noreferrer");
    else if (nextAction.tab === "autopilot") onSelectAutopilot?.(target);
    else onNavigate(nextAction.tab);
  };

  const deadline = deadlineState(target.days_left);
  const fundingGap = plan?.funding_gap_inr || 0;
  const contribution = fundingGap > 0 ? Math.min(100, Math.round((target.amount_inr / fundingGap) * 100)) : null;
  const amount = currency === "INR" ? `₹${target.amount_inr.toLocaleString()}` : `$${target.amount_usd.toLocaleString()}`;

  return <section className="bento-box" aria-labelledby="action-center-title" style={{ padding:"1.35rem" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem", flexWrap:"wrap" }}>
      <div>
        <span className="eyebrow">WHAT TO DO NEXT</span>
        <h3 id="action-center-title" style={{ fontSize:"1.15rem", fontWeight:800, marginTop:".15rem" }}>EduFund Action Center</h3>
        <p style={{ color:"var(--text-secondary)", fontSize:".8rem", marginTop:".2rem" }}>{target.title}</p>
      </div>
      <div style={{ display:"flex", gap:".45rem", alignItems:"center", flexWrap:"wrap" }}>
        <span className="badge" style={{ color:deadline.color, background:deadline.background, border:`1px solid ${deadline.color}33`, display:"flex", gap:".3rem", alignItems:"center" }}><Clock3 size={12}/>{deadline.label}</span>
        <span className="badge" style={{ color:eligibility.color, background:eligibility.background, border:`1px solid ${eligibility.color}33` }}>Eligibility: {eligibility.label}</span>
        {sourceAvailable && <a href={target.website_url} target="_blank" rel="noreferrer" className="badge badge-teal" style={{ textDecoration:"none" }}>Official source linked</a>}
      </div>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem", marginTop:"1rem" }}>
      <div style={{ padding:"1rem", borderRadius:12, background:"linear-gradient(145deg,rgba(14,122,124,.96),rgba(8,100,100,.98))", color:"#fff" }}>
        <div style={{ fontSize:".7rem", fontWeight:800, letterSpacing:".07em", textTransform:"uppercase", opacity:.82 }}>Application Readiness</div>
        <div style={{ fontSize:"2.2rem", fontWeight:900, margin:".3rem 0" }}>{readiness}<span style={{ fontSize:"1rem", opacity:.8 }}>/100</span></div>
        <p style={{ fontSize:".7rem", lineHeight:1.45, opacity:.82 }}>Equal-weight average of profile, eligibility evaluation, document checklist, and draft availability. The eligibility component records completion of the evaluation; its outcome is shown separately. This is not eligibility or award likelihood.</p>
      </div>

      <div style={{ border:"1px solid var(--border-subtle)", borderRadius:12, padding:".9rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".4rem", fontWeight:800, fontSize:".85rem", marginBottom:".65rem" }}><Target size={16} color="var(--accent-teal)"/>Why this score</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,minmax(0,1fr))", gap:".55rem" }}>
          {components.map(component => <div key={component.label} style={{ padding:".55rem .65rem", borderRadius:8, background:"rgba(18,163,165,.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:".5rem", fontSize:".74rem", fontWeight:700 }}><span>{component.label}</span><strong style={{ color:"var(--teal-700)" }}>{component.displayValue || `${component.value}%`}</strong></div>
            <small style={{ display:"block", color:"var(--text-muted)", marginTop:".15rem", fontSize:".66rem" }}>{component.detail}</small>
          </div>)}
        </div>
      </div>

      <div style={{ border:"1px solid var(--border-subtle)", borderRadius:12, padding:".9rem" }}>
        <div style={{ fontSize:".72rem", color:"var(--text-muted)", fontWeight:800, textTransform:"uppercase" }}>Funding contribution</div>
        <div style={{ fontSize:"1.35rem", fontWeight:900, color:"var(--accent-sage)", margin:".25rem 0" }}>{amount}</div>
        <p style={{ fontSize:".72rem", color:"var(--text-secondary)", lineHeight:1.4 }}>{contribution === null ? "There is no remaining funding gap." : `Listed amount equals up to ${contribution}% of the current funding gap.`} Awards are not guaranteed.</p>
        <div style={{ marginTop:".55rem", fontSize:".7rem", color:"var(--text-muted)" }}>Provider: <strong style={{ color:"var(--text-primary)" }}>{target.provider}</strong></div>
      </div>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:"1rem", marginTop:"1rem" }}>
      <div style={{ padding:".9rem", borderRadius:12, background:"rgba(18,163,165,.06)", border:"1px solid rgba(18,163,165,.16)" }}>
        <div style={{ display:"flex", gap:".45rem", alignItems:"center", fontSize:".72rem", color:"var(--teal-700)", fontWeight:800, textTransform:"uppercase" }}><ArrowRight size={15}/>Next Best Action</div>
        <p style={{ fontSize:".88rem", fontWeight:700, margin:".35rem 0 .7rem" }}>{nextAction.label}</p>
        <button className="btn-primary" onClick={runNextAction}>Take this action <ArrowRight size={14}/></button>
      </div>
      <div style={{ padding:".9rem", borderRadius:12, border:"1px solid var(--border-subtle)" }}>
        <div style={{ display:"flex", gap:".45rem", alignItems:"center", fontSize:".75rem", fontWeight:800, marginBottom:".4rem" }}>{incomplete.length ? <AlertTriangle size={15} color="var(--amber-500)"/> : <CheckCircle2 size={15} color="var(--accent-sage)"/>}What is incomplete</div>
        {incomplete.length ? <ul style={{ margin:0, paddingLeft:"1.1rem", color:"var(--text-secondary)", fontSize:".72rem", lineHeight:1.55 }}>
          {incomplete.slice(0, 4).map(item => <li key={item}>{item}</li>)}
          {incomplete.length > 4 && <li>Plus {incomplete.length - 4} more item{incomplete.length - 4 === 1 ? "" : "s"}</li>}
        </ul> : <p style={{ fontSize:".74rem", color:"var(--text-secondary)" }}><FileText size={14} style={{ verticalAlign:"middle", marginRight:4 }}/>No setup items are incomplete.</p>}
      </div>
    </div>
  </section>;
}
