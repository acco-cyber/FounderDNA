import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { BrandMark } from "../../components/BrandMark";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useAuth } from "../../context/AuthProvider";
import { friendlyAuthError } from "../../lib/authClient";
import { Link, useNavigate } from "../../lib/router";

export function PasswordReset() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await auth.changePassword(password);
      navigate("/app/settings", { replace: true });
    } catch (caught) {
      setError(friendlyAuthError(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page auth-reset-page">
      <section className="auth-brand-panel">
        <Link to="/" className="auth-brand-link" aria-label="Founder DNA home">
          <BrandMark reversed tagline />
        </Link>
        <div className="auth-brand-message">
          <span className="public-eyebrow">
            <ShieldCheck size={14} /> Secure account recovery
          </span>
          <h1>Choose a strong new password.</h1>
          <p>
            Your recovery link is short-lived. Founder DNA never stores your
            password in the application database.
          </p>
        </div>
      </section>

      <section className="auth-form-panel">
        <ThemeToggle className="auth-theme-toggle" />
        <div className="auth-form-wrap">
          <div className="auth-heading">
            <span>Account recovery</span>
            <h1>Reset your password.</h1>
            <p>Use at least eight characters and avoid a reused password.</p>
          </div>

          {auth.status === "ready" && !auth.user ? (
            <div className="auth-signed-in">
              <span><KeyRound size={24} /></span>
              <h1>This recovery link is invalid or expired.</h1>
              <p>Return to sign in and request a fresh password reset email.</p>
              <Link className="button button-primary button-large" to="/login">
                Return to sign in <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit}>
              <label>
                <span>New password</span>
                <div className="auth-input">
                  <KeyRound size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
              {error && <div className="auth-message is-error" role="alert">{error}</div>}
              <button
                className="button button-primary button-large auth-submit"
                type="submit"
                disabled={busy || auth.status === "loading"}
              >
                {busy ? (
                  <LoaderCircle className="is-spinning" size={18} />
                ) : (
                  <>Save new password <ArrowRight size={17} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
