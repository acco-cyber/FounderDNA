import {
  TRAIT_KEYS,
  type AssessmentQuestion,
  type FounderProfile,
  type Opportunity,
  type TraitKey,
  type TraitScores,
} from "../types";

const MATCH_WEIGHTS: Record<TraitKey, number> = {
  painPointProximity: 0.3,
  localMarketFluency: 0.25,
  resourcefulness: 0.2,
  networkLeverage: 0.15,
  riskCalibration: 0.1,
  executionVelocity: 0,
};

export function scoreAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, string>,
): TraitScores {
  const earned = Object.fromEntries(TRAIT_KEYS.map((key) => [key, 0])) as TraitScores;
  const possible = Object.fromEntries(TRAIT_KEYS.map((key) => [key, 0])) as TraitScores;

  questions.forEach((question) => {
    question.options.forEach((option) => {
      TRAIT_KEYS.forEach((key) => {
        possible[key] += Math.max(0, option.scores[key] ?? 0);
      });
    });

    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected) return;
    TRAIT_KEYS.forEach((key) => {
      earned[key] += selected.scores[key] ?? 0;
    });
  });

  return Object.fromEntries(
    TRAIT_KEYS.map((key) => {
      const optionCount = questions.filter((question) =>
        question.options.some((option) => (option.scores[key] ?? 0) > 0),
      ).length;
      const normalizedMaximum = possible[key] / 3;
      const coverage = Math.min(1, optionCount / 4);
      const ratio = normalizedMaximum ? earned[key] / normalizedMaximum : 0;
      const score = Math.round(38 + Math.min(1, ratio) * 52 + coverage * 5);
      return [key, Math.max(38, Math.min(95, score))];
    }),
  ) as TraitScores;
}

export function getRankedTraits(scores: TraitScores): TraitKey[] {
  return [...TRAIT_KEYS].sort((a, b) => scores[b] - scores[a]);
}

export function matchOpportunity(profile: FounderProfile, opportunity: Opportunity): number {
  const weightedFounderScore = TRAIT_KEYS.reduce(
    (total, key) => total + profile.scores[key] * MATCH_WEIGHTS[key],
    0,
  );

  const requirementScores = Object.entries(opportunity.requiredTraits).map(
    ([key, required]) => {
      const trait = key as TraitKey;
      const delta = Math.abs(profile.scores[trait] - (required ?? 70));
      return Math.max(45, 100 - delta * 1.2);
    },
  );
  const requirementFit =
    requirementScores.reduce((total, score) => total + score, 0) /
    Math.max(1, requirementScores.length);
  const boost =
    opportunity.fitBoost.reduce((total, key) => total + profile.scores[key], 0) /
    opportunity.fitBoost.length;
  const raw = weightedFounderScore * 0.42 + requirementFit * 0.36 + boost * 0.22;

  return Math.max(58, Math.min(96, Math.round(raw)));
}

export function rankedOpportunities(
  profile: FounderProfile,
  opportunityList: Opportunity[],
): Array<Opportunity & { match: number }> {
  return opportunityList
    .map((opportunity) => ({
      ...opportunity,
      match: matchOpportunity(profile, opportunity),
    }))
    .sort((a, b) => b.match - a.match);
}

export function initialsFromName(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "FD";
}
