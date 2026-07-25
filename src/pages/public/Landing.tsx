import {
  ArrowRight,
  Bot,
  Building2,
  Check,
  Dna,
  FileCheck2,
  Handshake,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { FounderDnaIcon } from "../../components/FounderDnaIcon";
import { LiveFounderWalkthrough } from "../../components/LiveFounderWalkthrough";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "../../lib/router";

const system = [
  {
    icon: Dna,
    number: "01",
    title: "Assess",
    text: "Scenario choices surface how someone operates under constraint without pretending to predict success.",
  },
  {
    icon: Network,
    number: "02",
    title: "Match",
    text: "Founder context meets a narrow local problem and a clear set of assumptions to test.",
  },
  {
    icon: Handshake,
    number: "03",
    title: "Pair",
    text: "Complementary gaps become a co-founder brief, with mutual consent before identity is shared.",
  },
  {
    icon: Bot,
    number: "04",
    title: "Incubate",
    text: "Six guarded AI workstreams help operate the first 90 days while the founder remains accountable.",
  },
  {
    icon: FileCheck2,
    number: "05",
    title: "Verify",
    text: "Receipts, customer signals, decisions, and model runs form an auditable proof trail.",
  },
];

const agents = [
  ["Research", "Find the assumptions worth testing"],
  ["Business", "Turn evidence into an operating plan"],
  ["Legal", "Prepare—not file—reviewable workflows"],
  ["Sales", "Draft outreach and organize replies"],
  ["Books", "Classify transactions for human review"],
  ["Support", "Draft responses and flag escalation"],
];

export function Landing() {
  const { user } = useAuth();
  const startPath = user ? "/app/assessment" : "/signup?next=/app/assessment";

  return (
    <>
      <section className="landing-hero impact-hero">
        <div className="landing-hero-copy">
          <span className="public-eyebrow">
            <Sparkles size={14} /> Founder creation infrastructure
          </span>
          <h1>
            The unemployment dataset no one is mining:
            <br />
            <span>latent founders.</span>
          </h1>
          <p className="impact-emotional-hook">
            What if the next great local employer is currently standing in an
            unemployment line?
          </p>
          <p>
            Founder DNA helps people turn lived experience into evidence-backed
            companies—then supports the first 90 days with human-approved AI.
            The goal is not another job recommendation. It is a path from
            overlooked potential to new employers.
          </p>
          <div className="landing-hero-actions">
            <a className="button button-primary button-large" href="#live-example">
              Explore the live walkthrough <ArrowRight size={17} />
            </a>
            <Link className="button button-secondary button-large" to="/judges">
              Review the system
            </Link>
          </div>
          <div className="landing-trust-row">
            <span><Check size={14} /> Working prototype</span>
            <span><Check size={14} /> No fabricated traction</span>
            <span><Check size={14} /> Human approval by design</span>
          </div>
        </div>

        <div className="impact-orbit-card" aria-label="Founder creation system">
          <div className="impact-orbit-rings" aria-hidden="true" />
          <div className="impact-orbit-logo"><FounderDnaIcon reversed /></div>
          <div className="impact-path-step step-potential">
            <span><UsersRound size={18} /></span>
            <div><small>01 · Identify</small><strong>Overlooked potential</strong></div>
          </div>
          <div className="impact-path-step step-evidence">
            <span><FileCheck2 size={18} /></span>
            <div><small>02 · Prove</small><strong>Customer evidence</strong></div>
          </div>
          <div className="impact-path-step step-company">
            <span><Building2 size={18} /></span>
            <div><small>03 · Build</small><strong>A new employer</strong></div>
          </div>
          <div className="impact-card-caption">
            <ShieldCheck size={16} />
            <span><strong>Ambitious outcome. Calibrated claims.</strong>Every step stays labeled as signal, hypothesis, evidence, or roadmap.</span>
          </div>
        </div>
      </section>

      <section className="capability-strip" aria-label="Prototype capabilities">
        <span>Prototype demonstrates</span>
        <strong>6 founder signals</strong>
        <i />
        <strong>1 focused hypothesis</strong>
        <i />
        <strong>7-day evidence sprint</strong>
        <i />
        <strong>6 guarded agent roles</strong>
      </section>

      <section className="evidence-baseline-section">
        <div>
          <span className="public-eyebrow">
            <FileCheck2 size={14} /> Current verified baseline
          </span>
          <h2>Start at zero. Earn every outcome.</h2>
          <p>
            The product is working; field impact is not yet proven. These
            numbers stay at zero until source-backed pilot evidence exists.
          </p>
        </div>
        <div className="evidence-baseline-grid">
          <article><strong>0</strong><span>verified pilot participants</span></article>
          <article><strong>$0</strong><span>verified customer revenue</span></article>
          <article><strong>0</strong><span>verified jobs attributed</span></article>
          <article className="is-next"><strong>10</strong><span>founders in the next validation cohort</span></article>
        </div>
        <small>
          Next evidence gate: a consented 10-person cohort with a predeclared
          baseline, costs, drop-off, adverse outcomes, and six-month follow-up.
        </small>
      </section>

      <LiveFounderWalkthrough />

      <section className="system-section">
        <div className="public-section-heading">
          <span className="public-eyebrow">One connected system</span>
          <h2>Identify. Match. Pair. Incubate. Verify.</h2>
          <p>
            Evidence-first remains the operating method. Employer creation is
            the reason the method matters.
          </p>
        </div>
        <div className="system-grid">
          {system.map(({ icon: Icon, number, title, text }) => (
            <article key={number}>
              <div><span>{number}</span><Icon size={20} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="foundry-preview-section">
        <div className="foundry-preview-copy">
          <span className="public-eyebrow">
            <Bot size={14} /> The Foundry · 90-day operations
          </span>
          <h2>Do not hand a founder a PDF and walk away.</h2>
          <p>
            The full vision is a guarded operating layer: AI prepares the work,
            the founder authorizes the decision, and the Proof Ledger records
            what actually happened.
          </p>
          <div className="foundry-status-note">
            <span>Working now</span>
            Seven-day Gemini sprint and auditable run receipts
          </div>
          <div className="foundry-status-note is-roadmap">
            <span>Pilot month 1</span>
            Reviewed legal-document preparation and specialist handoff
          </div>
          <div className="foundry-status-note is-roadmap">
            <span>Months 2–3</span>
            Stripe Atlas and bookkeeping sandbox connectors
          </div>
          <div className="foundry-status-note is-roadmap">
            <span>Months 4–6</span>
            Six-agent coordination after safety and audit gates
          </div>
          <Link className="button button-secondary" to="/foundry">
            Explore the Foundry <ArrowRight size={16} />
          </Link>
        </div>
        <div className="agent-mini-grid">
          {agents.map(([name, task], index) => (
            <article key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Bot size={17} />
              <strong>{name}</strong>
              <p>{task}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="matching-preview-section">
        <div>
          <span className="public-eyebrow">
            <Handshake size={14} /> Complementary DNA matching
          </span>
          <h2>A founder’s gap can become a team’s advantage.</h2>
          <p>
            Founder DNA turns missing capability into a specific matching brief:
            complementary skill, aligned commitment, compatible risk, and a
            two-week working trial before any co-founder promise.
          </p>
          <Link className="public-text-link" to="/matching">
            See the matching prototype <ArrowRight size={15} />
          </Link>
        </div>
        <div className="matching-mini-visual" aria-label="Complementary founder example">
          <article>
            <span>NC</span>
            <div><small>Nia Carter · illustrative</small><strong>Operations + market fluency</strong></div>
          </article>
          <div><Handshake size={22} /><span>Complementary</span></div>
          <article>
            <span>AO</span>
            <div><small>Amara Okafor · illustrative</small><strong>Product + technical delivery</strong></div>
          </article>
        </div>
      </section>

      <section className="agency-home-cta">
        <div className="agency-home-icon"><Building2 size={27} /></div>
        <div>
          <span className="public-eyebrow">For workforce systems</span>
          <h2>Build the capacity to create employers—not only place workers.</h2>
          <p>
            Design a controlled founder pilot with explicit cohort criteria,
            safeguards, reporting metrics, and outcome verification.
          </p>
        </div>
        <Link className="button button-primary" to="/agencies">
          Plan an agency pilot <ArrowRight size={16} />
        </Link>
      </section>

      <section className="landing-integrity">
        <div className="integrity-orbit" aria-hidden="true">
          <FounderDnaIcon reversed />
        </div>
        <div>
          <span className="public-eyebrow">The integrity advantage</span>
          <h2>A big vision that reviewers can still audit.</h2>
          <p>
            Working features, synthetic walkthroughs, pilot targets, and future
            integrations remain visibly separate. Reviewers can trace every
            important claim to its source and status.
          </p>
        </div>
        <ul>
          <li><ShieldCheck size={17} /> Human authorization before action</li>
          <li><FileCheck2 size={17} /> Verified-only business totals</li>
          <li><Dna size={17} /> Assessment signals, never destiny</li>
        </ul>
      </section>

      <section className="why-founder-dna-section">
        <span><UsersRound size={25} /></span>
        <div>
          <small>Why this exists</small>
          <h2>Workforce systems measure placement. Founder DNA asks who could create the next placement.</h2>
          <p>
            This independent prototype turns that question into a testable,
            auditable pathway. No builder biography, institutional partner, or
            pilot result is implied; those credibility claims will be added
            only with names, consent, and evidence.
          </p>
        </div>
        <Link className="public-text-link" to="/judges">
          Inspect builder and pilot gaps <ArrowRight size={15} />
        </Link>
      </section>

      <section className="public-final-cta">
        <div>
          <span className="public-eyebrow">Choose your path</span>
          <h2>Experience the product—or inspect every assumption.</h2>
        </div>
        <div className="final-cta-actions">
          <Link className="button button-secondary button-large" to="/judges">
            Open reviewer brief
          </Link>
          <Link className="button button-primary button-large" to={startPath}>
            Map my Founder DNA <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
