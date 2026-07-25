import { useId } from "react";

interface FounderDnaIconProps {
  className?: string;
  reversed?: boolean;
  animated?: boolean;
  title?: string;
}

export function FounderDnaIcon({
  className = "",
  reversed = false,
  animated = false,
  title = "Founder DNA",
}: FounderDnaIconProps) {
  const id = useId().replace(/:/g, "");
  const navy = reversed ? "#F7F5F0" : "#1A1F3C";

  return (
    <svg
      className={`founder-dna-icon ${animated ? "is-animated" : ""} ${className}`}
      viewBox="0 0 120 160"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-teal`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={reversed ? "#F7F5F0" : "#087E84"} />
          <stop offset=".55" stopColor="#00C9A7" />
          <stop offset="1" stopColor="#19DCC0" />
        </linearGradient>
        <linearGradient id={`${id}-navy`} x1=".1" y1="1" x2=".85" y2="0">
          <stop offset="0" stopColor={navy} />
          <stop offset=".58" stopColor={navy} />
          <stop offset="1" stopColor="#087E84" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path
          className="logo-strand logo-strand-navy"
          d="M34 145C25 124 30 109 54 94c22-14 31-29 25-45-4-11-14-18-27-20"
          stroke={`url(#${id}-navy)`}
          strokeWidth="10"
        />
        <path
          className="logo-strand logo-strand-teal"
          d="M77 145c8-20 2-36-23-51C31 80 25 65 33 48c5-11 14-18 28-21"
          stroke={`url(#${id}-teal)`}
          strokeWidth="10"
        />
        <path
          className="logo-arrow-path"
          d="M51 28c17-1 30 5 37 17"
          stroke={`url(#${id}-teal)`}
          strokeWidth="8"
        />
        <path
          className="logo-arrow-head"
          d="M87 45l17-5-6 17"
          stroke="#00C9A7"
          strokeWidth="8"
        />
        <g className="logo-rungs" strokeWidth="4">
          <path d="M34 119h43" stroke={navy} />
          <path d="M31 101h49" stroke="#00AFA1" />
          <path d="M36 82h43" stroke={navy} />
          <path d="M37 63h39" stroke="#00AFA1" />
          <path d="M43 45h33" stroke={navy} />
        </g>
        <g className="logo-spark-rays" stroke="#FF6B6B" strokeWidth="3.5">
          <path d="M76 3v9M76 28v9M59 20h9M84 20h9" />
          <path d="M66 10l5 5M81 25l5 5M86 10l-5 5M71 25l-5 5" />
        </g>
        <path
          className="logo-spark-core"
          d="M76 13l2.6 4.4L83 20l-4.4 2.6L76 27l-2.6-4.4L69 20l4.4-2.6z"
          fill="#FF6B6B"
          stroke="none"
        />
      </g>
    </svg>
  );
}
