import React, { useEffect, useState } from "react";

export default function MatchScoreRing({ score = 0, size = 52 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const frame = requestAnimationFrame(() => setShown(Math.max(0, Math.min(100, score)))); return () => cancelAnimationFrame(frame); }, [score]);
  return <div className="match-score-ring" style={{ width:size, height:size, background:`conic-gradient(var(--accent-teal) ${shown * 3.6}deg, #e6eeee 0deg)` }} aria-label={`${score} percent eligibility match`}><div><strong>{Math.round(score)}</strong><span>%</span></div></div>;
}
