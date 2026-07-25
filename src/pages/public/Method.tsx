import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Check,
  Database,
  FileSearch,
  FlaskConical,
  Scale,
  ShieldCheck,
  X,
} from "lucide-react";
import { Link } from "../../lib/router";

const traits = [
  ["Pain-point proximity", "Direct contact with the problem and its consequences."],
  ["Execution velocity", "Ability to choose and test a reversible next action."],
  ["Resourcefulness", "Progress made with limited time, money, or access."],
  ["Network leverage", "Relevant relationships that can unlock learning."],
  ["Risk calibration", "Matching the size of a bet to the quality of evidence."],
  ["Local market fluency", "Knowledge of how a specific place or industry works."],
];

export function Method() {
  return (
    <>
      <section className="public-page-hero method-hero">
        <span className="public-eyebrow">Method, limitations, and trust</span>
        <h1>Credibility starts with saying what the system does not know.</h1>
        <p>
          Founder DNA is an evidence workflow. The assessment organizes
          self-reported behavior; it does not currently predict who will become a
          successful founder.
        </p>
      </section>

      <section className="method-status-grid">
        <article className="is-live">
          <BadgeCheck size={21} />
          <span>Working now</span>
          <h2>Scenario scoring</h2>
          <p>Deterministic six-trait scoring with visible question logic.</p>
        </article>
        <article className="is-live">
          <BadgeCheck size={21} />
          <span>Working now</span>
          <h2>Gemini field sprints</h2>
          <p>Structured output with explicit evidence and approval gates.</p>
        </article>
        <article className="is-live">
          <BadgeCheck size={21} />
          <span>Working now</span>
          <h2>Verified proof totals</h2>
          <p>Unverified records never inflate revenue or customer counts.</p>
        </article>
        <article className="is-research">
          <FlaskConical size={21} />
          <span>Requires validation</span>
          <h2>Predictive accuracy</h2>
          <p>No success-prediction claim until a real longitudinal study supports it.</p>
        </article>
      </section>

      <section className="method-framework">
        <div className="public-section-heading">
          <span className="public-eyebrow">The six operating signals</span>
          <h2>A practical vocabulary—not a permanent identity.</h2>
          <p>
            Scores help choose experiments and identify gaps. Founders can retake
            the assessment as their context and behavior change.
          </p>
        </div>
        <div className="trait-method-grid">
          {traits.map(([name, description], index) => (
            <article key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{name}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="evidence-standard" id="evidence-standard">
        <div>
          <span className="public-eyebrow">
            <Database size={14} /> Evidence standard
          </span>
          <h2>What counts—and what never does.</h2>
        </div>
        <div className="evidence-comparison">
          <article className="evidence-yes">
            <h3><Check size={17} /> Can count as verified</h3>
            <ul>
              <li>Payment provider event or receipt</li>
              <li>Customer confirmation with a source reference</li>
              <li>Expense record tied to an actual transaction</li>
              <li>Measured outcome with baseline and method</li>
              <li>Recorded Gemini run and founder decision</li>
            </ul>
          </article>
          <article className="evidence-no">
            <h3><X size={17} /> Never treated as proof</h3>
            <ul>
              <li>Model-generated revenue or market estimates</li>
              <li>Founder confidence without customer contact</li>
              <li>Unverified notes or anonymous claims</li>
              <li>Forecasts presented as completed outcomes</li>
              <li>Interface demo data presented as traction</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="method-governance">
        <article>
          <ShieldCheck size={22} />
          <h3>Human authorization</h3>
          <p>Consequential actions remain proposals until a person approves them.</p>
        </article>
        <article>
          <FileSearch size={22} />
          <h3>Traceable output</h3>
          <p>Provider, model, timing, inputs, outputs, and decisions remain inspectable.</p>
        </article>
        <article>
          <Scale size={22} />
          <h3>Calibrated language</h3>
          <p>Self-report, hypothesis, and verified evidence stay visibly separate.</p>
        </article>
        <article>
          <AlertTriangle size={22} />
          <h3>Known limitations</h3>
          <p>AI can be wrong. Local conditions and professional advice still matter.</p>
        </article>
      </section>

      <section className="public-final-cta">
        <div>
          <span className="public-eyebrow">Inspect it yourself</span>
          <h2>Use the workflow, then challenge every assumption.</h2>
        </div>
        <Link className="button button-primary button-large" to="/signup">
          Create a workspace <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
