import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  Calculator,
  FileSignature,
  MessagesSquare,
  Search,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Link } from "../../lib/router";

const agents = [
  {
    icon: Search,
    name: "Market Research",
    status: "Prototype",
    copy: "Structures assumptions, interview questions, competitors, and evidence requirements.",
  },
  {
    icon: BriefcaseBusiness,
    name: "Business Planning",
    status: "Prototype",
    copy: "Turns verified learning into milestones, economics, risks, and a living operating plan.",
  },
  {
    icon: FileSignature,
    name: "Legal Workflow",
    status: "Roadmap",
    copy: "Prepares checklists and partner handoffs; licensed review and founder signature remain required.",
  },
  {
    icon: ShoppingBag,
    name: "Sales",
    status: "Prototype",
    copy: "Drafts outreach, segments leads, captures replies, and recommends the next human-approved action.",
  },
  {
    icon: Calculator,
    name: "Bookkeeping",
    status: "Roadmap",
    copy: "Organizes transaction evidence and review queues without replacing a qualified professional.",
  },
  {
    icon: MessagesSquare,
    name: "Customer Support",
    status: "Roadmap",
    copy: "Drafts routine responses, detects sentiment, and escalates consequential conversations.",
  },
];

const phases = [
  ["Days 1–7", "Prove the problem", "Interviews, problem signals, willingness to act, and a continue/pivot/stop gate."],
  ["Days 8–30", "Shape the offer", "Concierge pilot, pricing evidence, delivery workflow, and first customer pipeline."],
  ["Days 31–60", "Build the operation", "Repeatable sales, controlled legal handoffs, bookkeeping, and support routines."],
  ["Days 61–90", "Earn graduation", "Verified revenue, customer outcomes, risk review, and the next 90-day plan."],
];

const buildMilestones = [
  {
    phase: "Phase 1 · Live",
    timeline: "Now",
    deliverable:
      "Seven-day Gemini evidence sprint, founder approval checkpoints, run receipts, and proof-led continue/pivot/stop decisions.",
  },
  {
    phase: "Phase 2 · Controlled build",
    timeline: "Pilot month 1",
    deliverable:
      "State-specific document preparation templates and licensed-specialist handoff—never autonomous filing or legal advice.",
  },
  {
    phase: "Phase 3 · Sandboxed integrations",
    timeline: "Pilot months 2–3",
    deliverable:
      "Stripe Atlas and bookkeeping connector prototypes using test accounts, scoped permissions, and human confirmation.",
  },
  {
    phase: "Phase 4 · Coordinated Foundry",
    timeline: "Pilot months 4–6",
    deliverable:
      "Six-workstream orchestration only after audit logs, rollback, escalation, and adverse-event review pass.",
  },
];

export function FoundryVision() {
  return (
    <>
      <section className="public-page-hero foundry-page-hero">
        <span className="public-eyebrow"><Bot size={14} /> The Foundry</span>
        <h1>90 days of guarded AI operations—not another static business plan.</h1>
        <p>
          Agents prepare research and operating work. Founders approve
          consequential actions. The Proof Ledger records inputs, decisions,
          overrides, and real-world outcomes.
        </p>
        <div className="page-hero-actions">
          <Link className="button button-primary button-large" to="/login?next=/app/foundry">
            Open the working sprint <ArrowRight size={17} />
          </Link>
          <Link className="button button-secondary button-large" to="/method">
            Inspect safeguards
          </Link>
        </div>
      </section>

      <section className="truth-banner">
        <ShieldCheck size={21} />
        <div>
          <strong>Build status is part of the interface.</strong>
          <p>
            The seven-day Gemini sprint, human checkpoints, run receipts, and
            Proof Ledger work now. Full 90-day orchestration and regulated
            integrations are an explicitly labeled roadmap.
          </p>
        </div>
      </section>

      <section className="foundry-phase-section">
        <div className="public-section-heading">
          <span className="public-eyebrow">The 90-day operating arc</span>
          <h2>Every phase has an evidence gate.</h2>
        </div>
        <div className="foundry-phase-grid">
          {phases.map(([days, title, text], index) => (
            <article key={days}>
              <span>{days}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="agent-constellation-section">
        <div className="public-section-heading">
          <span className="public-eyebrow">Six coordinated workstreams</span>
          <h2>A mission-control layer around the founder.</h2>
          <p>
            Status labels make the current prototype and future integration
            boundary impossible to confuse.
          </p>
        </div>
        <div className="agent-constellation-grid">
          {agents.map(({ icon: Icon, name, status, copy }, index) => (
            <article key={name}>
              <div>
                <span><Icon size={20} /></span>
                <em className={status === "Prototype" ? "is-live" : ""}>{status}</em>
              </div>
              <small>Agent {String(index + 1).padStart(2, "0")}</small>
              <h3>{name}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="foundry-build-plan-section">
        <div className="public-section-heading">
          <span className="public-eyebrow">Phased delivery plan</span>
          <h2>Every roadmap item has a gate, owner decision, and visible boundary.</h2>
          <p>
            Timelines are pilot sequencing targets—not claims that an
            integration is already available.
          </p>
        </div>
        <div className="foundry-build-plan-grid">
          {buildMilestones.map((milestone) => (
            <article key={milestone.phase}>
              <span>{milestone.phase}</span>
              <strong>{milestone.timeline}</strong>
              <p>{milestone.deliverable}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="approval-lane-section">
        <div>
          <span className="public-eyebrow"><BadgeCheck size={14} /> Control plane</span>
          <h2>AI can prepare. People must authorize.</h2>
        </div>
        <div className="approval-lane">
          <span><Bot size={20} /><strong>Agent proposes</strong><small>Draft + evidence need</small></span>
          <ArrowRight size={18} />
          <span><ShieldCheck size={20} /><strong>Founder decides</strong><small>Approve, edit, or reject</small></span>
          <ArrowRight size={18} />
          <span><BadgeCheck size={20} /><strong>Ledger records</strong><small>Action + outcome receipt</small></span>
        </div>
      </section>

      <section className="public-final-cta">
        <div>
          <span className="public-eyebrow">Working entry point</span>
          <h2>Generate a seven-day sprint and inspect every receipt.</h2>
        </div>
        <Link className="button button-primary button-large" to="/login?next=/app/foundry">
          Enter the Foundry <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
