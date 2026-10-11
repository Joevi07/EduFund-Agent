import React, { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileCheck, Paperclip, RefreshCw, Upload, X } from "lucide-react";
import { auditDocuments } from "../services/api";

export default function DocumentAuditorWidget({ opportunityId, requiredDocuments = [] }) {
  const [uploaded, setUploaded] = useState([]);
  const [readinessResult, setReadinessResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const pickerRef = useRef(null);

  const checkReadiness = async files => {
    setChecking(true);
    try {
      setReadinessResult(await auditDocuments(opportunityId || "opp_001", files));
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
    else setReadinessResult(null);
  };

  const isComplete = readinessResult?.readiness_status === "COMPLETE";

  return <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
    <input ref={pickerRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={onFilePick} style={{ display:"none" }}/>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:".7rem", flexWrap:"wrap" }}>
      <h3 style={{ fontSize:"1.05rem", fontWeight:700, display:"flex", alignItems:"center", gap:".5rem" }}><ClipboardCheck size={18} color="var(--accent-sage)"/>Document Readiness</h3>
      <button type="button" className="btn-secondary" onClick={() => pickerRef.current.click()}><Upload size={15}/>Upload files</button>
    </div>
    <p style={{ fontSize:".8rem", color:"var(--text-secondary)" }}>
      Checks selected filenames against this opportunity’s required-document checklist. It does not inspect file contents, authenticity, or validity.
    </p>
    <div style={{ display:"flex", flexWrap:"wrap", gap:".5rem" }}>
      {requiredDocuments.map(document => <button key={document} type="button" className="btn-secondary" onClick={chooseRequirement} style={{ fontSize:".78rem", padding:".4rem .8rem" }}><Paperclip size={14}/>Attach {document}</button>)}
    </div>
    {uploaded.length > 0 && <div className="uploaded-files"><strong>Selected files</strong>{uploaded.map(file => <div className="uploaded-file" key={file}><FileCheck size={15}/><span>{file}</span><button type="button" aria-label={`Remove ${file}`} onClick={() => removeFile(file)}><X size={14}/></button></div>)}</div>}
    {checking && <div style={{ display:"flex", alignItems:"center", gap:".45rem", fontSize:".8rem", color:"var(--text-secondary)" }}><RefreshCw size={15} style={{ animation:"spin 1s linear infinite" }}/>Matching filenames to checklist…</div>}
    {readinessResult && <div className={`document-audit ${isComplete ? "passed" : "pending"}`}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:".5rem", fontWeight:700, marginBottom:".4rem" }}>
        <span style={{ display:"flex", alignItems:"center", gap:".5rem" }}>{isComplete ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>} {isComplete ? "Checklist complete" : "More documents needed"}</span>
        <strong>{readinessResult.completion_percentage}%</strong>
      </div>
      <p>{readinessResult.matched_count}/{readinessResult.required_count} required document filenames matched.</p>
      <small>{readinessResult.readiness_notes}</small>
      {readinessResult.missing_requirements?.length > 0 && <small style={{ display:"block", marginTop:".35rem" }}>Still required: {readinessResult.missing_requirements.join(", ")}</small>}
    </div>}
  </div>;
}
