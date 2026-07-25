import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Compass,
  Download,
  FlaskConical,
  Lightbulb,
  MapPin,
  Printer,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
} from "lucide-react";
import { Link } from "../lib/router";
import { ScoreRing } from "../components/ScoreRing";
import { traitMeta } from "../data/mockData";
import { getRankedTraits } from "../lib/scoring";
import type { FounderProfile } from "../types";

interface BlueprintProps {
  profile: FounderProfile;
}

const validationRoadmap = [
  {
    day: "Day 1",
    title: "Write the falsifiable claim",
    detail: "Name one customer, one painful moment, and what would prove you wrong.",
    gate: "A stranger can understand the claim in 20 seconds.",
  },
  {
    day: "Days 2–3",
    title: "Run problem interviews",
    detail: "Ask about recent behavior, workarounds, cost, and urgency—without pitching.",
    gate: "Three independent examples of the same costly behavior.",
  },
  {
    day: "Days 4–5",
    title: "Offer a manual paid pilot",
    detail: "Describe the smallest useful outcome and ask for money or a dated commitment.",
    gate: "At least one concrete commitment, or a documented rejection reason.",
  },
  {
    day: "Days 6–7",
    title: "Choose continue, pivot, or stop",
    detail: "Compare recorded evidence with the original claim; preserve contradictions.",
    gate: "A founder-approved decision with a reason and next experiment.",
  },
];

const archetypes = {
  painPointProximity: "Insider Investigator",
  executionVelocity: "Rapid Experimenter",
  resourcefulness: "Constraint Hacker",
  networkLeverage: "Ecosystem Convener",
  riskCalibration: "Deliberate Operator",
  localMarketFluency: "Local Signal Reader",
} as const;

