import React, { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink, FileCheck, Paperclip, RefreshCw, Upload, X } from "lucide-react";
import { auditDocuments } from "../services/api";
import { hasSourceUrl } from "../utils/actionCenter";

export default function DocumentAuditorWidget({ opportunityId, requiredDocuments = [], sourceUrl, onReadinessChange }) {
  const [uploaded, setUploaded] = useState([]);
  const [readinessResult, setReadinessResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const pickerRef = useRef(null);
  const requirementsAvailable = requiredDocuments.length > 0;
  const sourceAvailable = hasSourceUrl(sourceUrl);

  const checkReadiness = async files => {
    if (!requirementsAvailable) return;
    setChecking(true);
    try {
      const result = await auditDocuments(opportunityId || "opp_001", files);
      setReadinessResult(result);
      onReadinessChange?.(opportunityId, result);
    } catch (error) {
      console.error("Document readiness error:", error);
    } finally {
      setChecking(false);
    }
  };

  const addFiles = fileList => {
    const names = Array.from(fileList || []).map(file => file.name);
    const next = [...new Set([...uploaded, ...names])];
    setUploaded(next);
    if (next.length) checkReadiness(next);
  };
  const chooseRequirement = () => pickerRef.current.click();
  const onFilePick = event => {
    addFiles(event.target.files);
    event.target.value = "";
  };
  const removeFile = fileName => {
    const next = uploaded.filter(file => file !== fileName);
    setUploaded(next);
    if (next.length) checkReadiness(next);
    else {
      setReadinessResult(null);
      onReadinessChange?.(opportunityId, null);
    }
  };

  const isComplete = readinessResult?.readiness_status === "COMPLETE";

  return <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
    <input ref={pickerRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={onFilePick} style={{ display:"none" }}/>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:".7rem", flexWrap:"wrap" }}>
      <h3 style={{ fontSize:"1.05rem", fontWeight:700, display:"flex", alignItems:"center", gap:".5rem" }}><ClipboardCheck size={18} color="var(--accent-sage)"/>Document Readiness</h3>
      <button type="button" className="btn-secondary" disabled={!requirementsAvailable} onClick={() => pickerRef.current.click()}><Upload size={15}/>{requirementsAvailable ? "Upload files" : "Requirements not listed"}</button>
    </div>
    {requirementsAvailable ? <p style={{ fontSize:".8rem", color:"var(--text-secondary)" }}>
      Checks selected filenames against this opportunity’s required-document checklist. It does not inspect file contents, authenticity, or validity.
    </p> : <div style={{ padding:".7rem .8rem", border:"1px solid rgba(217,119,6,.22)", borderRadius:9, background:"rgba(217,119,6,.07)", color:"var(--text-secondary)", fontSize:".78rem", lineHeight:1.5 }}>
      EduFund does not have a required-document list for this opportunity, so document readiness is unavailable. This does not mean that the provider requires no documents.
      {sourceAvailable && <a href={sourceUrl} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:3, marginLeft:4, color:"var(--teal-700)", fontWeight:700 }}>Check the official source <ExternalLink size={12}/></a>}
    </div>}
    {requirementsAvailable && <div style={{ display:"flex", flexWrap:"wrap", gap:".5rem" }}>
      {requiredDocuments.map(document => <button key={document} type="button" className="btn-secondary" onClick={chooseRequirement} style={{ fontSize:".78rem", padding:".4rem .8rem" }}><Paperclip size={14}/>Attach {document}</button>)}
    </div>}
    {uploaded.length > 0 && <div className="uploaded-files"><strong>Selected files</strong>{uploaded.map(file => <div className="uploaded-file" key={file}><FileCheck size={15}/><span>{file}</span><button type="button" aria-label={`Remove ${file}`} onClick={() => removeFile(file)}><X size={14}/></button></div>)}</div>}
    {checking && <div style={{ display:"flex", alignItems:"center", gap:".45rem", fontSize:".8rem", color:"var(--text-secondary)" }}><RefreshCw size={15} style={{ animation:"spin 1s linear infinite" }}/>Matching filenames to checklist…</div>}
    {readinessResult && <div className={`document-audit ${isComplete ? "passed" : "pending"}`}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:".5rem", fontWeight:700, marginBottom:".4rem" }}>
        <span style={{ display:"flex", alignItems:"center", gap:".5rem" }}>{isComplete ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>} {readinessResult.readiness_status === "UNAVAILABLE" ? "Requirements unavailable" : isComplete ? "Checklist complete" : "More documents needed"}</span>
        <strong>{readinessResult.completion_percentage == null ? "Not listed" : `${readinessResult.completion_percentage}%`}</strong>
      </div>
      {readinessResult.readiness_status !== "UNAVAILABLE" && <p>{readinessResult.matched_count}/{readinessResult.required_count} required document filenames matched.</p>}
      <small>{readinessResult.readiness_notes}</small>
      {readinessResult.missing_requirements?.length > 0 && <small style={{ display:"block", marginTop:".35rem" }}>Still required: {readinessResult.missing_requirements.join(", ")}</small>}
    </div>}
  </div>;
}
