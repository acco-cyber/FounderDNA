import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BrandMark } from "../../components/BrandMark";
import { FounderDnaIcon } from "../../components/FounderDnaIcon";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeProvider";
import { friendlyAuthError } from "../../lib/authClient";
import { Link, useLocation, useNavigate } from "../../lib/router";

function safeNext(search: string) {
  const requested = new URLSearchParams(search).get("next");
  return requested?.startsWith("/app") ? requested : "/app";
}

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const auth = useAuth();
  const { resolvedTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const next = useMemo(() => safeNext(location.search), [location.search]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | "local" | "reset" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isSignup = mode === "signup";

  useEffect(() => {
    setError("");
    const search = new URLSearchParams(location.search);
    setNotice(
      search.get("confirmed") === "1"
        ? "Email confirmed. You can sign in securely."
        : "",
    );
  }, [location.search, mode]);

  const complete = () => navigate(next, { replace: true });

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (isSignup && !accepted) {
      setError("Confirm that you accept the privacy and human-review boundaries.");
      return;
    }
    setBusy("email");
    try {
      if (isSignup) {
        const result = await auth.signUpEmail(name, email, password);
        if (result.requiresEmailConfirmation) {
          setNotice(
            "Account created. Check your inbox and confirm your email before signing in.",
          );
          return;
        }
      } else {
        await auth.signInEmail(email, password);
      }
      complete();
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setBusy(null);
    }
  };

  const useGoogle = async () => {
    setError("");
    setBusy("google");
    try {
      await auth.signInGoogle();
      complete();
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setBusy(null);
    }
  };

  const useLocalReview = () => {
    setBusy("local");
    auth.startLocalReview();
    complete();
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then request a reset link.");
      return;
    }
    setBusy("reset");
    setError("");
    try {
      await auth.resetPassword(email);
      setNotice("If this address has an account, a reset email is on the way.");
    } catch {
      setNotice("If this address has an account, a reset email is on the way.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-brand-link" aria-label="Founder DNA home">
          <BrandMark reversed tagline />
        </Link>
        <div className="auth-brand-message">
          <span className="public-eyebrow">
            <Sparkles size={14} /> Evidence before confidence
          </span>
          <h1>Build the next move your evidence can defend.</h1>
          <p>
            One private workspace for your operating profile, seven-day sprint,
            human decisions, and business proof.
          </p>
          <ul>
            <li><Check size={16} /> Claims stay labeled</li>
            <li><Check size={16} /> AI actions stay reviewable</li>
            <li><Check size={16} /> Business totals require evidence</li>
          </ul>
        </div>
        <div className="auth-orbit" aria-hidden="true">
          <FounderDnaIcon reversed animated />
        </div>
        <span className="auth-panel-foot">
          <ShieldCheck size={15} /> Private by default · human approved
        </span>
      </section>

      <section className="auth-form-panel">
        <div className="auth-mobile-top">
          <Link to="/" aria-label="Founder DNA home">
            <BrandMark reversed={resolvedTheme === "dark"} />
          </Link>
          <ThemeToggle />
        </div>
        <ThemeToggle className="auth-theme-toggle" />

        <div className="auth-form-wrap">
          {auth.user ? (
            <div className="auth-signed-in">
              <span><ShieldCheck size={24} /></span>
              <h1>You are already signed in.</h1>
              <p>
                Continue as <strong>{auth.user.displayName}</strong> to reopen
                your private founder workspace.
              </p>
              <button className="button button-primary button-large" onClick={complete}>
                Open workspace <ArrowRight size={17} />
              </button>
              <button
                className="auth-text-button"
                type="button"
                onClick={() => void auth.signOut()}
              >
                Use another account
              </button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span>{isSignup ? "Create your workspace" : "Welcome back"}</span>
                <h1>{isSignup ? "Start with the truth." : "Continue your fieldwork."}</h1>
                <p>
                  {isSignup
                    ? "Your first assessment and validation brief are free."
                    : "Sign in to your Founder DNA workspace."}
                </p>
              </div>

              {!auth.configured && !auth.localReviewAvailable && (
                <div className="auth-config-notice" role="alert">
                  <LockKeyhole size={17} />
                  Production authentication needs Supabase environment variables.
                </div>
              )}

              {auth.googleEnabled && (
                <>
                  <button
                    className="google-auth-button"
                    type="button"
                    onClick={() => void useGoogle()}
                    disabled={Boolean(busy) || !auth.configured}
                  >
                    {busy === "google" ? (
                      <LoaderCircle className="is-spinning" size={18} />
                    ) : (
                      <span className="google-g">G</span>
                    )}
                    Continue with Google
                  </button>

                  <div className="auth-divider"><span>or use email</span></div>
                </>
              )}

              <form className="auth-form" onSubmit={submitEmail}>
                {isSignup && (
                  <label>
                    <span>Full name</span>
                    <div className="auth-input">
                      <Sparkles size={17} />
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        autoComplete="name"
                        placeholder="Your name"
                        minLength={2}
                        required
                      />
                    </div>
                  </label>
                )}
                <label>
                  <span>Email address</span>
                  <div className="auth-input">
                    <Mail size={17} />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </label>
                <label>
                  <span>
                    Password
                    {!isSignup && (
                      <button
                        type="button"
                        onClick={() => void resetPassword()}
                        disabled={busy === "reset" || !auth.configured}
                      >
                        Forgot password?
                      </button>
                    )}
                  </span>
                  <div className="auth-input">
                    <KeyRound size={17} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      placeholder={isSignup ? "At least 8 characters" : "Your password"}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>

                {isSignup && (
                  <label className="auth-consent">
                    <input
                      type="checkbox"
                      checked={accepted}
                      onChange={(event) => setAccepted(event.target.checked)}
                    />
                    <span>
                      I understand Founder DNA produces hypotheses requiring human
                      review and accept the <Link to="/privacy">privacy boundaries</Link>.
                    </span>
                  </label>
                )}

                {error && <div className="auth-message is-error" role="alert">{error}</div>}
                {notice && <div className="auth-message is-success">{notice}</div>}

                <button
                  className="button button-primary button-large auth-submit"
                  type="submit"
                  disabled={Boolean(busy) || !auth.configured}
                >
                  {busy === "email" ? (
                    <LoaderCircle className="is-spinning" size={18} />
                  ) : (
                    <>
                      {isSignup ? "Create workspace" : "Sign in securely"}
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {auth.localReviewAvailable && (
                <button
                  className="local-review-button"
                  type="button"
                  onClick={useLocalReview}
                  disabled={Boolean(busy)}
                >
                  <span><Sparkles size={17} /></span>
                  <div>
                    <strong>Continue in local review mode</strong>
                    <small>Development only · never enabled in production</small>
                  </div>
                  <ArrowRight size={16} />
                </button>
              )}

              <p className="auth-switch">
                {isSignup ? "Already have a workspace?" : "New to Founder DNA?"}{" "}
                <Link to={isSignup ? `/login?next=${encodeURIComponent(next)}` : `/signup?next=${encodeURIComponent(next)}`}>
                  {isSignup ? "Sign in" : "Create an account"}
                </Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
