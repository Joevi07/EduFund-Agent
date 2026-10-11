const nonNegativeNumber = value => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

export function buildSuggestedFundingBundle(recommendations = [], opportunities = [], fundingGapInr = 0) {
  const gap = nonNegativeNumber(fundingGapInr);
  if (gap === 0) {
    return { items: [], listedAwardsInr: 0, listedAwardsUsd: 0, remainingGapInr: 0 };
  }

  const opportunityById = Object.fromEntries(opportunities.map(opportunity => [opportunity.id, opportunity]));
  const candidates = recommendations
    .filter(item => {
      const opportunity = opportunityById[item.opportunity_id];
      const daysLeft = opportunity?.days_left ?? item.days_left;
      return nonNegativeNumber(item.amount_inr) > 0 && (daysLeft == null || daysLeft >= 0);
    })
    .sort((left, right) => (
      nonNegativeNumber(right.application_priority_score) - nonNegativeNumber(left.application_priority_score)
      || nonNegativeNumber(left.priority_rank) - nonNegativeNumber(right.priority_rank)
    ));

  const items = [];
  let listedAwardsInr = 0;
  let listedAwardsUsd = 0;

  for (const item of candidates) {
    if (listedAwardsInr >= gap) break;
    const reasons = [`Priority score ${nonNegativeNumber(item.application_priority_score)}/100`];
    if (nonNegativeNumber(item.funding_relevance_score) > 0) reasons.push(`Listed amount: ${nonNegativeNumber(item.funding_relevance_score)}% of gap`);
    if (nonNegativeNumber(item.deadline_urgency_score) >= 75) reasons.push("Approaching deadline");

    items.push({ ...item, bundle_reasons: reasons });
    listedAwardsInr += nonNegativeNumber(item.amount_inr);
    listedAwardsUsd += nonNegativeNumber(item.amount_usd);
  }

  return {
    items,
    listedAwardsInr,
    listedAwardsUsd,
    remainingGapInr: Math.max(0, gap - listedAwardsInr),
  };
}
