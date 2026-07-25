import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Dna,
  LockKeyhole,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "../lib/router";
import { assessmentQuestions, traitMeta } from "../data/mockData";
import {
  getRankedTraits,
  initialsFromName,
  scoreAssessment,
} from "../lib/scoring";
import type { FounderProfile } from "../types";
import { ScoreRing } from "../components/ScoreRing";
import { TraitBars } from "../components/TraitBars";

interface AssessmentProps {
  profile: FounderProfile;
  setProfile: (profile: FounderProfile) => void;
  resetProfile: () => void;
}

const sectionMeta = [
  {
    id: "origin",
    number: "01",
    title: "Founder origin",
    detail: "Problem proximity & lived advantage",
  },
  {
    id: "execution",
    number: "02",
    title: "Under constraint",
    detail: "Velocity, risk & resourcefulness",
  },
  {
    id: "market",
    number: "03",
    title: "Local leverage",
    detail: "Market fluency & relationship capital",
  },
] as const;

const archetypes = {
  painPointProximity: "Insider Investigator",
  executionVelocity: "Rapid Experimenter",
  resourcefulness: "Constraint Hacker",
  networkLeverage: "Ecosystem Convener",
  riskCalibration: "Deliberate Operator",
  localMarketFluency: "Local Signal Reader",
} as const;

