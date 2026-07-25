import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { opportunities, traitMeta } from "../data/mockData";
import {
  getEvidenceSummary,
  type EvidenceSummary,
} from "../lib/api";
import { getRankedTraits, rankedOpportunities } from "../lib/scoring";
import type { FounderProfile } from "../types";
import { OpportunityCard } from "../components/OpportunityCard";
import { FounderDnaIcon } from "../components/FounderDnaIcon";
import { ScoreRing } from "../components/ScoreRing";
import { SectionHeader } from "../components/SectionHeader";
import { TraitBars } from "../components/TraitBars";

interface DashboardProps {
  profile: FounderProfile;
}

export function Dashboard({ profile }: DashboardProps) {
  const [proof, setProof] = useState<EvidenceSummary | null>(null);

  useEffect(() => {
    let active = true;
    void getEvidenceSummary()
      .then((summary) => {
        if (active) setProof(summary);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const rankedTraits = getRankedTraits(profile.scores);
  const topTrait = rankedTraits[0];
  const gapTrait = rankedTraits[rankedTraits.length - 1];
  const matchedOpportunities = rankedOpportunities(profile, opportunities);
  const topOpportunity = matchedOpportunities[0];
  const firstName = profile.name.split(" ")[0] || "Founder";
  const overallScore = Math.round(
    Object.values(profile.scores).reduce((total, score) => total + score, 0) /
      Object.values(profile.scores).length,
  );

  if (!profile.assessmentComplete) {
    return (
      <section className="empty-dashboard">
        <div className="empty-dashboard-art">
          <span className="orb orb-one" />
          <span className="orb orb-two" />
          <FounderDnaIcon className="empty-dashboard-logo" />
        </div>
        <span className="eyebrow">Your starting point</span>
        <h2>Turn your experience into an unfair advantage.</h2>
        <p>
          Complete three short scenario labs. We’ll map how you execute, identify a
          problem hypothesis worth testing, and prepare a seven-day evidence sprint.
        </p>
        <Link className="button button-primary button-large" to="/app/assessment">
          Start my DNA assessment <ArrowRight size={18} />
        </Link>
        <div className="empty-proof">
          <span>
            <Check size={15} /> 3 focused labs
          </span>
          <span>
            <Check size={15} /> 9 scenarios
          </span>
          <span>
            <Check size={15} /> Progress saved
          </span>
        </div>
      </section>
    );
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <span className="live-pill">
            <Sparkles size={14} />
            Your founder signal is getting stronger
          </span>
          <h2>
            {firstName}, you don’t need another idea.
            <br />
            <em>You need the right problem.</em>
          </h2>
          <p>
            Your lived experience and execution style suggest a clear first
            experiment. Market demand still has to be proven with customers.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/app/blueprint">
              Open my blueprint <ArrowRight size={17} />
            </Link>
            <Link className="button button-ghost-light" to="/app/assessment">
              View my DNA
            </Link>
          </div>
        </div>
        <div className="hero-signal">
          <div className="hero-signal-head">
            <span>
              <Target size={16} /> Strongest signal
            </span>
            <small>Based on your 9 scenario responses</small>
          </div>
          <strong>{traitMeta[topTrait].label}</strong>
          <span className="hero-score">{profile.scores[topTrait]}</span>
          <p>{traitMeta[topTrait].description}</p>
          <div className="hero-sparkline" aria-hidden="true">
            {[35, 47, 42, 62, 58, 76, 82, 92].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </section>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-icon stat-icon-lime">
            <Compass size={19} />
          </span>
          <div>
            <small>Profile alignment</small>
            <strong>{topOpportunity.match}%</strong>
            <span>Self-report, not market proof</span>
          </div>
          <ArrowUpRight className="stat-arrow" size={17} />
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-blue">
            <Clock3 size={19} />
          </span>
          <div>
            <small>First experiment</small>
            <strong>7 days</strong>
            <span>Customer evidence sprint</span>
          </div>
          <ArrowUpRight className="stat-arrow" size={17} />
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-orange">
            <CircleDollarSign size={19} />
          </span>
          <div>
            <small>Verified revenue</small>
            <strong>
              {proof
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: proof.currency,
                    maximumFractionDigits: 0,
                  }).format(proof.revenue)
                : "—"}
            </strong>
            <span>Only source-backed records</span>
          </div>
          <ArrowUpRight className="stat-arrow" size={17} />
        </article>
        <article className="stat-card">
          <span className="stat-icon stat-icon-pink">
            <ShieldCheck size={19} />
          </span>
          <div>
            <small>Recorded agent runs</small>
            <strong>{proof?.agentRuns ?? "—"}</strong>
            <span>Founder approval stays required</span>
          </div>
          <ArrowUpRight className="stat-arrow" size={17} />
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="panel dna-panel">
          <SectionHeader
            eyebrow="Your founder profile"
            title="DNA signal map"
            actionLabel="Full analysis"
            actionTo="/app/assessment"
          />
          <div className="dna-panel-content">
            <div className="dna-score-summary">
              <ScoreRing value={overallScore} size={132} stroke={10} label="self-report" />
              <div>
                <span className="classification-label">Builder archetype</span>
                <strong>Grounded Operator</strong>
                <p>Moves quickly because the customer context is already familiar.</p>
              </div>
            </div>
            <TraitBars scores={profile.scores} />
          </div>
          <div className="gap-callout">
            <span>
              <Zap size={17} />
            </span>
            <div>
              <small>Complementary gap</small>
              <strong>{traitMeta[gapTrait].label}</strong>
              <p>Design the first experiment so this weaker signal cannot hide.</p>
            </div>
            <Link to="/app/foundry">
              Build the experiment <ChevronRight size={16} />
            </Link>
          </div>
        </article>

        <article className="panel next-action-panel">
          <div className="next-action-label">
            <span>Next best action</span>
            <small>Suggested</small>
          </div>
          <div className="action-number">01</div>
          <h3>Turn your founder reflection into one customer question.</h3>
          <p>
            Ask three people who experience the problem. Capture their exact language
            and request one concrete next-step commitment.
          </p>
          <div className="action-checklist">
            <span>
              <Check size={14} /> Use the 7-question script
            </span>
            <span>
              <Check size={14} /> Capture exact language
            </span>
            <span>
              <Check size={14} /> Ask for a next-step commitment
            </span>
          </div>
          <Link className="button button-primary button-full" to="/app/foundry">
            Generate my sprint <ArrowRight size={17} />
          </Link>
          <span className="action-estimate">
            <Clock3 size={14} /> About 45 minutes
          </span>
        </article>
      </section>

      <section className="opportunity-preview">
        <SectionHeader
          eyebrow="Starter hypotheses"
          title="Three concepts to challenge—not trust"
          detail="Ranked only by self-assessment alignment. Demand, pricing, capital, and timing remain unverified."
          actionLabel="Open Opportunity Lab"
          actionTo="/app/opportunities"
        />
        <div className="opportunity-card-grid">
          {matchedOpportunities.slice(0, 3).map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              rank={index + 1}
              featured={index === 0}
            />
          ))}
        </div>
      </section>

      <section className="foundry-strip">
        <div className="foundry-strip-icon">
          <Bot size={26} />
        </div>
        <div className="foundry-strip-copy">
          <span>The Foundry is ready</span>
          <strong>Generate one auditable, Gemini-powered field sprint.</strong>
        </div>
        <div className="foundry-activity">
          <span>
            <i className="status-dot complete" /> Hypotheses labeled
          </span>
          <span>
            <i className="status-dot working" /> Evidence captured in your ledger
          </span>
          <span>
            <i className="status-dot approval" /> External actions stay locked
          </span>
        </div>
        <Link className="button button-ghost-light" to="/app/foundry">
          Open mission control <ArrowUpRight size={16} />
        </Link>
      </section>
    </div>
  );
}
