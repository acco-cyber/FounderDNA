import { ArrowUpRight } from "lucide-react";
import { Link } from "../lib/router";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  detail?: string;
  actionLabel?: string;
  actionTo?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  detail,
  actionLabel,
  actionTo,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {actionLabel && actionTo && (
        <Link className="text-link" to={actionTo}>
          {actionLabel}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}
