import {
  AlertCircle,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Cloud,
  FileSearch,
  FlaskConical,
  GitBranch,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  WandSparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "../lib/router";
import {
  createFounderSprint,
  getLedger,
  getSystemHealth,
  type AgentRun,
  type SystemHealth,
} from "../lib/api";
import type { FounderProfile } from "../types";

interface FoundryProps {
  profile: FounderProfile;
}

export function Foundry({ profile }: FoundryProps) {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoadingSystem(true);
    try {
      const [nextHealth, ledger] = await Promise.all([
        getSystemHealth(),
        getLedger(),
      ]);
      setHealth(nextHealth);
      setRuns(ledger.agentRuns);
      const latestSprint = ledger.agentRuns.find(
        (run) => run.type === "founder-sprint" && run.status === "completed",
      );
      if (latestSprint?.output) setActiveRun(latestSprint);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The Foundry API could not be reached.",
      );
    } finally {
      setLoadingSystem(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runSprint = async () => {
    setRunning(true);
    setError("");
    try {
      const run = await createFounderSprint(profile);
      setActiveRun(run);
      setRuns((current) => [run, ...current.filter((item) => item.id !== run.id)]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The founder sprint could not be generated.",
      );
    } finally {
      setRunning(false);
    }
  };

  const output = activeRun?.output;
  const completedRuns = useMemo(
    () => runs.filter((run) => run.status === "completed").length,
    [runs],
  );

  return (
    <div className="foundry-page">
      <section className="foundry-hero">
        <div className="foundry-hero-copy">
          <span className="live-pill">
            <WandSparkles size={14} /> Evidence-first mission control
          </span>
          <h2>
            Gemini proposes.
            <br />
            <em>You decide.</em>
          </h2>
          <p>
            The Foundry turns your self-reported Founder DNA into one narrow
            opportunity hypothesis and a seven-day customer-evidence sprint. It never
            sends, spends, or publishes without you.
          </p>
        </div>
        <div className="foundry-hero-controls">
          <div
            className={`operation-status ${
              health?.gemini.configured ? "" : "is-paused"
            }`}
          >
            <span>
              {health?.gemini.configured ? (
                <span className="pulse-core" />
              ) : (
                <AlertCircle size={17} />
              )}
            </span>
            <div>
              <small>Gemini runtime</small>
              <strong>
                {loadingSystem
                  ? "Checking…"
                  : health?.gemini.configured
                    ? `${health.gemini.provider} ready`
                    : "Credentials needed"}
              </strong>
            </div>
          </div>
          <button
            className="button button-ghost-light"
            type="button"
            onClick={() => void refresh()}
            disabled={loadingSystem}
          >
            <RefreshCw size={15} className={loadingSystem ? "is-spinning" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="inline-notice error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      <section className="foundry-metrics">
        <article>
          <span><Cloud size={20} /></span>
          <div>
            <small>AI provider</small>
            <strong>
              {health?.gemini.configured
                ? health.gemini.provider
                : loadingSystem
                  ? "Checking"
                  : "Offline"}
            </strong>
          </div>
          <em>
            {health?.gemini.configured
              ? health.gemini.model
              : "Gemini credentials"}
          </em>
        </article>
        <article>
          <span><BrainCircuit size={20} /></span>
          <div>
            <small>Completed runs</small>
            <strong>{completedRuns}</strong>
          </div>
          <em>Server recorded</em>
        </article>
        <article>
          <span><Clock3 size={20} /></span>
          <div>
            <small>Experiment horizon</small>
            <strong>7 days</strong>
          </div>
          <em>One decision gate</em>
        </article>
        <article className="attention-metric">
          <span><UserCheck size={20} /></span>
          <div>
            <small>External autonomy</small>
            <strong>0</strong>
          </div>
          <em>Human approval required</em>
        </article>
      </section>

      {!profile.assessmentComplete ? (
        <section className="foundry-empty panel">
          <div className="foundry-empty-icon"><FileSearch size={34} /></div>
          <span className="eyebrow">Input needed</span>
          <h2>Map your operating signal first</h2>
          <p>
            The agent needs your scenario answers and founder reflection before it can
            build a relevant experiment.
          </p>
          <Link className="button button-primary" to="/app/assessment">
            Start the assessment <ArrowRight size={16} />
          </Link>
        </section>
      ) : !health?.gemini.configured ? (
        <section className="foundry-connect-grid">
          <article className="panel foundry-connect-card">
            <span className="foundry-connect-icon"><Cloud size={27} /></span>
            <span className="eyebrow">One honest blocker</span>
            <h2>Connect Gemini to run the Foundry</h2>
            <p>
              The UI does not simulate an AI response. Add Vertex AI credentials for
              the hackathon deployment, or a Gemini API key for local testing.
            </p>
            <div className="config-steps">
              <span><b>1</b> Copy <code>.env.example</code> to <code>.env</code></span>
              <span><b>2</b> Set <code>GOOGLE_CLOUD_PROJECT</code></span>
              <span><b>3</b> Authenticate Application Default Credentials</span>
              <span><b>4</b> Restart <code>npm run dev:full</code></span>
            </div>
          </article>
          <article className="panel foundry-principles">
            <span className="eyebrow">Agent contract</span>
            <h3>What the Foundry will—and will not—do</h3>
            <span><CheckCircle2 size={16} /> Propose a narrow paid-pilot hypothesis</span>
            <span><CheckCircle2 size={16} /> Build a seven-day evidence sprint</span>
            <span><CheckCircle2 size={16} /> Log model, timestamp, output, and decisions</span>
            <span><LockKeyhole size={16} /> Never invent traction or market facts</span>
            <span><LockKeyhole size={16} /> Never contact customers without approval</span>
          </article>
        </section>
      ) : !output ? (
        <section className="foundry-empty panel">
          <div className="foundry-empty-icon"><Bot size={34} /></div>
          <span className="eyebrow">Ready for the first run</span>
          <h2>Turn your Founder DNA into a field experiment</h2>
          <p>
            Gemini will use your profile and existing proof ledger, then label every
            unverified business claim as a hypothesis.
          </p>
          <button
            className="button button-primary button-large"
            type="button"
            onClick={() => void runSprint()}
            disabled={running}
          >
            {running ? (
              <><RefreshCw size={17} className="is-spinning" /> Building your sprint…</>
            ) : (
              <><Play size={17} /> Run my founder sprint</>
            )}
          </button>
        </section>
      ) : (
        <>
          <section className="mission-command panel">
            <div className="mission-command-head">
              <div>
                <span className="eyebrow">Gemini-generated hypothesis</span>
                <h2>{output.opportunity.name}</h2>
              </div>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => void runSprint()}
                disabled={running}
              >
                <RefreshCw size={15} className={running ? "is-spinning" : ""} />
                Regenerate
              </button>
            </div>
            <div className="mission-thesis-grid">
              <article>
                <span><Target size={17} /> Customer</span>
                <strong>{output.opportunity.customer}</strong>
              </article>
              <article>
                <span><FlaskConical size={17} /> Problem hypothesis</span>
                <strong>{output.opportunity.problem}</strong>
              </article>
              <article>
                <span><BrainCircuit size={17} /> Founder fit</span>
                <strong>{output.opportunity.whyFounder}</strong>
              </article>
            </div>
            <div className="mission-warning">
              <AlertCircle size={17} />
              <span>
                This is a model-generated hypothesis, not market proof. The sprint
                below exists to falsify or validate it.
              </span>
            </div>
          </section>

          <section className="foundry-output-grid">
            <article className="panel profile-output-card">
              <span className="eyebrow">Operating profile</span>
              <h2>{output.operatingProfile.archetype}</h2>
              <p>{output.operatingProfile.summary}</p>
              <div className="output-list">
                {output.operatingProfile.strengths.map((strength) => (
                  <span key={strength}><CheckCircle2 size={15} /> {strength}</span>
                ))}
              </div>
              <div className="growth-edge">
                <small>Growth edge</small>
                <strong>{output.operatingProfile.growthEdge}</strong>
              </div>
            </article>
            <article className="panel hypothesis-output-card">
              <span className="eyebrow">Must be proven</span>
              <h2>Evidence requirements</h2>
              <div className="numbered-evidence">
                {output.opportunity.evidenceNeeded.map((item, index) => (
                  <span key={item}><b>{index + 1}</b>{item}</span>
                ))}
              </div>
            </article>
          </section>

          <section className="panel sprint-board">
            <div className="foundry-section-heading">
              <div>
                <span className="eyebrow">Seven-day field sprint</span>
                <h2>{output.sprint.goal}</h2>
              </div>
              <span className="audit-badge">
                <GitBranch size={14} /> Gate: {output.sprint.decisionGate}
              </span>
            </div>
            <div className="sprint-day-grid">
              {output.sprint.days.map((day) => (
                <article key={day.day}>
                  <span className="day-number">DAY {day.day}</span>
                  <h3>{day.title}</h3>
                  <p>{day.action}</p>
                  <dl>
                    <div>
                      <dt>Capture</dt>
                      <dd>{day.evidence}</dd>
                    </div>
                    <div>
                      <dt>Success signal</dt>
                      <dd>{day.successSignal}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="decision-log panel">
            <div className="foundry-section-heading">
              <div>
                <span className="eyebrow">Human checkpoints</span>
                <h2>Decision register</h2>
              </div>
              <span className="audit-badge">
                <ShieldCheck size={14} /> No external action taken
              </span>
            </div>
            <div className="decision-register">
              {output.decisions.map((decision) => (
                <article key={decision.decision}>
                  <span><UserCheck size={17} /></span>
                  <div>
                    <strong>{decision.decision}</strong>
                    <p>{decision.reason}</p>
                  </div>
                  <small>{decision.confidence} confidence</small>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="activity-section">
        <div className="foundry-section-heading">
          <div>
            <span className="eyebrow">Audit trail</span>
            <h2>Recorded agent runs</h2>
          </div>
          <span className="audit-badge">
            <ShieldCheck size={14} /> {health?.persistence ?? "local"} persistence
          </span>
        </div>
        {runs.length === 0 ? (
          <div className="activity-empty">
            No agent has run yet. Nothing is simulated in this log.
          </div>
        ) : (
          <div className="activity-table">
            {runs.slice(0, 8).map((run) => (
              <div key={run.id}>
                <span className={`activity-dot ${run.status === "completed" ? "complete" : "approval"}`} />
                <time>{new Date(run.createdAt).toLocaleString()}</time>
                <strong>{run.type === "founder-sprint" ? "Founder Sprint" : "Evidence Check-in"}</strong>
                <p>{run.status} · {run.provider} · {run.durationMs ?? 0}ms</p>
                <button type="button" onClick={() => setActiveRun(run)}>View output</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
