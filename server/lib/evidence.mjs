const totalVerifiedAmount = (evidence, type) =>
  evidence
    .filter((item) => item.type === type && item.status === "verified")
    .reduce((total, item) => total + Number(item.amount ?? 0), 0);

export function summarizeEvidence(evidence, agentRuns) {
  const verified = evidence.filter((item) => item.status === "verified");
  const revenue = totalVerifiedAmount(evidence, "revenue");
  const expenses = totalVerifiedAmount(evidence, "expense");
  const customers = new Set(
    verified
      .filter((item) =>
        ["customer_commitment", "revenue"].includes(item.type),
      )
      .map((item) => item.customerRef)
      .filter(Boolean),
  );

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    payingCustomers: customers.size,
    interviews: evidence.filter((item) => item.type === "customer_interview")
      .length,
    commitments: verified.filter(
      (item) => item.type === "customer_commitment",
    ).length,
    outcomes: verified.filter((item) => item.type === "outcome").length,
    agentRuns: agentRuns.length,
    evidenceEvents: evidence.length,
    lastUpdated: evidence[0]?.createdAt ?? null,
    currency: "USD",
  };
}
