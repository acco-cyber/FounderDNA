import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  Check,
  CircleDot,
  Code2,
  Database,
  Dna,
  FileCheck2,
  FlaskConical,
  Network,
  Printer,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "../../lib/router";

const working = [
  "Scenario-based six-signal assessment with transparent scoring",
  "Founder context, opportunity hypotheses, and validation blueprint",
  "Gemini-generated seven-day sprint with human approval gates",
  "User-scoped authentication, profile sync, and evidence storage",
  "Proof Ledger with verified-only totals and model-run receipts",
  "Co-founder onboarding, discovery, comparison, chat, and scheduling interface",
  "Responsive web, dark mode, PWA, and Android debug build",
];

const validateNext = [
  "Assessment validity against a longitudinal founder cohort",
  "Real local-economic data connectors and opportunity ground truth",
  "Real participant network, identity providers, and two-week trial workflow",
  "Regulated legal, accounting, banking, and support integrations",
  "Agency pilot economics and verified 6/12-month job outcomes",
  "Named founder, advisors, and pilot partners for submission",
];

const architecture = [
  { icon: Dna, label: "Founder context", detail: "Scenarios + lived experience" },
  { icon: Bot, label: "Gemini synthesis", detail: "Structured, schema-checked output" },
  { icon: ShieldCheck, label: "Human gate", detail: "Approve, edit, or reject" },
  { icon: Database, label: "Proof Ledger", detail: "Receipts + verified outcomes" },
];

export function Judges() {
  return (
    <div className="judge-page">
      <section className="public-page-hero judge-page-hero">
        <span className="public-eyebrow"><BadgeCheck size={14} /> Reviewer brief</span>
        <h1>Founder DNA turns overlooked potential into evidence-backed employers.</h1>
        <p>
          This page separates the working prototype, the system vision, and the
          validation still required—so ambition never depends on fabricated proof.
        </p>
        <div className="page-hero-actions">
          <Link className="button button-primary button-large" to="/login?next=/app">
            Open reviewer workspace <ArrowRight size={17} />
          </Link>
          <button className="button button-secondary button-large judge-print" type="button" onClick={() => window.print()}>
            <Printer size={16} /> Print / save PDF
          </button>
        </div>
        <div className="judge-review-note">
          <span>Fast review path</span>
          Live example → working workspace → Proof Ledger → method boundaries
        </div>
      </section>

      <section className="judge-thesis">
        <div className="judge-thesis-statement">
          <span>Problem</span>
          <h2>Workforce systems primarily optimize people for existing jobs.</h2>
        </div>
        <ArrowRight size={21} />
        <div className="judge-thesis-statement">
          <span>Insight</span>
          <h2>Some participants hold founder-relevant experience that is never tested.</h2>
        </div>
        <ArrowRight size={21} />
        <div className="judge-thesis-statement is-accent">
          <span>System</span>
          <h2>Assess, match, pair, incubate, and verify new employers.</h2>
        </div>
      </section>

      <section className="judge-status-section">
        <div className="judge-status-card is-working">
          <div><BadgeCheck size={22} /><span>Working in this build</span></div>
          <ul>{working.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
        </div>
        <div className="judge-status-card">
          <div><FlaskConical size={22} /><span>Must be validated next</span></div>
          <ul>{validateNext.map((item) => <li key={item}><CircleDot size={14} />{item}</li>)}</ul>
        </div>
      </section>

      <section className="judge-architecture">
        <div className="public-section-heading">
          <span className="public-eyebrow"><Code2 size={14} /> Technical architecture</span>
          <h2>A guarded loop, not an autonomous black box.</h2>
        </div>
        <div className="architecture-flow">
          {architecture.map(({ icon: Icon, label, detail }, index) => (
            <div key={label}>
              <article><span><Icon size={20} /></span><strong>{label}</strong><small>{detail}</small></article>
              {index < architecture.length - 1 && <ArrowRight size={18} />}
            </div>
          ))}
        </div>
        <div className="architecture-stack">
          <span>React + TypeScript</span><i />
          <span>Node API</span><i />
          <span>Supabase identity</span><i />
          <span>Postgres + RLS</span><i />
          <span>Vertex AI / Gemini</span><i />
          <span>Cloud Run</span>
        </div>
      </section>

      <section className="judge-model-grid">
        <article>
          <UsersRound size={22} />
          <span>User value</span>
          <h3>Founder pathway</h3>
          <p>Free assessment, validation workflow, and optional guided incubation.</p>
        </article>
        <article>
          <Building2 size={22} />
          <span>Buyer hypothesis</span>
          <h3>Workforce licensing</h3>
          <p>Cohort pilots, regional subscriptions, and verified outcome reporting—pricing still to validate.</p>
        </article>
        <article>
          <Network size={22} />
          <span>Defensibility</span>
          <h3>Evidence + network loop</h3>
          <p>Consent-based founder outcomes can improve matching only after representative data exists.</p>
        </article>
        <article>
          <FileCheck2 size={22} />
          <span>Accountability</span>
          <h3>Claims stay inspectable</h3>
          <p>Self-report, AI hypothesis, target, roadmap, and verified evidence use different labels.</p>
        </article>
      </section>

      <section className="judge-team-section">
        <div>
          <span className="public-eyebrow">Team transparency</span>
          <h2>Current build: independent product prototype.</h2>
          <p>
            No team biography, advisor, or pilot partner has been invented for
            presentation. Before submission, the named builder story and any
            confirmed collaborators should be added here with verifiable roles.
          </p>
        </div>
        <div className="team-needs">
          <strong>Next credibility layer</strong>
          <span><UsersRound size={17} /> Workforce pilot partner</span>
          <span><FlaskConical size={17} /> Evaluation / labor economist</span>
          <span><ShieldCheck size={17} /> Privacy and regulated-workflow counsel</span>
        </div>
      </section>

      <section className="judge-demo-routes">
        <div className="public-section-heading">
          <span className="public-eyebrow">Inspect the build</span>
          <h2>Four routes tell the complete product story.</h2>
        </div>
        <div>
          <Link to="/#live-example"><span>01</span><strong>Interactive walkthrough</strong><ArrowRight size={16} /></Link>
          <Link to="/foundry"><span>02</span><strong>90-day Foundry vision</strong><ArrowRight size={16} /></Link>
          <Link to="/method#evidence-standard"><span>03</span><strong>Method and evidence standard</strong><ArrowRight size={16} /></Link>
          <Link to="/login?next=/app/proof"><span>04</span><strong>Working Proof Ledger</strong><ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="judge-final-note">
        <ShieldCheck size={25} />
        <div>
          <span className="public-eyebrow">The honest claim</span>
          <h2>The prototype proves the workflow—not yet the economic outcome.</h2>
          <p>
            The next milestone is a controlled cohort with a preregistered
            baseline, real partner, independent follow-up, and verified company
            results.
          </p>
        </div>
        <Link className="button button-primary" to="/login?next=/app">
          Test the prototype <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