export function Blueprint({ profile }: BlueprintProps) {
  if (!profile.assessmentComplete) {
    return (
      <section className="empty-dashboard">
        <div className="empty-dashboard-art"><Lightbulb size={64} strokeWidth={1.2} /></div>
        <span className="eyebrow">Blueprint input missing</span>
        <h2>Your experience comes before the plan.</h2>
        <p>Complete the assessment to create a transparent founder brief.</p>
        <Link className="button button-primary button-large" to="/app/assessment">
          Map my Founder DNA <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  const rankedTraits = getRankedTraits(profile.scores);
  const topTraits = rankedTraits.slice(0, 3);
  const gap = rankedTraits[rankedTraits.length - 1];
  const overallScore = Math.round(
    Object.values(profile.scores).reduce((sum, value) => sum + value, 0) /
      Object.values(profile.scores).length,
  );

  return (
    <div className="blueprint-page">
      <section className="blueprint-cover">
        <div className="blueprint-cover-copy">
          <span className="blueprint-kicker">
            <Sparkles size={14} /> Founder validation brief · v1
          </span>
          <h2>{archetypes[topTraits[0]]}</h2>
          <p>
            A field-ready operating brief built from your own answers. It describes
            how to test an opportunity; it does not claim that an opportunity is real.
          </p>
          <div className="blueprint-location">
            <span><MapPin size={14} /> {profile.city}, {profile.region}</span>
            <span>7-day validation</span>
            <span>Human-approved decisions</span>
          </div>
          <div className="blueprint-cover-actions no-print">
            <button className="button button-primary" type="button" onClick={() => window.print()}>
              <Download size={17} /> Export brief
            </button>
            <button className="button button-ghost-light" type="button" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>
        <div className="blueprint-seal">
          <ScoreRing value={overallScore} size={134} stroke={10} label="self-report" />
          <span>Assessment signal—not a percentile</span>
        </div>
      </section>

      <div className="blueprint-document">
        <section className="blueprint-disclosure">
          <FlaskConical size={19} />
          <div>
            <strong>This document separates inputs, hypotheses, and evidence.</strong>
            <p>
              Only your answers below are observed inputs. Gemini-created opportunities
              appear in the Foundry. Customer behavior and payments appear in the Proof
              Ledger.
            </p>
          </div>
        </section>

        <section className="blueprint-section blueprint-founder-summary">
          <div className="blueprint-section-index">
            <span>01</span>
            <small>Observed input</small>
          </div>
          <div className="blueprint-section-body">
            <div className="blueprint-section-heading">
              <span className="eyebrow">Founder context</span>
              <h2>Your words are the starting material.</h2>
            </div>
            <div className="founder-summary-grid">
              <div className="founder-thesis">
                <blockquote>“{profile.reflection}”</blockquote>
                <p>
                  This reflection identifies a problem arena worth investigating. It
                  becomes a business opportunity only after people demonstrate urgency
                  and make a meaningful commitment.
                </p>
                <div className="founder-trait-list">
                  {topTraits.map((trait, index) => (
                    <span key={trait}>
                      <i>{index + 1}</i>
                      <strong>{traitMeta[trait].label}</strong>
                      <small>{profile.scores[trait]}/100</small>
                    </span>
                  ))}
                </div>
              </div>
              <div className="complement-card">
                <span className="complement-icon"><Compass size={22} /></span>
                <small>Experiment constraint</small>
                <h3>{traitMeta[gap].label}</h3>
                <p>
                  Your first test should expose this lower self-reported signal instead
                  of designing around it.
                </p>
                <Link to="/app/foundry">
                  Generate that test <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="blueprint-section">
          <div className="blueprint-section-index">
            <span>02</span>
            <small>Unknowns</small>
          </div>
          <div className="blueprint-section-body">
            <div className="blueprint-section-heading split">
              <div>
                <span className="eyebrow">Opportunity frame</span>
                <h2>Three blanks the market must fill.</h2>
              </div>
              <span className="confidence-badge">
                <AlertTriangle size={15} /> Unverified
              </span>
            </div>
            <div className="opportunity-thesis-grid">
              <article>
                <span className="blueprint-mini-icon"><Target size={19} /></span>
                <small>Specific customer</small>
                <strong>To be discovered</strong>
                <p>Who experiences the problem frequently and can authorize a purchase?</p>
              </article>
              <article>
                <span className="blueprint-mini-icon"><Lightbulb size={19} /></span>
                <small>Expensive moment</small>
                <strong>To be observed</strong>
                <p>What do they do now, and what does delay or failure cost them?</p>
              </article>
              <article>
                <span className="blueprint-mini-icon"><CheckCircle2 size={19} /></span>
                <small>Commitment</small>
                <strong>To be earned</strong>
                <p>A payment, deposit, introduction, data access, or scheduled pilot.</p>
              </article>
            </div>
            <div className="market-proof-bar">
              <div><span>?</span><small>Demand</small></div>
              <div><span>$0</span><small>Verified revenue</small></div>
              <div><span>0</span><small>Paying customers</small></div>
              <div><span>Open</span><small>Decision state</small></div>
            </div>
          </div>
        </section>

        <section className="blueprint-section blueprint-roadmap-section">
          <div className="blueprint-section-index">
            <span>03</span>
            <small>Field plan</small>
          </div>
          <div className="blueprint-section-body">
            <div className="blueprint-section-heading split">
              <div>
                <span className="eyebrow">Evidence roadmap</span>
                <h2>Seven days. Four falsifiable gates.</h2>
              </div>
              <span className="roadmap-start">
                <CalendarDays size={15} /> Starts when you approve
              </span>
            </div>
            <div className="roadmap-list">
              {validationRoadmap.map((item, index) => (
                <article key={item.day}>
                  <div className="roadmap-node"><span>{index + 1}</span></div>
                  <div className="roadmap-copy">
                    <span>{item.day}</span>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <div className="roadmap-actions">
                    <span><Check size={14} /> Save notes or artifacts</span>
                    <span><Check size={14} /> Record contradictions</span>
                  </div>
                  <div className="roadmap-gate">
                    <small>Evidence gate</small>
                    <strong>{item.gate}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="blueprint-section">
          <div className="blueprint-section-index">
            <span>04</span>
            <small>Guardrails</small>
          </div>
          <div className="blueprint-section-body">
            <div className="blueprint-section-heading">
              <span className="eyebrow">Founder control</span>
              <h2>AI can prepare work. You authorize consequences.</h2>
            </div>
            <div className="canvas-grid guardrail-grid">
              <article><ShieldCheck size={19} /><h3>No invented proof</h3><p>Unsupported facts remain hypotheses.</p></article>
              <article><UserCheck size={19} /><h3>Approval before outreach</h3><p>No customer contact is sent automatically.</p></article>
              <article><UserCheck size={19} /><h3>Approval before spend</h3><p>No purchase or ad campaign runs automatically.</p></article>
              <article><FlaskConical size={19} /><h3>Stop conditions matter</h3><p>Contradictory evidence can end the sprint.</p></article>
            </div>
          </div>
        </section>

        <section className="blueprint-launch-card no-print">
          <div className="blueprint-launch-icon"><Rocket size={28} /></div>
          <div>
            <span className="eyebrow">Next best action</span>
            <h2>Let Gemini turn this brief into one live experiment.</h2>
            <p>
              The generated output is logged with model, timestamp, evidence
              requirements, and human checkpoints.
            </p>
          </div>
          <Link className="button button-primary button-large" to="/app/foundry">
            Open the Foundry <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}
