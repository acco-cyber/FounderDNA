import assert from "node:assert/strict";
import test from "node:test";
import { summarizeEvidence } from "./evidence.mjs";

test("unverified money never counts as business proof", () => {
  const summary = summarizeEvidence(
    [
      {
        type: "revenue",
        amount: 900,
        status: "unverified",
        customerRef: "lead-1",
        createdAt: "2026-07-25T00:00:00.000Z",
      },
      {
        type: "expense",
        amount: 30,
        status: "verified",
        createdAt: "2026-07-24T00:00:00.000Z",
      },
    ],
    [],
  );

  assert.equal(summary.revenue, 0);
  assert.equal(summary.expenses, 30);
  assert.equal(summary.profit, -30);
  assert.equal(summary.payingCustomers, 0);
});
test("verified customers are deduplicated across commitments and payments", () => {
  const summary = summarizeEvidence(
    [
      {
        type: "customer_commitment",
        status: "verified",
        customerRef: "customer-a",
        createdAt: "2026-07-25T00:00:00.000Z",
      },
      {
        type: "revenue",
        amount: 250,
        status: "verified",
        customerRef: "customer-a",
        createdAt: "2026-07-24T00:00:00.000Z",
      },
      {
        type: "revenue",
        amount: 400,
        status: "verified",
        customerRef: "customer-b",
        createdAt: "2026-07-23T00:00:00.000Z",
      },
    ],
    [{ id: "run-1" }],
  );

  assert.equal(summary.revenue, 650);
  assert.equal(summary.payingCustomers, 2);
  assert.equal(summary.commitments, 1);
  assert.equal(summary.agentRuns, 1);
});
