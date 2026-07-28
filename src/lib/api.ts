import type { FounderProfile } from "../types";
import { getApiAuthHeaders } from "./authClient";

const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export interface SystemHealth {
  status: "ok";
  service: string;
  version: string;
  gemini: {
    configured: boolean;
    provider: "vertex-ai" | "gemini-developer-api" | "not-configured";
    model: string;
  };
  persistence: "supabase" | "local-file";
  database: {
    ready: boolean;
    detail: string;
  };
  payments: boolean;
  auth?: {
    configured: boolean;
    provider: "supabase-jwt" | "local-review";
  };
  timestamp: string;
}

export interface FounderSprintOutput {
  operatingProfile: {
    archetype: string;
    summary: string;
    strengths: string[];
    growthEdge: string;
    evidence: string[];
  };
  opportunity: {
    name: string;
    customer: string;
    problem: string;
    whyFounder: string;
    hypotheses: string[];
    evidenceNeeded: string[];
  };
  sprint: {
    goal: string;
    decisionGate: string;
    days: Array<{
      day: number;
      title: string;
      action: string;
      evidence: string;
      successSignal: string;
    }>;
  };
  decisions: Array<{
    decision: string;
    reason: string;
    confidence: "low" | "medium" | "high";
    humanApprovalRequired: boolean;
  }>;
}

export interface AgentRun {
  id: string;
  type: "founder-sprint" | "evidence-check-in";
  status: "completed" | "failed";
  provider: string;
  model?: string;
  createdAt: string;
  durationMs?: number;
  humanApprovalRequired?: boolean;
  output?: FounderSprintOutput;
  error?: string;
}

export type EvidenceType =
  | "customer_interview"
  | "customer_commitment"
  | "revenue"
  | "expense"
  | "marketing"
  | "outcome"
  | "agent_decision";

export interface EvidenceEvent {
  id: string;
  type: EvidenceType;
  note: string;
  amount?: number;
  currency?: string;
  customerRef?: string;
  status: "unverified" | "verified";
  source?: string;
  createdAt: string;
}

export interface EvidenceSummary {
  revenue: number;
  expenses: number;
  profit: number;
  payingCustomers: number;
  interviews: number;
  commitments: number;
  outcomes: number;
  agentRuns: number;
  evidenceEvents: number;
  lastUpdated: string | null;
  currency: string;
}

export interface Ledger {
  evidence: EvidenceEvent[];
  agentRuns: AgentRun[];
}

export interface MatchProfile {
  userId?: string;
  displayName: string;
  track: "Technical" | "Business" | "Hybrid";
  headline: string;
  bio: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "In person" | "Flexible";
  industry: string;
  ambition: string;
  stage:
    | "Exploring"
    | "Idea"
    | "Validating"
    | "MVP"
    | "Pre-seed"
    | "Seed"
    | "Series A+";
  equityExpectation: string;
  weeklyHours: number;
  skills: string[];
  seekingSkills: string[];
  vision: string;
  avatarUrl?: string | null;
  published: boolean;
  identityVerified?: boolean;
  phoneVerified?: boolean;
  linkedinVerified?: boolean;
  updatedAt?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const authHeaders = await getApiAuthHeaders();
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      payload.error ?? `Request failed with status ${response.status}.`,
      response.status,
      payload.code,
    );
  }

  return payload as T;
}

export const getSystemHealth = () => request<SystemHealth>("/api/health");

export const getFounderProfile = () =>
  request<{ profile: FounderProfile | null }>("/api/profile");

export const saveFounderProfile = (profile: FounderProfile) =>
  request<{ profile: FounderProfile }>("/api/profile", {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });

export const getMatchProfile = () =>
  request<{ profile: MatchProfile | null }>("/api/matching/profile");

export const saveMatchProfile = (profile: MatchProfile) =>
  request<{ profile: MatchProfile }>("/api/matching/profile", {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });

export const discoverMatchProfiles = () =>
  request<{ profiles: MatchProfile[] }>("/api/matching/discover");

export const requestMatchIntro = (recipientId: string, note = "") =>
  request<{
    connection: {
      id: string;
      requesterId: string;
      recipientId: string;
      status: "requested" | "accepted" | "passed" | "blocked";
      note: string;
      createdAt: string;
    };
  }>("/api/matching/connections", {
    method: "POST",
    body: JSON.stringify({ recipientId, note }),
  });

export const getEvidenceSummary = () =>
  request<EvidenceSummary>("/api/evidence/summary");

export const getLedger = () => request<Ledger>("/api/ledger");

export const createFounderSprint = (profile: FounderProfile) =>
  request<AgentRun>("/api/agents/founder-sprint", {
    method: "POST",
    body: JSON.stringify({ profile }),
  });

export const addEvidence = (
  evidence: Omit<EvidenceEvent, "id" | "createdAt">,
  adminKey?: string,
) =>
  request<EvidenceEvent>("/api/evidence", {
    method: "POST",
    headers: adminKey ? { "X-Admin-Key": adminKey } : undefined,
    body: JSON.stringify(evidence),
  });
