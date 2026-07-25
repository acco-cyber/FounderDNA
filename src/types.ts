export const TRAIT_KEYS = [
  "painPointProximity",
  "executionVelocity",
  "resourcefulness",
  "networkLeverage",
  "riskCalibration",
  "localMarketFluency",
] as const;

export type TraitKey = (typeof TRAIT_KEYS)[number];
export type TraitScores = Record<TraitKey, number>;

export type AssessmentSection = "origin" | "execution" | "market";

export interface AssessmentOption {
  id: string;
  label: string;
  insight: string;
  scores: Partial<TraitScores>;
}

export interface AssessmentQuestion {
  id: string;
  section: AssessmentSection;
  eyebrow: string;
  prompt: string;
  context: string;
  options: AssessmentOption[];
}

export interface FounderProfile {
  name: string;
  initials: string;
  city: string;
  region: string;
  industry: string;
  commitment: "Exploring" | "Part-time" | "Full-time";
  scores: TraitScores;
  answers: Record<string, string>;
  reflection: string;
  assessmentComplete: boolean;
  completedAt?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  thesis: string;
  signal: string;
  requiredTraits: Partial<TraitScores>;
  fitBoost: TraitKey[];
  tags: string[];
}
