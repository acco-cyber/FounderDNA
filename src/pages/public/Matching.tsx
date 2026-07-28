import {
  ArrowRight,
  Check,
  Handshake,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRoundCheck,
} from "lucide-react";
import { Link } from "../../lib/router";

const leftTraits = [
  ["Market fluency", 92],
  ["Operations", 86],
  ["Customer access", 78],
  ["Product delivery", 38],
];

const rightTraits = [
  ["Market fluency", 46],
  ["Operations", 61],
  ["Customer access", 52],
  ["Product delivery", 91],
];

function ProfileCard({
  initials,
  label,
  role,
  traits,
}: {
  initials: string;
  label: string;
  role: string;
  traits: (string | number)[][];
}) {
  return (
    <article className="match-profile-card">
      <div className="match-profile-head">
        <span>{initials}</span>
        <div><small>{label}</small><strong>{role}</strong></div>
      </div>
      <div className="match-traits">
        {traits.map(([name, value]) => (
          <div key={name}>
            <span><small>{name}</small><em>{value}</em></span>
            <i><b style={{ width: `${value}%` }} /></i>
          </div>
        ))}
      </div>
    </article>
  );
}

export function Matching() {
  return (
    <>
      <section className="public-page-hero matching-page-hero">
        <span className="public-eyebrow"><Handshake size={14} /> DNA Matching</span>
        <h1>Match for complementary capability—not superficial similarity.</h1>
        <p>
          Founder DNA converts an individual growth edge into a mutual-consent
          co-founder brief across skills, commitment, working style, geography,
          and calibrated risk.
        </p>
        <Link className="button button-primary button-large" to="/app/matches">
          Open the matching workspace <ArrowRight size={17} />
        </Link>
        <Link className="button button-secondary button-large" to="/network">
          Browse the live network
        </Link>
      </section>

      <section className="matching-demo-section">
        <div className="matching-demo-heading">
          <div>
            <span className="public-eyebrow"><Sparkles size={14} /> Prototype visualization</span>
            <h2>Two different profiles. One stronger operating team.</h2>
          </div>
          <span className="prototype-pill">Illustrative profiles</span>
        </div>
        <div className="matching-demo">
          <ProfileCard initials="NC" label="Founder A" role="Operations lead" traits={leftTraits} />
          <div className="match-bridge">
            <span><Handshake size={25} /></span>
            <strong>Complementary fit</strong>
            <small>Product gap ↔ delivery strength</small>
            <i />
            <em>Mutual interest required</em>
          </div>
          <ProfileCard initials="JL" label="Founder B" role="Product builder" traits={rightTraits} />
        </div>
      </section>

      <section className="matching-principles">
        <article><UserRoundCheck size={21} /><h3>Mutual consent</h3><p>Full profiles are revealed only after both people express interest.</p></article>
        <article><Scale size={21} /><h3>Values alignment</h3><p>Commitment and risk expectations must align even when skills differ.</p></article>
        <article><Timer size={21} /><h3>Working trial</h3><p>A two-week scoped project creates behavioral evidence before equity discussions.</p></article>
        <article><LockKeyhole size={21} /><h3>Privacy controls</h3><p>Share only what is necessary at each matching stage.</p></article>
      </section>

      <section className="matching-boundary">
        <ShieldCheck size={23} />
        <div>
          <h2>Matching is a decision aid—not a compatibility guarantee.</h2>
          <p>
            The current product demonstrates onboarding, discovery, comparison,
            filtering, messaging, and scheduling locally. Real participant
            discovery, identity checks, OAuth, and message delivery require
            production providers and a consented network.
          </p>
        </div>
        <ul>
          <li><Check size={15} /> No hidden “perfect match” score</li>
          <li><Check size={15} /> No identity reveal without consent</li>
          <li><Check size={15} /> No co-founder claim without real work</li>
        </ul>
      </section>

      <section className="public-final-cta">
        <div>
          <span className="public-eyebrow">Start with your own gap</span>
          <h2>Know what the team needs before searching for a name.</h2>
        </div>
        <Link className="button button-primary button-large" to="/app/matches">
          Explore compatible founders <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
