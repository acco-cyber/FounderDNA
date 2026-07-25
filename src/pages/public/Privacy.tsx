import {
  Database,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from "lucide-react";

const sections = [
  {
    icon: Database,
    title: "Data we use",
    body: "Account identity, assessment answers, founder profile details, agent inputs and outputs, and evidence records you choose to create.",
  },
  {
    icon: LockKeyhole,
    title: "Where it lives",
    body: "Local review data stays in your browser and local development file. Production accounts use Supabase Auth and row-level-secured Postgres records.",
  },
  {
    icon: EyeOff,
    title: "What we do not do",
    body: "Founder DNA does not sell personal data, use unverified notes as public traction, or expose one founder’s workspace to another.",
  },
  {
    icon: KeyRound,
    title: "How access works",
    body: "Production API requests carry short-lived Supabase access tokens that the server verifies against the project’s published signing keys.",
  },
  {
    icon: Trash2,
    title: "Control and deletion",
    body: "You can reset founder profile data from Settings. Production deletion requests must remove both the authentication account and associated Supabase records.",
  },
  {
    icon: ShieldCheck,
    title: "AI boundaries",
    body: "Profile and evidence context may be sent to configured Gemini services to generate a sprint. Credentials remain server-side and outputs require human review.",
  },
];

export function Privacy() {
  return (
    <>
      <section className="public-page-hero privacy-hero">
        <span className="public-eyebrow">Privacy & data use</span>
        <h1>Your founder story should remain yours.</h1>
        <p>
          This page describes the implemented data behavior of the current
          Founder DNA product. It is written in plain language so users and
          reviewers can inspect the trust boundary.
        </p>
        <small>Product privacy summary · updated July 25, 2026</small>
      </section>

      <section className="privacy-grid">
        {sections.map(({ icon: Icon, title, body }) => (
          <article key={title}>
            <span><Icon size={21} /></span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="privacy-detail">
        <div>
          <h2>Important boundaries</h2>
          <p>
            Founder DNA provides an experimentation workflow, not legal,
            financial, medical, employment, or investment advice. Do not place
            secrets, regulated personal information, or confidential customer
            data in free-text fields.
          </p>
        </div>
        <div>
          <h2>Before a public launch</h2>
          <p>
            Replace this product summary with counsel-reviewed terms and privacy
            notices for the operating entity, deployment region, retention
            schedule, subprocessors, support contact, and applicable regulations.
          </p>
        </div>
      </section>
    </>
  );
}
