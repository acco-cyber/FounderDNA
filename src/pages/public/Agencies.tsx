import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileCheck2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "../../lib/router";

const reportMetrics = [
  "Eligible, enrolled, activated, and completed participants",
  "Validated problems, pilots launched, and companies incorporated",
  "Verified revenue, founder income, and jobs created over time",
  "Program cost, founder overrides, drop-off, and adverse outcomes",
];

export function Agencies() {
  const [agency, setAgency] = useState("");
  const [region, setRegion] = useState("");
  const [cohort, setCohort] = useState("20");
  const [focus, setFocus] = useState("Unemployed and underemployed residents");
  const [prepared, setPrepared] = useState(false);
  const [copied, setCopied] = useState(false);

  const brief = useMemo(
    () =>
      `FOUNDER DNA — DISCOVERY PILOT BRIEF

Agency: ${agency || "To be confirmed"}
Region: ${region || "To be confirmed"}
Discovery cohort: ${cohort} participants
Priority population: ${focus}
Proposed duration: 90 days

Purpose
Test whether an evidence-gated founder pathway can complement existing workforce services.

Working flow
1. Eligibility and informed consent
2. Scenario-based founder assessment
3. Local problem and opportunity hypothesis
4. Seven-day evidence sprint
5. Guarded 90-day incubation for qualified participants
6. Six- and twelve-month outcome follow-up

Required reporting
- Full participant funnel and cohort definition
- Verified pilots, companies, revenue, and jobs
- Program cost, drop-off, overrides, and adverse outcomes
- Comparison baseline agreed before launch

Important
This is a planning artifact, not a contract or ROI claim. Targets, safeguards,
procurement, accessibility, privacy, and evaluation design require agency review.`,
    [agency, region, cohort, focus],
  );

  const prepareBrief = (event: FormEvent) => {
    event.preventDefault();
    setPrepared(true);
  };

  const copyBrief = async () => {
    await navigator.clipboard.writeText(brief);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadBrief = () => {
    const url = URL.createObjectURL(new Blob([brief], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "founder-dna-pilot-brief.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className="public-page-hero agency-page-hero">
        <span className="public-eyebrow"><Building2 size={14} /> For workforce agencies</span>
        <h1>Complement job placement with an evidence-gated founder pathway.</h1>
        <p>
          Identify participants with founder-relevant operating patterns, test
          local problems before spending heavily, and report company outcomes
          with an auditable trail.
        </p>
        <div className="page-hero-actions">
          <a className="button button-primary button-large" href="#pilot-planner">
            Build a pilot brief <ArrowRight size={17} />
          </a>
          <a
            className="button button-secondary button-large"
            href="/Founder-DNA-Agency-Pilot-Blueprint.pdf"
            download
          >
            <Download size={17} /> Download pilot framework
          </a>
        </div>
      </section>

      <section className="agency-value-grid">
        <article><UsersRound size={22} /><span>01</span><h2>Find a different pathway</h2><p>Offer entrepreneurship selectively—not as a universal answer to unemployment.</p></article>
        <article><MapPin size={22} /><span>02</span><h2>Start with local demand</h2><p>Connect participant experience to narrow regional problems and verify them in the field.</p></article>
        <article><FileCheck2 size={22} /><span>03</span><h2>Audit the full outcome</h2><p>Track denominators, costs, decisions, revenue, jobs, failures, and follow-up.</p></article>
      </section>

      <section className="agency-reporting-section">
        <div>
          <span className="public-eyebrow"><BarChart3 size={14} /> Public-sector reporting</span>
          <h2>Replace a polished success story with a measurable cohort.</h2>
          <p>
            Founder DNA is designed around an evidence ledger so program teams
            can inspect who entered, what support occurred, and what the market
            actually validated.
          </p>
        </div>
        <div className="agency-metric-list">
          {reportMetrics.map((metric) => (
            <span key={metric}><CheckCircle2 size={17} />{metric}</span>
          ))}
        </div>
      </section>

      <section className="pilot-planner-section" id="pilot-planner">
        <div className="pilot-planner-copy">
          <span className="public-eyebrow"><ClipboardCheck size={14} /> Browser-only pilot planner</span>
          <h2>Turn a first conversation into a concrete discovery brief.</h2>
          <p>
            This planner does not submit or store contact information. It creates
            a portable starting document for procurement, privacy, evaluation,
            and program-design conversations.
          </p>
          <div className="planner-privacy"><LockKeyhole size={17} /><span>Inputs remain on this device.</span></div>
          <a
            className="public-text-link"
            href="/Founder-DNA-Agency-Pilot-Blueprint.pdf"
            download
          >
            Download the complete PDF framework <Download size={14} />
          </a>
        </div>

        <form className="pilot-planner-form" onSubmit={prepareBrief}>
          <label>
            <span>Agency or organization</span>
            <input value={agency} onChange={(event) => setAgency(event.target.value)} placeholder="Example Workforce Partnership" />
          </label>
          <label>
            <span>City or region</span>
            <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="City, state, or service area" />
          </label>
          <div className="planner-form-row">
            <label>
              <span>Discovery cohort</span>
              <select value={cohort} onChange={(event) => setCohort(event.target.value)}>
                <option value="10">10 participants</option>
                <option value="20">20 participants</option>
                <option value="30">30 participants</option>
                <option value="50">50 participants</option>
              </select>
            </label>
            <label>
              <span>Priority population</span>
              <select value={focus} onChange={(event) => setFocus(event.target.value)}>
                <option>Unemployed and underemployed residents</option>
                <option>Displaced workers</option>
                <option>Returning citizens</option>
                <option>Community-college participants</option>
              </select>
            </label>
          </div>
          <button className="button button-primary" type="submit">
            Prepare discovery brief <ArrowRight size={16} />
          </button>
        </form>

        {prepared && (
          <div className="prepared-brief" aria-live="polite">
            <div>
              <span><CheckCircle2 size={19} /></span>
              <div><strong>Discovery brief prepared</strong><small>Review it before sharing; this is not a contract or outcome guarantee.</small></div>
            </div>
            <pre>{brief}</pre>
            <div className="prepared-brief-actions">
              <button className="button button-secondary" type="button" onClick={() => void copyBrief()}>
                <Copy size={15} /> {copied ? "Copied" : "Copy brief"}
              </button>
              <button className="button button-primary" type="button" onClick={downloadBrief}>
                <Download size={15} /> Download .txt
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="agency-safeguard">
        <ShieldCheck size={24} />
        <div><h2>Selective, voluntary, and measurable.</h2><p>Founder DNA should complement—not replace—income support, job placement, professional advice, or participant choice.</p></div>
        <Link className="public-text-link" to="/method">Review method & safeguards <ArrowRight size={15} /></Link>
      </section>
    </>
  );
}
