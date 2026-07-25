import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Dna,
  FileCheck2,
  FlaskConical,
  Gauge,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "../../lib/router";

const stages = [
  {
    number: "01",
    icon: Dna,
    label: "Assessment",
    title: "Reveal how you operate under constraint.",
    text: "Nine situational choices map six founder behaviors. They are self-report signals, not a personality label or a success prediction.",
    output: "Operating pattern + critical growth edge",
  },
  {
    number: "02",
    icon: Gauge,
    label: "Opportunity match",
    title: "Connect lived experience to one local problem.",
    text: "Founder DNA narrows the field to a customer, a costly problem, the founder’s proximity, and the evidence needed next.",
    output: "One falsifiable opportunity thesis",
  },
  {
    number: "03",
    icon: Handshake,
    label: "Team brief",
    title: "Turn the founder’s gap into a matching requirement.",
    text: "Complementary capability, commitment, risk expectations, and a working-trial plan define the co-founder search.",
    output: "Consent-based complementary DNA brief",
  },
  {
    number: "04",
    icon: FlaskConical,
    label: "Evidence sprint",
    title: "Generate a seven-day field experiment.",
    text: "Gemini creates daily actions, success signals, and a decision gate. The founder reviews the plan before any real-world action.",
    output: "Structured sprint with human checkpoints",
  },
  {
    number: "05",
    icon: Bot,
    label: "90-day Foundry",
    title: "Support the operation beyond validation.",
    text: "Six guarded workstreams prepare research, planning, legal handoffs, sales, bookkeeping, and support while the founder remains accountable.",
    output: "Human-approved operating mission control",
  },
  {
    number: "06",
    icon: FileCheck2,
    label: "Proof ledger",
    title: "Let recorded outcomes make the call.",
    text: "Interviews, commitments, costs, payments, customer outcomes, agent runs, and overrides form an auditable operating story.",
    output: "Continue, pivot, or stop—with receipts",
  },
];

export function HowItWorks() {
  const { user } = useAuth();
  const startPath = user ? "/app/assessment" : "/signup?next=/app/assessment";

  return (
    <>
      <section className="public-page-hero">
        <span className="public-eyebrow">How Founder DNA works</span>
        <h1>From lived experience to market evidence.</h1>
        <p>
          A connected path from overlooked potential to a company the market has
          actually begun to validate.
        </p>
        <Link className="button button-primary button-large" to={startPath}>
          Begin with your DNA <ArrowRight size={17} />
        </Link>
      </section>

      <section className="process-timeline">
        {stages.map(({ number, icon: Icon, label, title, text, output }) => (
          <article key={number}>
            <div className="process-number">{number}</div>
            <div className="process-icon"><Icon size={23} /></div>
            <div className="process-copy">
              <span>{label}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
            <div className="process-output">
              <CheckCircle2 size={16} />
              <span><small>Output</small>{output}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="human-control-section">
        <div>
          <span className="public-eyebrow">
            <ShieldCheck size={14} /> Human control by design
          </span>
          <h2>The agent can recommend. Only the founder can commit.</h2>
          <p>
            Outreach, spending, legal decisions, customer promises, and evidence
            verification stay behind explicit human checkpoints.
          </p>
        </div>
        <div className="control-grid">
          <article>
            <Bot size={20} />
            <strong>AI proposes</strong>
            <p>Structured research, language, experiments, and decision criteria.</p>
          </article>
          <article>
            <ClipboardList size={20} />
            <strong>Founder approves</strong>
            <p>Real-world actions and assumptions remain visible and editable.</p>
          </article>
          <article>
            <FileCheck2 size={20} />
            <strong>Evidence decides</strong>
            <p>Only recorded, source-backed events count toward verified totals.</p>
          </article>
        </div>
      </section>

      <section className="public-final-cta">
        <div>
          <span className="public-eyebrow">See the complete system</span>
          <h2>Inspect the vision, then test the working product.</h2>
        </div>
        <div className="final-cta-actions">
          <Link className="button button-secondary button-large" to="/foundry">
            Explore the 90-day Foundry
          </Link>
          <Link className="button button-primary button-large" to={startPath}>
            Map my operating pattern <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
