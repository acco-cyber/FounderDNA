import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Compass,
  FlaskConical,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "../lib/router";
import { ScoreRing } from "../components/ScoreRing";
import { opportunities } from "../data/mockData";
import { rankedOpportunities } from "../lib/scoring";
import type { FounderProfile } from "../types";

interface OpportunitiesProps {
  profile: FounderProfile;
}

const filters = ["All hypotheses", "Service-first", "B2B", "Home services", "Marketplace"];

export function Opportunities({ profile }: OpportunitiesProps) {
  const [activeFilter, setActiveFilter] = useState("All hypotheses");
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const matched = useMemo(() => rankedOpportunities(profile, opportunities), [profile]);
  const visible =
    activeFilter === "All hypotheses"
      ? matched
      : matched.filter((opportunity) => opportunity.tags.includes(activeFilter));

  if (!profile.assessmentComplete) {
    return (
      <section className="empty-dashboard">
        <div className="empty-dashboard-art"><Compass size={64} strokeWidth={1.2} /></div>
        <span className="eyebrow">Context before concepts</span>
        <h2>Complete your Founder DNA first.</h2>
        <p>
          Opportunity ideas are useful only when they are tied to your lived
          experience and clearly separated from real market evidence.
        </p>
        <Link className="button button-primary button-large" to="/app/assessment">
          Start the assessment <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  return (
    <div className="opportunity-page">
      <section className="intel-hero hypothesis-hero">
        <div className="intel-hero-copy">
          <span className="live-pill dark">
            <FlaskConical size={13} /> Hypothesis library
          </span>
          <h2>
            Find a sharp question.
            <br />
            <em>Then earn the answer.</em>
          </h2>
          <p>
            These starter concepts are ranked only by alignment with your self-reported
            traits. They are not market recommendations and contain no claimed traction.
          </p>
        </div>
        <div className="market-selector-card">
          <span className="market-selector-icon"><MapPin size={22} /></span>
          <div>
            <small>Founder context</small>
            <strong>{profile.city}, {profile.region}</strong>
            <span>{profile.industry || "Cross-industry exploration"}</span>
          </div>
          <ShieldCheck size={18} />
        </div>
      </section>

      <section className="hypothesis-disclosure">
        <AlertCircle size={18} />
        <div>
          <strong>Concept data is illustrative—not live market intelligence.</strong>
          <p>
            Market size, service-gap, capital, and revenue timing from the original
            prototype have been removed from decision-making. Gemini generates a
            personalized hypothesis in the Foundry; customer evidence belongs in the
            Proof Ledger.
          </p>
        </div>
      </section>

      <section className="opportunity-results">
        <div className="results-toolbar">
          <div>
            <span className="eyebrow">Founder-pattern alignment</span>
            <h2>{visible.length} concepts to investigate</h2>
          </div>
          <div className="filter-bar">
            {filters.map((filter) => (
              <button
                key={filter}
                className={activeFilter === filter ? "is-active" : ""}
                type="button"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {visible.length ? (
          <div className="opportunity-results-grid">
            {visible.map((opportunity) => (
              <article
                className={`opportunity-result ${
                  expandedSignal === opportunity.id ? "is-expanded" : ""
                }`}
                key={opportunity.id}
              >
                <div className="result-rank">
                  0{matched.indexOf(opportunity) + 1}
                </div>
                <div className="result-main">
                  <div className="result-topline">
                    <span>{opportunity.category}</span>
                    <span><MapPin size={12} /> Location to validate</span>
                    {matched.indexOf(opportunity) === 0 && (
                      <span className="best-fit">
                        <Sparkles size={12} /> Closest trait alignment
                      </span>
                    )}
                  </div>
                  <h3>{opportunity.title}</h3>
                  <p>{opportunity.thesis}</p>
                  <div className="result-evidence">
                    <FlaskConical size={15} />
                    <span>
                      <small>Unverified trigger hypothesis</small>
                      {opportunity.signal}
                    </span>
                  </div>
                  {expandedSignal === opportunity.id && (
                    <div className="result-expanded">
                      <span>
                        <Target size={15} />
                        Interview the named customer before designing a product.
                      </span>
                      <span>
                        <CheckCircle2 size={15} />
                        Ask for a deposit or concrete next step—not positive feedback.
                      </span>
                      <span>
                        <ShieldCheck size={15} />
                        Record contradictory evidence and a stop condition.
                      </span>
                    </div>
                  )}
                  <button
                    className="evidence-toggle"
                    type="button"
                    onClick={() =>
                      setExpandedSignal((current) =>
                        current === opportunity.id ? null : opportunity.id,
                      )
                    }
                  >
                    {expandedSignal === opportunity.id
                      ? "Hide validation frame"
                      : "How to validate this"}
                    <ChevronDown size={15} />
                  </button>
                </div>
                <div className="result-metrics hypothesis-metrics">
                  <ScoreRing
                    value={opportunity.match}
                    size={90}
                    stroke={7}
                    label="trait alignment"
                  />
                  <div className="hypothesis-unknowns">
                    <span><small>Demand</small><strong>Unknown</strong></span>
                    <span><small>Willingness to pay</small><strong>Unknown</strong></span>
                    <span><small>Competition</small><strong>Research needed</strong></span>
                  </div>
                  <Link className="button button-primary button-full" to="/app/foundry">
                    Build evidence sprint <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <Search size={32} />
            <h3>No concept in this filter.</h3>
            <p>Broaden the category or let Gemini create a founder-specific hypothesis.</p>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setActiveFilter("All hypotheses")}
            >
              Clear filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
