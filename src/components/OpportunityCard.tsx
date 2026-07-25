import { ArrowUpRight, BadgeDollarSign, FlaskConical } from "lucide-react";
import { Link } from "../lib/router";
import type { Opportunity } from "../types";
import { ScoreRing } from "./ScoreRing";

interface OpportunityCardProps {
  opportunity: Opportunity & { match: number };
  rank?: number;
  featured?: boolean;
}

export function OpportunityCard({
  opportunity,
  rank,
  featured = false,
}: OpportunityCardProps) {
  return (
    <article className={`opportunity-card ${featured ? "is-featured" : ""}`}>
      <div className="opportunity-topline">
        <div className="opportunity-rank">
          {rank && <span>0{rank}</span>}
          <div>
            <small>{opportunity.category}</small>
            <span>
              <FlaskConical size={12} /> Illustrative concept
            </span>
          </div>
        </div>
        <ScoreRing value={opportunity.match} size={72} stroke={6} label="trait fit" />
      </div>
      <div className="opportunity-copy">
        <h3>{opportunity.title}</h3>
        <p>{opportunity.thesis}</p>
      </div>
      <div className="tag-list">
        {opportunity.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className="opportunity-meta">
        <span>
          <FlaskConical size={15} />
          <small>Demand</small>
          <strong>Unverified</strong>
        </span>
        <span>
          <BadgeDollarSign size={15} />
          <small>Price</small>
          <strong>Test required</strong>
        </span>
      </div>
      <Link to="/app/blueprint" className="card-action">
        Explore this match <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}
