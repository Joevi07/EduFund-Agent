import React, { useRef, useState } from "react";
import { Upload, FileCheck, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, X, Paperclip } from "lucide-react";
import { auditDocuments } from "../services/api";

const fileNameFor = document => `${document.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "")}.pdf`;

export default function DocumentAuditorWidget({ opportunityId, requiredDocuments = [] }) {
  const [uploaded, setUploaded] = useState([]), [auditResult, setAuditResult] = useState(null), [auditing, setAuditing] = useState(false);
  const pickerRef = useRef(null);
  const runAudit = async files => { setAuditing(true); try { setAuditResult(await auditDocuments(opportunityId || "opp_001", files)); } catch (error) { console.error("Audit error:", error); } finally { setAuditing(false); } };
  const addFiles = fileList => { const names = Array.from(fileList || []).map(file => file.name); const next = [...new Set([...uploaded, ...names])]; setUploaded(next); if (next.length) runAudit(next); };
  const chooseRequirement = document => { pickerRef.current.dataset.requirement = document; pickerRef.current.click(); };
  const onFilePick = event => { addFiles(event.target.files); event.target.value = ""; };
  const removeFile = fileName => { const next = uploaded.filter(file => file !== fileName); setUploaded(next); if (next.length) runAudit(next); else setAuditResult(null); };
  return <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
    <input ref={pickerRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={onFilePick} style={{display:"none"}}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:".7rem",flexWrap:"wrap"}}><h3 style={{fontSize:"1.05rem",fontWeight:700,display:"flex",alignItems:"center",gap:".5rem"}}><ShieldCheck size={18} color="var(--accent-sage)"/>Document Verification Auditor</h3><button type="button" className="btn-secondary" onClick={()=>pickerRef.current.click()}><Upload size={15}/>Upload files</button></div>
    <p style={{fontSize:".8rem",color:"var(--text-secondary)"}}>Select a sample or real non-sensitive file from your device. The app checks its filename against this opportunity’s document requirements.</p>
    <div style={{display:"flex",flexWrap:"wrap",gap:".5rem"}}>{requiredDocuments.map(document=><button key={document} type="button" className="btn-secondary" onClick={()=>chooseRequirement(document)} style={{fontSize:".78rem",padding:".4rem .8rem"}}><Paperclip size={14}/>Attach {document}</button>)}</div>
    {uploaded.length>0&&<div className="uploaded-files"><strong>Selected files</strong>{uploaded.map(file=><div className="uploaded-file" key={file}><FileCheck size={15}/><span>{file}</span><button type="button" aria-label={`Remove ${file}`} onClick={()=>removeFile(file)}><X size={14}/></button></div>)}</div>}
    {auditing&&<div style={{display:"flex",alignItems:"center",gap:".45rem",fontSize:".8rem",color:"var(--text-secondary)"}}><RefreshCw size={15} style={{animation:"spin 1s linear infinite"}}/>Checking selected files…</div>}
    {auditResult&&<div className={`document-audit ${auditResult.verification_status === "PASSED" ? "passed" : "pending"}`}><div style={{display:"flex",alignItems:"center",gap:".5rem",fontWeight:700,marginBottom:".4rem"}}>{auditResult.verification_status === "PASSED" ? <CheckCircle2 size={17}/> : <AlertTriangle size={17}/>}{auditResult.verification_status === "PASSED" ? "Audit complete" : "More documents needed"}</div><p>{auditResult.audit_notes}</p>{auditResult.missing_requirements?.length>0&&<small>Still required: {auditResult.missing_requirements.join(", ")}</small>}</div>}
  </div>;
}
