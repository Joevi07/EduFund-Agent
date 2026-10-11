export function clampPercentage(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, numeric));
}

export function hasSourceUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function averageCompletionPercentages(percentages) {
  if (!Array.isArray(percentages) || percentages.length !== 4) {
    throw new RangeError("Application Readiness requires exactly four completion components.");
  }
  const average = percentages.reduce((sum, value) => sum + clampPercentage(value), 0) / 4;
  return clampPercentage(Math.round(average));
}

export function documentCompletion(requiredDocuments, readinessResult) {
  if (!Array.isArray(requiredDocuments) || requiredDocuments.length === 0) {
    return { available: false, percentage: 0 };
  }
  return {
    available: true,
    percentage: clampPercentage(readinessResult?.completion_percentage ?? 0),
  };
}

export function selectActionCenterTarget(opportunities = [], applications = [], recommendations = []) {
  const applicationById = Object.fromEntries(applications.map(record => [record.opportunity_id, record]));
  const priorityById = Object.fromEntries(recommendations.map(item => [item.opportunity_id, item]));
  const relevant = opportunities.filter(opp => applicationById[opp.id] || priorityById[opp.id]);
  const pool = relevant.length ? relevant : opportunities;

  return [...pool].sort((left, right) => {
    const leftExpired = left.days_left < 0 ? 1 : 0;
    const rightExpired = right.days_left < 0 ? 1 : 0;
    if (leftExpired !== rightExpired) return leftExpired - rightExpired;

    const leftState = applicationById[left.id]?.status === "SUBMITTED" ? 2 : applicationById[left.id] ? 0 : 1;
    const rightState = applicationById[right.id]?.status === "SUBMITTED" ? 2 : applicationById[right.id] ? 0 : 1;
    if (leftState !== rightState) return leftState - rightState;

    const leftRank = priorityById[left.id]?.priority_rank ?? Number.MAX_SAFE_INTEGER;
    const rightRank = priorityById[right.id]?.priority_rank ?? Number.MAX_SAFE_INTEGER;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return left.days_left - right.days_left;
  })[0] || null;
}
