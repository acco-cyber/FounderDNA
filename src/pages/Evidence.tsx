import {
  BadgeDollarSign,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FlaskConical,
  Plus,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEvidence,
  getEvidenceSummary,
  getLedger,
  getSystemHealth,
  type EvidenceSummary,
  type EvidenceType,
  type Ledger,
  type SystemHealth,
} from "../lib/api";

const emptySummary: EvidenceSummary = {
  revenue: 0,
  expenses: 0,
  profit: 0,
  payingCustomers: 0,
  interviews: 0,
  commitments: 0,
  outcomes: 0,
  agentRuns: 0,
  evidenceEvents: 0,
  lastUpdated: null,
  currency: "USD",
};

const evidenceLabels: Record<EvidenceType, string> = {
  customer_interview: "Customer interview",
  customer_commitment: "Customer commitment",
  revenue: "Revenue",
  expense: "Expense",
  marketing: "Marketing evidence",
  outcome: "Customer outcome",
  agent_decision: "Agent decision",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export function Evidence() {
  const [summary, setSummary] = useState(emptySummary);
  const [ledger, setLedger] = useState<Ledger>({ evidence: [], agentRuns: [] });
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "customer_interview" as EvidenceType,
    note: "",
    amount: "",
    customerRef: "",
    status: "unverified" as "unverified" | "verified",
    source: "",
    adminKey: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextLedger, nextHealth] = await Promise.all([
        getEvidenceSummary(),
        getLedger(),
        getSystemHealth(),
      ]);
      setSummary(nextSummary);
      setLedger(nextLedger);
      setHealth(nextHealth);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The proof ledger could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const recordedTypes = useMemo(
    () => new Set(ledger.evidence.map((item) => item.type)),
    [ledger.evidence],
  );

  const saveEvidence = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.note.trim().length < 3) return;
    setSaving(true);
    setError("");
    try {
      await addEvidence(
        {
          type: form.type,
          note: form.note.trim(),
          ...(form.amount ? { amount: Number(form.amount) } : {}),
          ...(form.customerRef.trim()
            ? { customerRef: form.customerRef.trim() }
            : {}),
          ...(form.source.trim() ? { source: form.source.trim() } : {}),
          currency: "USD",
          status: form.status,
        },
        form.adminKey || undefined,
      );
      setForm((current) => ({
        ...current,
        note: "",
        amount: "",
        customerRef: "",
        source: "",
      }));
      setShowForm(false);
      await refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Evidence could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="evidence-page">
      <section className="proof-hero">
        <div>
          <span className="live-pill">
            <ShieldCheck size={14} /> Judge-ready proof room
          </span>
          <h2>
            Claims are cheap.
            <br />
            <em>Evidence compounds.</em>
          </h2>
          <p>
            This ledger reports only recorded events. Unverified notes remain clearly
            labeled and never count toward revenue, customer, or outcome totals.
          </p>
        </div>
        <div className="proof-hero-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "is-spinning" : ""} />
            Refresh
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => setShowForm((current) => !current)}
          >
            <Plus size={16} /> Record evidence
          </button>
        </div>
      </section>

      {error && (
        <div className="inline-notice error" role="alert">
          {error}
        </div>
      )}

      <section className="proof-metric-grid" aria-label="Verified business metrics">
        <article>
          <span><BadgeDollarSign size={19} /></span>
          <small>Verified revenue</small>
          <strong>{money(summary.revenue)}</strong>
          <em>Stripe or verified record</em>
        </article>
        <article>
          <span><ReceiptText size={19} /></span>
          <small>Verified expenses</small>
          <strong>{money(summary.expenses)}</strong>
          <em>Net {money(summary.profit)}</em>
        </article>
        <article>
          <span><Users size={19} /></span>
          <small>Paying customers</small>
          <strong>{summary.payingCustomers}</strong>
          <em>{summary.commitments} verified commitments</em>
        </article>
        <article>
          <span><ClipboardCheck size={19} /></span>
          <small>Customer interviews</small>
          <strong>{summary.interviews}</strong>
          <em>{summary.outcomes} verified outcomes</em>
        </article>
        <article>
          <span><Bot size={19} /></span>
          <small>Recorded agent runs</small>
          <strong>{summary.agentRuns}</strong>
          <em>Auditable outputs</em>
        </article>
      </section>

      {showForm && (
        <form className="evidence-form panel" onSubmit={saveEvidence}>
          <div>
            <span className="eyebrow">New ledger entry</span>
            <h3>Record what actually happened</h3>
            <p>
              Mark an entry verified only when you can support it with a source,
              receipt, payment record, or customer confirmation.
            </p>
          </div>
          <label>
            Evidence type
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as EvidenceType,
                }))
              }
            >
              {Object.entries(evidenceLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="evidence-form-wide">
            What happened?
            <textarea
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
              placeholder="Example: Interviewed a clinic manager; their current handoff takes 40 minutes."
              required
            />
          </label>
          <label>
            Amount (optional)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({ ...current, amount: event.target.value }))
              }
              placeholder="0.00"
            />
          </label>
          <label>
            Customer reference (optional)
            <input
              value={form.customerRef}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  customerRef: event.target.value,
                }))
              }
              placeholder="Anonymized ID or email"
            />
          </label>
          <label>
            Verification
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as "unverified" | "verified",
                }))
              }
            >
              <option value="unverified">Unverified note</option>
              <option value="verified">Verified evidence</option>
            </select>
          </label>
          <label>
            Source reference (recommended)
            <input
              value={form.source}
              onChange={(event) =>
                setForm((current) => ({ ...current, source: event.target.value }))
              }
              placeholder="Receipt, Stripe event, interview note"
            />
          </label>
          <label>
            Verifier key (verified entries only)
            <input
              type="password"
              value={form.adminKey}
              onChange={(event) =>
                setForm((current) => ({ ...current, adminKey: event.target.value }))
              }
              placeholder="Leave blank for unverified notes"
            />
          </label>
          <div className="evidence-form-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Recording…" : "Add to proof ledger"}
            </button>
          </div>
        </form>
      )}

      <section className="proof-main-grid">
        <article className="panel">
          <div className="foundry-section-heading">
            <div>
              <span className="eyebrow">Immutable story</span>
              <h2>Evidence timeline</h2>
            </div>
            <span className="audit-badge">
              <FileCheck2 size={14} /> {summary.evidenceEvents} events
            </span>
          </div>
          {ledger.evidence.length === 0 ? (
            <div className="proof-empty">
              <FlaskConical size={30} />
              <h3>No evidence recorded yet</h3>
              <p>
                That is an honest starting point. Run a founder sprint, speak with real
                customers, then record receipts—not projections.
              </p>
              <button
                className="button button-primary"
                type="button"
                onClick={() => setShowForm(true)}
              >
                Record the first signal
              </button>
            </div>
          ) : (
            <div className="proof-timeline">
              {ledger.evidence.map((item) => (
                <article key={item.id}>
                  <span className={item.status === "verified" ? "verified" : ""}>
                    {item.status === "verified" ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <FlaskConical size={15} />
                    )}
                  </span>
                  <div>
                    <small>{evidenceLabels[item.type]}</small>
                    <strong>{item.note}</strong>
                    <p>
                      {new Date(item.createdAt).toLocaleString()} · {item.status}
                      {item.source ? ` · ${item.source}` : ""}
                    </p>
                  </div>
                  {typeof item.amount === "number" && <b>{money(item.amount)}</b>}
                </article>
              ))}
            </div>
          )}
        </article>

        <aside className="proof-stack">
          <article className="panel proof-system-card">
            <span className="eyebrow">Infrastructure receipt</span>
            <h3>System truth</h3>
            <dl>
              <div>
                <dt>Gemini</dt>
                <dd className={health?.gemini.configured ? "is-good" : ""}>
                  {health?.gemini.configured
                    ? `${health.gemini.provider} · ${health.gemini.model}`
                    : "Not configured"}
                </dd>
              </div>
              <div>
                <dt>Persistence</dt>
                <dd>{health?.persistence ?? "Unavailable"}</dd>
              </div>
              <div>
                <dt>Payments</dt>
                <dd className={health?.payments ? "is-good" : ""}>
                  {health?.payments ? "Stripe connected" : "Not configured"}
                </dd>
              </div>
            </dl>
          </article>
          <article className="panel proof-checklist">
            <span className="eyebrow">Devpost readiness</span>
            <h3>Evidence still needed</h3>
            {[
              ["Real customer interviews", recordedTypes.has("customer_interview")],
              ["Earned revenue", summary.revenue > 0],
              ["Expense trail", recordedTypes.has("expense")],
              ["Measured customer outcome", summary.outcomes > 0],
              ["Live Gemini agent logs", summary.agentRuns > 0],
            ].map(([label, done]) => (
              <span key={String(label)} className={done ? "is-done" : ""}>
                <CheckCircle2 size={15} /> {label}
              </span>
            ))}
          </article>
        </aside>
      </section>
    </div>
  );
}
