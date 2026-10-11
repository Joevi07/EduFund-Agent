import assert from "node:assert/strict";
import test from "node:test";

import {
  averageCompletionPercentages,
  documentCompletion,
  hasSourceUrl,
  selectActionCenterTarget,
} from "../src/utils/actionCenter.js";

test("readiness averages exactly four clamped completion percentages", () => {
  assert.equal(averageCompletionPercentages([100, 100, 50, 0]), 63);
  assert.equal(averageCompletionPercentages([150, -20, 50, Number.NaN]), 38);
  assert.throws(() => averageCompletionPercentages([100, 100, 100]), RangeError);
});

test("an unlisted document checklist is unavailable rather than complete", () => {
  assert.deepEqual(documentCompletion([], null), { available: false, percentage: 0 });
  assert.deepEqual(documentCompletion(["Transcript"], { completion_percentage: 120 }), { available: true, percentage: 100 });
});

test("official-source trust signals require an actual HTTP URL", () => {
  assert.equal(hasSourceUrl("https://provider.example/scholarship"), true);
  assert.equal(hasSourceUrl(""), false);
  assert.equal(hasSourceUrl("provider.example"), false);
  assert.equal(hasSourceUrl("javascript:alert(1)"), false);
});

test("an actionable active opportunity sorts ahead of an expired saved application", () => {
  const expired = { id: "expired", days_left: -3 };
  const active = { id: "active", days_left: 7 };
  const target = selectActionCenterTarget(
    [expired, active],
    [
      { opportunity_id: "expired", status: "DRAFTING" },
      { opportunity_id: "active", status: "PLANNED" },
    ],
    [],
  );

  assert.equal(target.id, "active");
});
