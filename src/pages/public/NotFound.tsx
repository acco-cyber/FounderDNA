import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "../../lib/router";

export function NotFound() {
  return (
    <section className="not-found">
      <span><Compass size={28} /></span>
      <small>404 · route not found</small>
      <h1>This path has no evidence yet.</h1>
      <p>
        The page may have moved, or the link may be incomplete. Return to the
        Founder DNA home page and choose a known next step.
      </p>
      <Link className="button button-primary button-large" to="/">
        <ArrowLeft size={17} /> Back to home
      </Link>
    </section>
  );
}
