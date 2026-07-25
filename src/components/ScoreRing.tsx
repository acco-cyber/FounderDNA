interface ScoreRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}

export function ScoreRing({
  value,
  size = 98,
  stroke = 8,
  label,
  color = "#cbf36c",
}: ScoreRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="score-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="score-ring-copy">
        <strong>{value}</strong>
        {label && <small>{label}</small>}
      </span>
    </div>
  );
}
