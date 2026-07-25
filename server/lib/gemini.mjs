import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { config, geminiProvider } from "./config.mjs";

const decisionSchema = z.object({
  decision: z.string().min(1),
  reason: z.string().min(1),
  confidence: z.enum(["low", "medium", "high"]),
  humanApprovalRequired: z.boolean(),
});

const sprintDaySchema = z.object({
  day: z.number().int().min(1).max(7),
  title: z.string().min(1),
  action: z.string().min(1),
  evidence: z.string().min(1),
  successSignal: z.string().min(1),
});

export const founderSprintOutputSchema = z.object({
  operatingProfile: z.object({
    archetype: z.string().min(1),
    summary: z.string().min(1),
    strengths: z.array(z.string().min(1)).min(2).max(4),
    growthEdge: z.string().min(1),
    evidence: z.array(z.string().min(1)).min(1).max(4),
  }),
  opportunity: z.object({
    name: z.string().min(1),
    customer: z.string().min(1),
    problem: z.string().min(1),
    whyFounder: z.string().min(1),
    hypotheses: z.array(z.string().min(1)).min(2).max(5),
    evidenceNeeded: z.array(z.string().min(1)).min(2).max(5),
  }),
  sprint: z.object({
    goal: z.string().min(1),
    decisionGate: z.string().min(1),
    days: z.array(sprintDaySchema).length(7),
  }),
  decisions: z.array(decisionSchema).min(1).max(5),
});

export const checkInOutputSchema = z.object({
  recommendation: z.enum(["continue", "pivot", "stop"]),
  reasoning: z.string().min(1),
  evidenceFor: z.array(z.string()).max(5),
  evidenceAgainst: z.array(z.string()).max(5),
  nextExperiment: z.string().min(1),
  humanApprovalRequired: z.literal(true),
});

const responseSchema = {
  type: "OBJECT",
  required: ["operatingProfile", "opportunity", "sprint", "decisions"],
  properties: {
    operatingProfile: {
      type: "OBJECT",
      required: ["archetype", "summary", "strengths", "growthEdge", "evidence"],
      properties: {
        archetype: { type: "STRING" },
        summary: { type: "STRING" },
        strengths: { type: "ARRAY", items: { type: "STRING" } },
        growthEdge: { type: "STRING" },
        evidence: { type: "ARRAY", items: { type: "STRING" } },
      },
    },
    opportunity: {
      type: "OBJECT",
      required: [
        "name",
        "customer",
        "problem",
        "whyFounder",
        "hypotheses",
        "evidenceNeeded",
      ],
      properties: {
        name: { type: "STRING" },
        customer: { type: "STRING" },
        problem: { type: "STRING" },
        whyFounder: { type: "STRING" },
        hypotheses: { type: "ARRAY", items: { type: "STRING" } },
        evidenceNeeded: { type: "ARRAY", items: { type: "STRING" } },
      },
    },
    sprint: {
      type: "OBJECT",
      required: ["goal", "decisionGate", "days"],
      properties: {
        goal: { type: "STRING" },
        decisionGate: { type: "STRING" },
        days: {
          type: "ARRAY",
          minItems: 7,
          maxItems: 7,
          items: {
            type: "OBJECT",
            required: ["day", "title", "action", "evidence", "successSignal"],
            properties: {
              day: { type: "INTEGER" },
              title: { type: "STRING" },
              action: { type: "STRING" },
              evidence: { type: "STRING" },
              successSignal: { type: "STRING" },
            },
          },
        },
      },
    },
    decisions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        required: ["decision", "reason", "confidence", "humanApprovalRequired"],
        properties: {
          decision: { type: "STRING" },
          reason: { type: "STRING" },
          confidence: { type: "STRING", enum: ["low", "medium", "high"] },
          humanApprovalRequired: { type: "BOOLEAN" },
        },
      },
    },
  },
};

const systemInstruction = `
You are Founder DNA's evidence-first venture operator.
Turn a founder's lived experience into one narrow, testable service-business hypothesis
and a seven-day route to first customer conversations.

Rules:
- Treat the assessment as a changeable self-report, never a diagnosis or prediction.
- Never invent market size, competitors, sources, customer quotes, revenue, or traction.
- Label unverified claims as hypotheses and explicitly name the evidence needed.
- Prefer a small manual paid pilot over software development.
- Keep actions practical for the founder's city, time commitment, and known industry.
- Do not send messages, spend money, publish, or make legal/financial commitments.
- Mark consequential choices as requiring human approval.
- Return only valid JSON matching the response schema.
`;

const createClient = () => {
  if (geminiProvider() === "vertex-ai") {
    return new GoogleGenAI({
      vertexai: true,
      project: config.googleCloudProject,
      location: config.googleCloudLocation,
    });
  }
  if (geminiProvider() === "gemini-developer-api") {
    return new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  return null;
};

const responseText = (response) => {
  if (typeof response.text === "string") return response.text;
  if (typeof response.text === "function") return response.text();
  throw new Error("Gemini returned no text response.");
};

export const isGeminiConfigured = () => geminiProvider() !== "not-configured";

export async function generateFounderSprint(profile, evidence = []) {
  const client = createClient();
  if (!client) {
    const error = new Error(
      "Gemini is not configured. Add Google Cloud credentials or GEMINI_API_KEY.",
    );
    error.code = "GEMINI_NOT_CONFIGURED";
    throw error;
  }

  const prompt = JSON.stringify({
    task: "Create one evidence-first Founder DNA operating profile and seven-day sprint.",
    founderSelfReport: profile,
    recordedEvidence: evidence,
  });

  const response = await client.models.generateContent({
    model: config.geminiModel,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.35,
    },
  });

  return founderSprintOutputSchema.parse(JSON.parse(responseText(response)));
}
export async function generateCheckIn({ run, evidence }) {
  const client = createClient();
  if (!client) {
    const error = new Error(
      "Gemini is not configured. Add Google Cloud credentials or GEMINI_API_KEY.",
    );
    error.code = "GEMINI_NOT_CONFIGURED";
    throw error;
  }

  const response = await client.models.generateContent({
    model: config.geminiModel,
    contents: JSON.stringify({
      task: "Review the actual evidence and recommend continue, pivot, or stop.",
      originalSprint: run,
      recordedEvidence: evidence,
    }),
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  return checkInOutputSchema.parse(JSON.parse(responseText(response)));
}
