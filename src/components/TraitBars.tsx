import { traitMeta } from "../data/mockData";
import { getRankedTraits } from "../lib/scoring";
import type { TraitScores } from "../types";

interface TraitBarsProps {
  scores: TraitScores;
  compact?: boolean;
  limit?: number;
}

export function TraitBars({ scores, compact = false, limit }: TraitBarsProps) {
  const keys = getRankedTraits(scores).slice(0, limit);
  return (
    <div className={`trait-bars ${compact ? "is-compact" : ""}`}>
      {keys.map((key) => (
        <div className="trait-row" key={key}>
          <div className="trait-row-label">
            <span>{traitMeta[key].label}</span>
            <strong>{scores[key]}</strong>
          </div>
          <div className="trait-track">
            <span
              style={{
                width: `${scores[key]}%`,
                backgroundColor: traitMeta[key].color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
