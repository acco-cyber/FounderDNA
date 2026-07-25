import { FounderDnaIcon } from "./FounderDnaIcon";

interface BrandMarkProps {
  compact?: boolean;
  reversed?: boolean;
  tagline?: boolean;
}

export function BrandMark({
  compact = false,
  reversed = true,
  tagline = false,
}: BrandMarkProps) {
  return (
    <div
      className={`brand-lockup ${compact ? "is-compact" : ""} ${
        reversed ? "is-reversed" : ""
      }`}
    >
      <FounderDnaIcon className="brand-mark" reversed={reversed} />
      {!compact && (
        <div className="brand-copy">
          <span className="brand-wordmark">
            Founder <strong>DNA</strong>
          </span>
          {tagline && (
            <span className="brand-tagline">
              Your potential. Engineered into opportunity.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
