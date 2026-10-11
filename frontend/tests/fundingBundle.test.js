import assert from "node:assert/strict";
import test from "node:test";

import { buildSuggestedFundingBundle } from "../src/utils/fundingBundle.js";

test("bundle follows priority score, excludes expired items, and stops after nominal coverage", () => {
  const recommendations = [
    { opportunity_id:"lower", amount_inr:50000, amount_usd:600, application_priority_score:80, priority_rank:2, funding_relevance_score:50, deadline_urgency_score:50 },
    { opportunity_id:"expired", amount_inr:100000, amount_usd:1200, application_priority_score:99, priority_rank:1, funding_relevance_score:100, deadline_urgency_score:0 },
    { opportunity_id:"higher", amount_inr:60000, amount_usd:720, application_priority_score:90, priority_rank:1, funding_relevance_score:60, deadline_urgency_score:100 },
    { opportunity_id:"unused", amount_inr:25000, amount_usd:300, application_priority_score:70, priority_rank:3, funding_relevance_score:25, deadline_urgency_score:25 },
  ];
  const opportunities = [
    { id:"lower", days_left:40 },
    { id:"expired", days_left:-1 },
    { id:"higher", days_left:10 },
    { id:"unused", days_left:80 },
  ];

  const bundle = buildSuggestedFundingBundle(recommendations, opportunities, 100000);

  assert.deepEqual(bundle.items.map(item => item.opportunity_id), ["higher", "lower"]);
  assert.equal(bundle.listedAwardsInr, 110000);
  assert.equal(bundle.remainingGapInr, 0);
  assert.deepEqual(bundle.items[0].bundle_reasons, [
    "Priority score 90/100",
    "Listed amount: 60% of gap",
    "Approaching deadline",
  ]);
});

test("bundle is empty when there is no remaining funding gap", () => {
  const bundle = buildSuggestedFundingBundle([
    { opportunity_id:"one", amount_inr:50000, application_priority_score:90 },
  ], [{ id:"one", days_left:5 }], 0);

  assert.deepEqual(bundle.items, []);
  assert.equal(bundle.listedAwardsInr, 0);
  assert.equal(bundle.remainingGapInr, 0);
});
