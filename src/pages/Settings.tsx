import {
  Check,
  Cloud,
  Database,
  Download,
  ExternalLink,
  KeyRound,
  Laptop,
  LogOut,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import {
  useTheme,
  type ThemePreference,
} from "../context/ThemeProvider";
import { getSystemHealth, type SystemHealth } from "../lib/api";
import { Link, useNavigate } from "../lib/router";
import type { FounderProfile } from "../types";

type SettingsProps = {
  profile: FounderProfile;
  resetProfile: () => void;
  syncState: "loading" | "synced" | "local" | "error";
};

const themeChoices: Array<{
  id: ThemePreference;
  label: string;
  detail: string;
  icon: typeof Sun;
}> = [
  { id: "light", label: "Light", detail: "Bright and focused", icon: Sun },
  { id: "dark", label: "Dark", detail: "Low-light workspace", icon: Moon },
  { id: "system", label: "System", detail: "Match this device", icon: Laptop },
];

export function Settings({ profile, resetProfile, syncState }: SettingsProps) {
  const auth = useAuth();
  const { preference, setPreference } = useTheme();
  const navigate = useNavigate();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    void getSystemHealth()
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        uid: auth.user?.uid,
        email: auth.user?.email,
        provider: auth.user?.provider,
      },
      profile,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `founder-dna-export-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clearProfile = () => {
    if (
      window.confirm(
        "Reset the assessment and founder profile for this account? Evidence records are not removed.",
      )
    ) {
      resetProfile();
    }
  };

  const leaveWorkspace = async () => {
    await auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="settings-page">
      <section className="settings-hero">
        <div>
          <span className="eyebrow">Account & workspace</span>
          <h2>Settings that keep you in control.</h2>
          <p>
            Manage appearance, inspect the active infrastructure, and export or
            reset your founder profile.
          </p>
        </div>
        <span className={`sync-pill sync-${syncState}`}>
          <RefreshCw size={14} className={syncState === "loading" ? "is-spinning" : ""} />
          {syncState === "synced"
            ? "Workspace synced"
            : syncState === "local"
              ? "Saved on this device"
              : syncState === "error"
                ? "Sync needs attention"
                : "Checking workspace"}
        </span>
      </section>

      <div className="settings-grid">
        <section className="panel settings-card">
          <div className="settings-card-heading">
            <span><Sun size={18} /></span>
            <div>
              <h3>Appearance</h3>
              <p>Choose how Founder DNA looks on this device.</p>
            </div>
          </div>
          <div className="theme-choice-grid">
            {themeChoices.map(({ id, label, detail, icon: Icon }) => (
              <button
                key={id}
                className={preference === id ? "is-active" : ""}
                type="button"
                onClick={() => setPreference(id)}
              >
                <Icon size={19} />
                <span><strong>{label}</strong><small>{detail}</small></span>
                {preference === id && <Check size={16} />}
              </button>
            ))}
          </div>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-heading">
            <span><KeyRound size={18} /></span>
            <div>
              <h3>Account</h3>
              <p>Your authenticated workspace identity.</p>
            </div>
          </div>
          <dl className="settings-details">
            <div><dt>Name</dt><dd>{auth.user?.displayName || "Founder"}</dd></div>
            <div><dt>Email</dt><dd>{auth.user?.email || "Not available"}</dd></div>
            <div>
              <dt>Session</dt>
              <dd>{auth.user?.isLocalReview ? "Local review" : "Supabase authenticated"}</dd>
            </div>
            <div>
              <dt>Email status</dt>
              <dd>{auth.user?.emailVerified ? "Verified" : "Not verified"}</dd>
            </div>
          </dl>
          <button
            className="button button-secondary settings-full-button"
            type="button"
            onClick={() => void leaveWorkspace()}
          >
            <LogOut size={16} /> Sign out
          </button>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-heading">
            <span><Cloud size={18} /></span>
            <div>
              <h3>Infrastructure</h3>
              <p>Live configuration reported by the server.</p>
            </div>
          </div>
          {healthError ? (
            <div className="settings-inline-error">
              The API is not reachable. Check the localhost or deployment URL.
            </div>
          ) : (
            <dl className="settings-details">
              <div>
                <dt>Gemini</dt>
                <dd className={health?.gemini.configured ? "is-good" : ""}>
                  {health?.gemini.configured ? health.gemini.provider : "Not configured"}
                </dd>
              </div>
              <div><dt>Model</dt><dd>{health?.gemini.model ?? "Checking…"}</dd></div>
              <div>
                <dt>Persistence</dt>
                <dd>{health?.persistence ?? "Checking…"}</dd>
              </div>
              <div>
                <dt>Database</dt>
                <dd className={health?.database.ready ? "is-good" : ""}>
                  {health
                    ? health.database.ready
                      ? "Schema ready"
                      : "Migration required"
                    : "Checking…"}
                </dd>
              </div>
              <div>
                <dt>Authentication</dt>
                <dd className={health?.auth?.configured ? "is-good" : ""}>
                  {health?.auth?.configured
                    ? health.auth.provider
                    : auth.user?.isLocalReview
                      ? "Local review"
                      : "Not configured"}
                </dd>
              </div>
            </dl>
          )}
          <Link className="settings-doc-link" to="/method">
            Review trust boundaries <ExternalLink size={14} />
          </Link>
        </section>

        <section className="panel settings-card">
          <div className="settings-card-heading">
            <span><Database size={18} /></span>
            <div>
              <h3>Your data</h3>
              <p>Portable by design, resettable by the founder.</p>
            </div>
          </div>
          <div className="settings-data-actions">
            <button className="settings-action" type="button" onClick={exportData}>
              <span><Download size={17} /></span>
              <div><strong>Export profile</strong><small>Download readable JSON</small></div>
            </button>
            <button
              className="settings-action is-danger"
              type="button"
              onClick={clearProfile}
            >
              <span><Trash2 size={17} /></span>
              <div><strong>Reset founder profile</strong><small>Keep proof ledger records</small></div>
            </button>
          </div>
          <p className="settings-data-note">
            <ShieldCheck size={14} />
            Production account deletion should remove both the Supabase Auth
            identity and its row-level-secured workspace records.
          </p>
        </section>
      </div>
    </div>
  );
}
