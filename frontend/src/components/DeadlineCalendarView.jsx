import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function urgencyStyle(daysLeft) {
  if (daysLeft < 0)   return { bg: "#f3f4f6", color: "#9ca3af", badge: "Expired",   badgeBg: "#9ca3af" };
  if (daysLeft <= 7)  return { bg: "rgba(180,35,24,.08)", color: "#b42318", badge: `${daysLeft}d`, badgeBg: "#b42318" };
  if (daysLeft <= 21) return { bg: "rgba(217,119,6,.08)", color: "#d97706", badge: `${daysLeft}d`, badgeBg: "#d97706" };
  return                     { bg: "rgba(22,113,58,.07)", color: "#16713a", badge: `${daysLeft}d`, badgeBg: "#16713a" };
}

export default function DeadlineCalendarView({ opportunities = [] }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Build map: day → matched opportunities this month
  const dayMap = {};
  for (const opp of opportunities) {
    if (!opp.deadline) continue;
    const d = new Date(opp.deadline);
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate();
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push(opp);
    }
  }

  // Focus weeks (red deadlines in next 14 days)
  const focusWeek = opportunities.filter(o => o.days_left >= 0 && o.days_left <= 14).sort((a, b) => a.days_left - b.days_left);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Focus weeks banner */}
      {focusWeek.length > 0 && (
        <div style={{ padding: ".8rem 1.1rem", background: "rgba(180,35,24,.07)", border: "1px solid rgba(180,35,24,.22)", borderRadius: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".55rem" }}>
            <Clock size={15} color="#b42318" />
            <span style={{ fontWeight: 800, fontSize: ".82rem", color: "#b42318" }}>⚡ Focus This Week — {focusWeek.length} deadline{focusWeek.length !== 1 ? "s" : ""} within 14 days</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: ".38rem" }}>
            {focusWeek.map(opp => {
              const { color, badge } = urgencyStyle(opp.days_left);
              return (
                <div key={opp.id} style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                  <span style={{ padding: ".12rem .4rem", borderRadius: 999, background: color, color: "#fff", fontSize: ".6rem", fontWeight: 800, minWidth: 28, textAlign: "center" }}>{badge}</span>
                  <span style={{ fontSize: ".78rem", color: "var(--text-primary)", fontWeight: 600 }}>{opp.title}</span>
                  <span style={{ fontSize: ".68rem", color: "var(--text-muted)", marginLeft: "auto", whiteSpace: "nowrap" }}>{opp.deadline}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="bento-box">
        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <button onClick={prevMonth} style={{ border: "1px solid var(--border-subtle)", background: "#fff", borderRadius: 8, padding: ".3rem .6rem", cursor: "pointer", display: "flex" }}><ChevronLeft size={16} /></button>
          <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
            <Calendar size={16} color="var(--accent-teal)" />
            <h3 style={{ fontWeight: 800, fontSize: "1.05rem", margin: 0 }}>{MONTHS[viewMonth]} {viewYear}</h3>
          </div>
          <button onClick={nextMonth} style={{ border: "1px solid var(--border-subtle)", background: "#fff", borderRadius: 8, padding: ".3rem .6rem", cursor: "pointer", display: "flex" }}><ChevronRight size={16} /></button>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginBottom: ".75rem", fontSize: ".68rem" }}>
          {[["#b42318","≤ 7 days (Urgent)"],["#d97706","8–21 days (Soon)"],["#16713a","> 21 days (Planned)"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }}></span>
              <span style={{ color: "var(--text-muted)" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: ".68rem", fontWeight: 700, color: "var(--text-muted)", padding: ".3rem 0" }}>{d}</div>)}
        </div>

        {/* Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const opps = dayMap[day] || [];
            const isToday = day === today.getDate() && viewYear === today.getFullYear() && viewMonth === today.getMonth();
            return (
              <div key={day} style={{
                minHeight: 52, padding: ".3rem .25rem", borderRadius: 8,
                background: isToday ? "rgba(18,163,165,.12)" : opps.length ? "rgba(18,163,165,.04)" : "transparent",
                border: isToday ? "2px solid var(--teal-500)" : "1px solid var(--border-subtle)",
                position: "relative", overflow: "hidden",
              }}>
                <span style={{ fontSize: ".7rem", fontWeight: isToday ? 800 : 600, color: isToday ? "var(--teal-700)" : "var(--text-primary)", display: "block", textAlign: "center" }}>{day}</span>
                {opps.map(o => {
                  const { color } = urgencyStyle(o.days_left);
                  return (
                    <div key={o.id} title={o.title} style={{ marginTop: 2, height: 5, borderRadius: 3, background: color }} />
                  );
                })}
                {opps.length > 0 && (
                  <div style={{ position: "absolute", top: 2, right: 3, width: 14, height: 14, borderRadius: "50%", background: urgencyStyle(opps[0].days_left).color, color: "#fff", fontSize: ".52rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {opps.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