export function Assessment({ profile, setProfile, resetProfile }: AssessmentProps) {
  const [mode, setMode] = useState<"intro" | "questions" | "report">(
    profile.assessmentComplete ? "report" : profile.name ? "questions" : "intro",
  );
  const firstUnanswered = assessmentQuestions.findIndex(
    (question) => !profile.answers[question.id],
  );
  const [currentIndex, setCurrentIndex] = useState(
    firstUnanswered >= 0 ? firstUnanswered : 0,
  );
  const [draft, setDraft] = useState({
    name: profile.name,
    city: profile.city,
    region: profile.region,
    industry: profile.industry,
    commitment: profile.commitment,
  });
  const [reflection, setReflection] = useState(profile.reflection);

  const answeredCount = Object.keys(profile.answers).filter((id) =>
    assessmentQuestions.some((question) => question.id === id),
  ).length;
  const currentQuestion = assessmentQuestions[currentIndex];
  const selectedAnswer = profile.answers[currentQuestion?.id];
  const progress = Math.round((answeredCount / assessmentQuestions.length) * 100);
  const currentSectionIndex = sectionMeta.findIndex(
    (section) => section.id === currentQuestion?.section,
  );

  const startAssessment = () => {
    if (!draft.name.trim() || !draft.city.trim()) return;
    setProfile({
      ...profile,
      ...draft,
      name: draft.name.trim(),
      city: draft.city.trim(),
      region: draft.region.trim().toUpperCase() || "TX",
      initials: initialsFromName(draft.name),
    });
    setMode("questions");
  };

  const chooseAnswer = (optionId: string) => {
    setProfile({
      ...profile,
      answers: { ...profile.answers, [currentQuestion.id]: optionId },
    });
  };

  const continueAssessment = () => {
    if (!selectedAnswer) return;
    if (currentIndex < assessmentQuestions.length - 1) {
      setCurrentIndex((index) => index + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const scores = scoreAssessment(assessmentQuestions, profile.answers);
    setProfile({
      ...profile,
      scores,
      reflection,
      assessmentComplete: true,
      completedAt: new Date().toISOString(),
    });
    setMode("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const retake = () => {
    resetProfile();
    setDraft({
      name: "",
      city: "",
      region: "",
      industry: "",
      commitment: "Exploring",
    });
    setReflection("");
    setCurrentIndex(0);
    setMode("intro");
  };

  const unlockedTraits = useMemo(() => {
    if (!answeredCount) return [];
    const partialScores = scoreAssessment(
      assessmentQuestions.slice(0, currentIndex + 1),
      profile.answers,
    );
    return getRankedTraits(partialScores).slice(0, Math.min(3, currentSectionIndex + 1));
  }, [answeredCount, currentIndex, currentSectionIndex, profile.answers]);

  if (mode === "intro") {
    const canStart =
      draft.name.trim().length > 1 &&
      draft.city.trim().length > 1 &&
      draft.industry.trim().length > 1;
    return (
      <div className="assessment-intro">
        <section className="assessment-intro-hero">
          <div className="assessment-intro-copy">
            <span className="eyebrow">Not a personality test</span>
            <h2>Your founder advantage is already in the room.</h2>
            <p>
              Nine real-world choices reveal how you find signal, move under
              constraint, and turn local knowledge into momentum.
            </p>
            <div className="assessment-proof">
              <span>
                <Clock3 size={16} /> 12–15 minutes
              </span>
              <span>
                <Save size={16} /> Saves as you go
              </span>
              <span>
                <LockKeyhole size={16} /> Private by default
              </span>
            </div>
          </div>
          <div className="assessment-helix" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                style={
                  {
                    "--helix-index": index,
                    "--helix-delay": `${index * -0.12}s`,
                  } as React.CSSProperties
                }
              />
            ))}
            <strong>DNA</strong>
          </div>
        </section>

        <section className="assessment-intro-grid">
          <div className="panel assessment-form-card">
            <span className="form-step">First, make it yours</span>
            <h3>Where are you building from?</h3>
            <div className="field-grid">
              <label className="field field-wide">
                <span>Your name</span>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </label>
              <label className="field">
                <span>City</span>
                <input
                  value={draft.city}
                  onChange={(event) => setDraft({ ...draft, city: event.target.value })}
                  placeholder="Your city"
                  autoComplete="address-level2"
                />
              </label>
              <label className="field field-region">
                <span>State / region</span>
                <input
                  value={draft.region}
                  onChange={(event) => setDraft({ ...draft, region: event.target.value })}
                  placeholder="State"
                  maxLength={8}
                />
              </label>
              <label className="field field-wide">
                <span>Industry you know best</span>
                <input
                  value={draft.industry}
                  onChange={(event) =>
                    setDraft({ ...draft, industry: event.target.value })
                  }
                  placeholder="e.g. healthcare, logistics, hospitality"
                />
              </label>
              <label className="field field-wide">
                <span>Current commitment</span>
                <select
                  value={draft.commitment}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      commitment: event.target.value as FounderProfile["commitment"],
                    })
                  }
                >
                  <option>Exploring</option>
                  <option>Part-time</option>
                  <option>Full-time</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              className="button button-primary button-large button-full"
              onClick={startAssessment}
              disabled={!canStart}
            >
              Begin the assessment <ArrowRight size={18} />
            </button>
            <small className="form-privacy">
              Account profiles sync privately; local review stays on this device.
            </small>
          </div>

          <div className="assessment-stage-list">
            {sectionMeta.map((section, index) => (
              <article key={section.id}>
                <span>{section.number}</span>
                <div>
                  <small>5 minutes</small>
                  <h3>{section.title}</h3>
                  <p>{section.detail}</p>
                </div>
                {index === 0 ? <ChevronRight size={20} /> : <LockKeyhole size={17} />}
              </article>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (mode === "report") {
    const rankedTraits = getRankedTraits(profile.scores);
    const topTraits = rankedTraits.slice(0, 3);
    const gap = rankedTraits[rankedTraits.length - 1];
    const overallScore = Math.round(
      Object.values(profile.scores).reduce((sum, value) => sum + value, 0) /
        Object.values(profile.scores).length,
    );
    const archetype = archetypes[topTraits[0]];
    return (
      <div className="assessment-report">
        <section className="report-hero">
          <span className="report-complete-icon">
            <CheckCircle2 size={21} />
          </span>
          <span className="eyebrow">Profile complete</span>
          <h2>Your pattern: {archetype}.</h2>
          <p>
            You move fastest when you are close to the customer and can turn limited
            resources into a live test.
          </p>
          <div className="report-hero-actions">
            <a className="button button-primary" href="#signal-map">
              Explore my signal map <ArrowRight size={17} />
            </a>
            <button className="button button-ghost-light" type="button" onClick={retake}>
              <RotateCcw size={15} /> Retake
            </button>
          </div>
        </section>

        <section id="signal-map" className="report-grid">
          <article className="panel report-score-card">
            <div className="report-score-head">
              <div>
                <span className="eyebrow">Founder readiness</span>
                <h3>Strong signal, clear gap</h3>
              </div>
              <ScoreRing value={overallScore} size={112} stroke={9} label="self-report" />
            </div>
            <TraitBars scores={profile.scores} />
          </article>
          <article className="panel report-narrative-card">
            <span className="eyebrow">What this means</span>
            <h3>Your advantage compounds in the field.</h3>
            <p>
              You learn through direct contact, make practical bets, and recover quickly
              when the first approach misses. Keep strategy attached to live customer
              behavior.
            </p>
            <div className="top-trait-chips">
              {topTraits.map((trait, index) => (
                <span key={trait}>
                  <i>{index + 1}</i>
                  {traitMeta[trait].label}
                </span>
              ))}
            </div>
            {profile.reflection && (
              <blockquote>
                “{profile.reflection}”
                <small>Your language, captured during the assessment</small>
              </blockquote>
            )}
          </article>
        </section>

        <section className="report-gap-card">
          <div className="report-gap-number">01</div>
          <div>
            <span className="eyebrow">Critical complementary gap</span>
            <h3>{traitMeta[gap].label}</h3>
            <p>
              This is not a weakness to hide. It is a design constraint: recruit a
              partner or advisor with trusted distribution before scaling acquisition.
            </p>
          </div>
          <Link className="button button-secondary" to="/app/foundry">
            Design around this gap <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    );
  }

  const sectionQuestionNumber =
    assessmentQuestions
      .filter((question) => question.section === currentQuestion.section)
      .findIndex((question) => question.id === currentQuestion.id) + 1;

  return (
    <div className="assessment-workspace">
      <aside className="assessment-progress-panel">
        <div className="assessment-progress-head">
          <span className="assessment-dna-icon">
            <Dna size={21} />
          </span>
          <div>
            <strong>Founder DNA</strong>
            <small>{progress}% mapped</small>
          </div>
        </div>
        <div className="assessment-main-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="assessment-sections">
          {sectionMeta.map((section, index) => {
            const isComplete = index < currentSectionIndex;
            const isActive = index === currentSectionIndex;
            return (
              <button
                key={section.id}
                type="button"
                className={`${isActive ? "is-active" : ""} ${
                  isComplete ? "is-complete" : ""
                }`}
                onClick={() => {
                  const targetIndex = assessmentQuestions.findIndex(
                    (question) => question.section === section.id,
                  );
                  if (targetIndex <= answeredCount) setCurrentIndex(targetIndex);
                }}
              >
                <span>{isComplete ? <Check size={14} /> : section.number}</span>
                <div>
                  <strong>{section.title}</strong>
                  <small>{section.detail}</small>
                </div>
              </button>
            );
          })}
        </div>
        <div className="trait-unlocks">
          <span className="eyebrow">Signals unlocked</span>
          {unlockedTraits.length ? (
            unlockedTraits.map((trait) => (
              <div key={trait}>
                <i style={{ background: traitMeta[trait].color }} />
                {traitMeta[trait].short}
                <Sparkles size={12} />
              </div>
            ))
          ) : (
            <p>Your strongest signals will appear here.</p>
          )}
        </div>
        <span className="save-state">
          <Save size={13} /> Progress saved
        </span>
      </aside>

      <section className="question-stage">
        <div className="question-meta">
          <span>
            Lab {currentSectionIndex + 1} · Scenario {sectionQuestionNumber} of 3
          </span>
          <span>
            {answeredCount}/{assessmentQuestions.length} answered
          </span>
        </div>
        <span className="question-eyebrow">{currentQuestion.eyebrow}</span>
        <h2>{currentQuestion.prompt}</h2>
        <p className="question-context">{currentQuestion.context}</p>

        <div className="option-list" role="radiogroup" aria-label={currentQuestion.prompt}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`assessment-option ${isSelected ? "is-selected" : ""}`}
                onClick={() => chooseAnswer(option.id)}
              >
                <span className="option-letter">
                  {isSelected ? <Check size={16} /> : String.fromCharCode(65 + index)}
                </span>
                <span className="option-copy">
                  <strong>{option.label}</strong>
                  {isSelected && <small>{option.insight}</small>}
                </span>
                <ChevronRight size={19} />
              </button>
            );
          })}
        </div>

        {currentIndex === assessmentQuestions.length - 1 && (
          <label className="reflection-field">
            <span>One last thing — what problem do you feel unusually close to?</span>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              placeholder="Use your own words. This helps the blueprint sound like you."
              rows={4}
            />
          </label>
        )}

        <div className="question-navigation">
          <button
            className="button button-secondary"
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
          >
            <ArrowLeft size={17} /> Back
          </button>
          <button
            className="button button-primary"
            type="button"
            disabled={
              !selectedAnswer ||
              (currentIndex === assessmentQuestions.length - 1 &&
                reflection.trim().length < 8)
            }
            onClick={continueAssessment}
          >
            {currentIndex === assessmentQuestions.length - 1
              ? "Reveal my Founder DNA"
              : "Continue"}
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
    </div>
  );
}
