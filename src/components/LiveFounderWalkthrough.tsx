import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Dna,
  Handshake,
  MapPin,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "../lib/router";

const chapters = [
  {
    id: "assess",
    step: "01",
    label: "Assess",
    icon: Dna,
    kicker: "Scenario-based operating profile",
    title: "Surface behavior—not a personality label.",
    body: "Nia’s choices show strong pain-point proximity and resourcefulness. The system also identifies a product-building gap that should not be hidden.",
    signal: "High proximity · strong operations · product gap",
    evidence: "Assessment signal",
  },
  {
    id: "match",
    step: "02",
    label: "Match",
    icon: MapPin,
    kicker: "Founder × local problem",
    title: "Form one falsifiable opportunity thesis.",
    body: "Her shift-management experience is matched to a narrow hypothesis: hourly workers lose reliable childcare coverage when schedules change at short notice.",
    signal: "Test shift-ready childcare coordination",
    evidence: "AI hypothesis",
  },
  {
    id: "validate",
    step: "03",
    label: "Validate",
    icon: MessagesSquare,
    kicker: "Seven-day evidence sprint",
    title: "Ask the market before building the product.",
    body: "The walkthrough records five interviews, three repeated pain signals, and one pilot commitment. In a real workspace, none count until a source is attached and verified.",
    signal: "Continue to a concierge pilot",
    evidence: "Synthetic demo evidence",
  },
  {
    id: "incubate",
    step: "04",
    label: "Incubate",
    icon: Rocket,
    kicker: "90-day guarded operations",
    title: "Turn evidence into an operating company.",
    body: "Foundry agents prepare research, outreach, operating documents, bookkeeping workflows, and support drafts. Nia approves every consequential action.",
    signal: "Founder keeps control at every gate",
    evidence: "Product roadmap",
  },
] as const;

const traits = [
  ["Pain proximity", 88],
  ["Resourcefulness", 82],
  ["Execution", 74],
  ["Network leverage", 48],
];

export function LiveFounderWalkthrough() {
  const [activeId, setActiveId] =
    useState<(typeof chapters)[number]["id"]>("assess");
  const active = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];
  const ActiveIcon = active.icon;

  return (
    <section className="walkthrough-section" id="live-example">
      <div className="walkthrough-heading">
        <div>
          <span className="public-eyebrow">
            <Sparkles size={14} /> Interactive product walkthrough
          </span>
          <h2>See one founder move from uncertainty to a testable company.</h2>
        </div>
        <div className="walkthrough-disclosure">
          <ShieldCheck size={17} />
          <span>
            <strong>Illustrative, not traction</strong>
            Synthetic case data shows the workflow without inventing pilot results.
          </span>
        </div>
      </div>

      <div className="walkthrough-shell">
        <aside className="walkthrough-profile">
          <div className="demo-person">
            <span><UserRound size={23} /></span>
            <div>
              <small>Demo founder</small>
              <strong>Nia Carter</strong>
              <p>Retail operations lead · between roles · Cleveland</p>
            </div>
          </div>
          <div className="demo-context">
            <BriefcaseBusiness size={16} />
            <p>
              11 years coordinating hourly teams, frequent schedule changes, and
              last-minute care disruptions.
            </p>
          </div>
          <div className="demo-traits" aria-label="Illustrative Founder DNA signals">
            {traits.map(([label, value]) => (
              <div key={label}>
                <span><small>{label}</small><em>{value}</em></span>
                <i><b style={{ width: `${value}%` }} /></i>
              </div>
            ))}
          </div>
          <div className="demo-gap">
            <Handshake size={16} />
            <span><small>Complementary gap</small>Product and technical delivery</span>
          </div>
        </aside>

        <div className="walkthrough-workspace">
          <div className="walkthrough-tabs" role="tablist" aria-label="Demo stages">
            {chapters.map((chapter) => {
              const Icon = chapter.icon;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  role="tab"
                  aria-selected={activeId === chapter.id}
                  className={activeId === chapter.id ? "is-active" : ""}
                  onClick={() => setActiveId(chapter.id)}
                >
                  <span>{chapter.step}</span>
                  <Icon size={15} />
                  {chapter.label}
                </button>
              );
            })}
          </div>

          <div className="walkthrough-panel" role="tabpanel" key={active.id}>
            <div className="walkthrough-panel-icon"><ActiveIcon size={23} /></div>
            <span>{active.kicker}</span>
            <h3>{active.title}</h3>
            <p>{active.body}</p>
            <div className="walkthrough-result">
              <CheckCircle2 size={18} />
              <span>
                <small>Output at this stage</small>
                <strong>{active.signal}</strong>
              </span>
              <em>{active.evidence}</em>
            </div>
            <div className="walkthrough-product-link">
              <Link
                to={
                  active.id === "assess"
                    ? "/signup?next=/app/assessment"
                    : active.id === "validate"
                      ? "/login?next=/app/proof"
                      : active.id === "incubate"
                        ? "/login?next=/app/foundry"
                        : "/signup?next=/app/opportunities"
                }
              >
                {active.id === "assess"
                  ? "Try the working assessment"
                  : active.id === "validate"
                    ? "Open the working Proof Ledger"
                    : active.id === "incubate"
                      ? "Open the working sprint"
                      : "Explore opportunity hypotheses"}
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="walkthrough-controls">
              <span>{chapters.findIndex((item) => item.id === active.id) + 1} of {chapters.length}</span>
              {active.id === "incubate" ? (
                <Link to="/foundry" className="public-text-link">
                  Explore the 90-day Foundry <ArrowRight size={15} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const index = chapters.findIndex((item) => item.id === active.id);
                    setActiveId(chapters[index + 1].id);
                  }}
                >
                  Next stage <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="walkthrough-proofline">
        <BadgeCheck size={16} />
        <span>
          In production, source-backed events enter the Proof Ledger; interface
          examples never enter verified totals.
        </span>
      </div>
    </section>
  );
}
