import React, { useEffect, useMemo, useState } from "react";
import { Clock3 } from "lucide-react";

function remaining(deadline) {
  if (!deadline) return null;
  const target = new Date(`${deadline}T23:59:59`).getTime();
  const delta = Math.max(0, target - Date.now());
  return { expired: target < Date.now(), days: Math.floor(delta / 86400000), hours: Math.floor((delta % 86400000) / 3600000), minutes: Math.floor((delta % 3600000) / 60000), seconds: Math.floor((delta % 60000) / 1000) };
}

export default function DeadlineCountdown({ deadline, compact = false }) {
  const [time, setTime] = useState(() => remaining(deadline));
  useEffect(() => { setTime(remaining(deadline)); const timer = setInterval(() => setTime(remaining(deadline)), 1000); return () => clearInterval(timer); }, [deadline]);
  const label = useMemo(() => !time ? "Deadline unavailable" : time.expired ? "Deadline passed" : `${time.days}d ${String(time.hours).padStart(2, "0")}h ${String(time.minutes).padStart(2, "0")}m ${String(time.seconds).padStart(2, "0")}s`, [time]);
  return <span className={`deadline-countdown ${time?.expired ? "expired" : ""} ${compact ? "compact" : ""}`} title={deadline ? `Closes ${deadline}` : "Deadline unavailable"}><Clock3 size={compact ? 12 : 14}/>{label}</span>;
}
