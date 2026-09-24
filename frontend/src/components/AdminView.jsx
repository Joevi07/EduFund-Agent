import React, { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CalendarClock, CheckCircle2, ClipboardList, Database, ExternalLink, ShieldCheck, Users, UserRoundCheck } from "lucide-react";
import { fetchAdminCatalogue, fetchAdminOverview, fetchAdminUsers } from "../services/api";

export default function AdminView({ token }) {
  const [overview, setOverview] = useState(null), [users, setUsers] = useState([]), [catalogue, setCatalogue] = useState([]), [error, setError] = useState("");
  useEffect(() => { Promise.all([fetchAdminOverview(token), fetchAdminUsers(token), fetchAdminCatalogue(token)]).then(([o,u,c]) => { setOverview(o); setUsers(u); setCatalogue(c); }).catch(e => setError(e.message)); }, [token]);
  const rows = useMemo(() => catalogue.slice().sort((a,b) => a.days_left - b.days_left), [catalogue]);
  const stats = [
    { label:"Student accounts", value:overview?.student_count, detail:`${overview?.completed_profiles ?? 0} completed profiles`, Icon:Users, tone:"blue" },
    { label:"Verified source links", value:overview?.source_linked_count, detail:"Official programme pages", Icon:BookOpenCheck, tone:"green" },
    { label:"Deadline risks", value:overview?.deadline_review?.urgent_count, detail:"Closing within 15 days", Icon:CalendarClock, tone:"orange" },
    { label:"Applications tracked", value:overview?.application_count, detail:"Across all stages", Icon:ClipboardList, tone:"purple" },
  ];
  const stage = overview?.application_statuses || {};
  if (error) return <div className="auth-error">{error}</div>;
  return <div className="admin-view">
    <div className="page-heading"><div><span className="eyebrow">ADMIN OPERATIONS & TRUST CENTER</span><h2>Run a credible funding platform</h2><p>Monitor source quality, deadline risk, student readiness, and application progression without exposing student financial details.</p></div><div className="admin-shield"><ShieldCheck size={19}/><span>Governance mode</span></div></div>
    <div className="admin-stats">{stats.map(({label,value,detail,Icon,tone}) => <div className={`admin-stat ${tone}`} key={label}><div><span>{label}</span><strong>{value ?? "—"}</strong><small>{detail}</small></div><Icon size={25}/></div>)}</div>
    <div className="admin-command-grid">
      <section className="admin-table-card"><div className="table-title"><div><h3>Deadline command queue</h3><p>Programmes that need source and deadline review first.</p></div><span className="table-count">{overview?.deadline_review?.urgent_count ?? 0} urgent</span></div><div className="admin-queue">{(overview?.deadline_review?.urgent_items || []).length ? overview.deadline_review.urgent_items.map(item => <div className="queue-row" key={item.id}><CalendarClock size={17}/><div><strong>{item.title}</strong><span>{item.provider} · closes {item.deadline}</span></div><b>{item.days_left} days</b></div>) : <div className="queue-empty"><CheckCircle2 size={18}/> No deadline is inside the 15-day review window.</div>}</div></section>
      <section className="admin-table-card"><div className="table-title"><div><h3>Student activation health</h3><p>Aggregate onboarding metrics, privacy-safe by design.</p></div><UserRoundCheck size={20} color="var(--accent-teal)"/></div><div className="readiness-metric"><strong>{overview?.completed_profiles ?? 0}</strong><span>profiles completed</span></div><div className="stage-bars">{["DISCOVERED","PLANNED","DRAFTING","READY_TO_SUBMIT","SUBMITTED"].map(name => <div key={name}><span>{name.replaceAll("_"," ")}</span><div><i style={{width:`${Math.min(100, (stage[name] || 0) * 18)}%`}}/></div><b>{stage[name] || 0}</b></div>)}</div></section>
    </div>
    <section className="admin-table-card"><div className="table-title"><div><h3>Official-source catalogue governance</h3><p>Every funding record links to the programme owner. Open records to review current terms and deadlines before recommending them.</p></div><span className="table-count"><Database size={13}/> {catalogue.length} monitored</span></div><div className="catalogue-table"><div className="catalogue-row catalogue-head"><span>Programme</span><span>Provider</span><span>Deadline</span><span>Source</span></div>{rows.map(item => <div className="catalogue-row" key={item.id}><span><strong>{item.title}</strong><small>{item.category}</small></span><span>{item.provider}</span><span className={item.days_left <= 15 ? "deadline-risk" : ""}>{item.deadline}<small>{item.days_left} days remaining</small></span><a href={item.website_url} target="_blank" rel="noreferrer" className="source-link">Official source <ExternalLink size={14}/></a></div>)}</div></section>
    <section className="admin-table-card"><div className="table-title"><div><h3>Account directory</h3><p>Manage access roles. Student profile contents remain private.</p></div><span className="table-count">{users.length} total</span></div><div className="user-table"><div className="user-row table-head"><span>User</span><span>Email</span><span>Role</span><span>Joined</span></div>{users.map(user => <div className="user-row" key={user.id}><span><b className="avatar-small">{user.name[0]}</b>{user.name}</span><span>{user.email}</span><span><i className={user.role === "admin" ? "role-admin" : "role-student"}>{user.role}</i></span><span>{user.created_at ? new Date(user.created_at + "Z").toLocaleDateString() : "—"}</span></div>)}</div></section>
  </div>;
}
