import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileCheck2,
  Target,
  UsersRound,
} from "lucide-react";
import { Link } from "../../lib/router";

const measures = [
  ["Activation", "Assessment completion and evidence-sprint start"],
  ["Company progress", "Validated problem, pilot, incorporation, and first revenue"],
  ["Employment", "Founder income plus verified jobs created at 6 and 12 months"],
  ["Durability", "Revenue continuity, customer retention, and founder wellbeing"],
];

export function Impact() {
  return (
    <>
      <section className="public-page-hero impact-page-hero">
        <span className="public-eyebrow">The impact thesis</span>
        <h1>Move people from job-seeking to employer-building.</h1>
        <p>
          Founder DNA tests a different workforce intervention: identify
          entrepreneurial behavior, connect it to a local problem, and support a
          founder until the market—not a model—provides evidence.
        </p>
        <div className="page-hero-actions">
          <Link className="button button-primary button-large" to="/agencies">
            Design a pilot <ArrowRight size={17} />
          </Link>
          <Link className="button button-secondary button-large" to="/judges">
            Review the impact model
          </Link>
        </div>
      </section>

      <section className="impact-thesis-grid">
        <article>
          <span><BriefcaseBusiness size={23} /></span>
          <small>Conventional path</small>
          <h2>Train toward an available job</h2>
          <p>Useful for many people, but bounded by the jobs an economy already has.</p>
        </article>
        <div className="impact-thesis-arrow"><ArrowRight size={22} /></div>
        <article className="is-accent">
          <span><Building2 size={23} /></span>
          <small>Founder DNA path</small>
          <h2>Validate toward a new employer</h2>
          <p>Appropriate only for selected participants—and measured by real company outcomes.</p>
        </article>
      </section>

      <section className="impact-model-section">
        <div className="public-section-heading">
          <span className="public-eyebrow">A multiplier worth testing</span>
          <h2>One supported founder can create more than one livelihood.</h2>
          <p>
            That is the hypothesis, not a current outcome claim. A controlled
            pilot must establish selection quality, cost, company survival, and
            verified job creation before scale.
          </p>
        </div>
        <div className="impact-model-flow">
          <div><UsersRound size={22} /><strong>Candidate cohort</strong><span>Eligible participants</span></div>
          <i />
          <div><Target size={22} /><strong>Founder pathway</strong><span>Evidence-gated support</span></div>
          <i />
          <div><Building2 size={22} /><strong>New companies</strong><span>Verified launches</span></div>
          <i />
          <div><BarChart3 size={22} /><strong>Economic outcomes</strong><span>Revenue and jobs</span></div>
        </div>
      </section>

      <section className="impact-measure-section">
        <div>
          <span className="public-eyebrow"><FileCheck2 size={14} /> Measurement contract</span>
          <h2>Report the whole funnel, including where it fails.</h2>
          <p>
            A credible agency dashboard should show denominators, cohort
            definitions, drop-off, founder overrides, costs, and independently
            verifiable outcomes—not only success stories.
          </p>
        </div>
        <div className="impact-measure-list">
          {measures.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{title}</strong><p>{text}</p></div>
              <CheckCircle2 size={17} />
            </article>
          ))}
        </div>
      </section>

      <section className="public-final-cta">
        <div>
          <span className="public-eyebrow">Test before scale</span>
          <h2>Start with one city, one cohort, and a transparent baseline.</h2>
        </div>
        <Link className="button button-primary button-large" to="/agencies">
          Build a pilot brief <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
