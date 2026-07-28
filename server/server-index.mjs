import { randomUUID, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import Stripe from "stripe";
import { z } from "zod";
import {
  config,
  geminiProvider,
  persistenceProvider,
} from "./lib/config.mjs";
import {
  isAuthenticationConfigured,
  requireAuth,
} from "./lib/auth.mjs";
import {
  generateCheckIn,
  generateFounderSprint,
  isGeminiConfigured,
} from "./lib/gemini.mjs";
import { summarizeEvidence } from "./lib/evidence.mjs";
import { store } from "./lib/store.mjs";

const app = express();
app.set("trust proxy", 1);
const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(moduleDirectory, "../dist");
const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey)
  : null;

const log = (severity, event, fields = {}) => {
  console.log(
    JSON.stringify({
      severity,
      event,
      service: "founder-dna",
      timestamp: new Date().toISOString(),
      ...fields,
    }),
  );
};

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left ?? "");
  const rightBuffer = Buffer.from(right ?? "");
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
};

const requireEvidenceAdmin = (request, response, next) => {
  if (request.body?.status !== "verified" || request.user?.admin) return next();
  if (!config.evidenceAdminKey && config.nodeEnv !== "production") return next();
  if (
    config.evidenceAdminKey &&
    safeEqual(request.get("x-admin-key"), config.evidenceAdminKey)
  ) {
    return next();
  }
  return response.status(401).json({
    error: "Evidence writes require the configured admin key.",
    code: "EVIDENCE_AUTH_REQUIRED",
  });
};

const evidenceSchema = z
  .object({
    type: z.enum([
      "customer_interview",
      "customer_commitment",
      "revenue",
      "expense",
      "marketing",
      "outcome",
      "agent_decision",
    ]),
    note: z.string().trim().min(3).max(1000),
    amount: z.number().finite().nonnegative().optional(),
    currency: z.string().trim().length(3).default("USD"),
    customerRef: z.string().trim().max(120).optional(),
    status: z.enum(["unverified", "verified"]).default("unverified"),
    source: z.string().trim().max(300).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((event, context) => {
    if (["revenue", "expense"].includes(event.type) && event.amount === undefined) {
      context.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Revenue and expense records require an amount.",
      });
    }
    if (event.status === "verified" && !event.source) {
      context.addIssue({
        code: "custom",
        path: ["source"],
        message: "Verified evidence requires a source reference.",
      });
    }
    if (
      ["revenue", "customer_commitment"].includes(event.type) &&
      !event.customerRef
    ) {
      context.addIssue({
        code: "custom",
        path: ["customerRef"],
        message: "Revenue and commitment records require a customer reference.",
      });
    }
  });

const founderProfileSchema = z.object({
  name: z.string().trim().max(120),
  initials: z.string().trim().max(4),
  city: z.string().trim().max(120),
  region: z.string().trim().max(120),
  industry: z.string().trim().max(160),
  commitment: z.enum(["Exploring", "Part-time", "Full-time"]),
  reflection: z.string().trim().max(3000),
  assessmentComplete: z.boolean(),
  answers: z.record(z.string(), z.string()),
  scores: z.record(z.string(), z.number().min(0).max(100)),
  completedAt: z.string().datetime().optional(),
});

const founderSprintSchema = z.object({
  profile: founderProfileSchema.extend({
    name: z.string().trim().min(1).max(120),
    city: z.string().trim().min(1).max(120),
    industry: z.string().trim().min(1).max(160),
    reflection: z.string().trim().min(8).max(3000),
    assessmentComplete: z.literal(true),
  }),
});

const matchProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  track: z.enum(["Technical", "Business", "Hybrid"]),
  headline: z.string().trim().max(240),
  bio: z.string().trim().max(1600),
  location: z.string().trim().max(160),
  workMode: z.enum(["Remote", "Hybrid", "In person", "Flexible"]),
  industry: z.string().trim().max(160),
  ambition: z.string().trim().max(120),
  stage: z.enum([
    "Exploring",
    "Idea",
    "Validating",
    "MVP",
    "Pre-seed",
    "Seed",
    "Series A+",
  ]),
  equityExpectation: z.string().trim().max(120),
  weeklyHours: z.number().int().min(1).max(100),
  skills: z.array(z.string().trim().min(1).max(80)).max(16),
  seekingSkills: z.array(z.string().trim().min(1).max(80)).max(16),
  vision: z.string().trim().max(2400),
  published: z.boolean(),
});

const connectionRequestSchema = z.object({
  recipientId: z.string().uuid(),
  note: z.string().trim().max(500).default(""),
});

const checkInSchema = z.object({
  runId: z.string().uuid(),
});

const requestBuckets = new Map();
const rateLimitAgents = (request, response, next) => {
  const key = request.user?.uid ?? request.ip ?? "unknown";
  const now = Date.now();
  const current = requestBuckets.get(key) ?? { count: 0, resetAt: now + 60_000 };
  if (now >= current.resetAt) {
    current.count = 0;
    current.resetAt = now + 60_000;
  }
  current.count += 1;
  requestBuckets.set(key, current);
  if (current.count > 10) {
    return response.status(429).json({
      error: "Too many agent requests. Try again in a minute.",
      code: "RATE_LIMITED",
    });
  }
  return next();
};

app.disable("x-powered-by");

app.use((request, response, next) => {
  response.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-site",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });

  const origin = request.get("origin");
  const localOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
    origin ?? "",
  );
  const sameOrigin =
    origin === `${request.protocol}://${request.get("host")}`;
  if (
    origin &&
    (localOrigin ||
      sameOrigin ||
      config.allowedOrigins.includes(origin))
  ) {
    response.set("Access-Control-Allow-Origin", origin);
    response.set("Vary", "Origin");
    response.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, X-Admin-Key, X-Founder-Local-Review",
    );
    response.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  }
  if (request.method === "OPTIONS") return response.sendStatus(204);
  if (config.nodeEnv === "production") {
    response.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
    response.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleusercontent.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com; frame-src 'self' https://accounts.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
  }
  return next();
});

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    if (!stripe || !config.stripeWebhookSecret) {
      return response.status(503).json({ error: "Stripe webhook is not configured." });
    }
    try {
      const event = stripe.webhooks.constructEvent(
        request.body,
        request.get("stripe-signature"),
        config.stripeWebhookSecret,
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        await store.addEvidence(
          {
            id: `stripe-${session.id}`,
            type: "revenue",
            note: "Completed Founder DNA checkout",
            amount: Number(session.amount_total ?? 0) / 100,
            currency: String(session.currency ?? "usd").toUpperCase(),
            customerRef: String(
              session.customer_details?.email ?? session.customer ?? "",
            ),
            status: session.payment_status === "paid" ? "verified" : "unverified",
            source: `stripe:${event.id}`,
            createdAt: new Date(event.created * 1000).toISOString(),
          },
          String(
            session.metadata?.supabaseUserId ??
              session.client_reference_id ??
              "",
          ),
        );
      }
      return response.json({ received: true });
    } catch (error) {
      log("WARNING", "stripe_webhook_rejected", { message: error.message });
      return response.status(400).json({ error: "Invalid Stripe webhook." });
    }
  },
);

app.use(express.json({ limit: "200kb" }));

app.get("/api/health", async (_request, response) => {
  const database = await store.health().catch(() => ({
    ready: false,
    detail: "Database health check failed.",
  }));
  response.json({
    status: "ok",
    service: "Founder DNA",
    version: "0.6.0",
    gemini: {
      configured: isGeminiConfigured(),
      provider: geminiProvider(),
      model: config.geminiModel,
    },
    persistence: persistenceProvider(),
    database,
    payments: Boolean(
      stripe && config.stripePriceId && config.stripeWebhookSecret,
    ),
    auth: {
      configured: isAuthenticationConfigured(),
      provider: isAuthenticationConfigured()
        ? "supabase-jwt"
        : "local-review",
    },
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/profile", requireAuth, async (request, response, next) => {
  try {
    response.json({
      profile: await store.getProfile(request.user.uid, request.supabase),
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/profile", requireAuth, async (request, response, next) => {
  try {
    const profile = founderProfileSchema.parse(request.body?.profile);
    const saved = await store.saveProfile(
      profile,
      request.user.uid,
      request.supabase,
    );
    response.json(saved);
  } catch (error) {
    next(error);
  }
});

app.get("/api/matching/profile", requireAuth, async (request, response, next) => {
  try {
    response.json({
      profile: await store.getMatchProfile(
        request.user.uid,
        request.supabase,
      ),
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/matching/profile", requireAuth, async (request, response, next) => {
  try {
    const profile = matchProfileSchema.parse(request.body?.profile);
    const saved = await store.saveMatchProfile(
      profile,
      request.user.uid,
      request.supabase,
    );
    response.json({ profile: saved });
  } catch (error) {
    next(error);
  }
});

app.get("/api/matching/discover/public", async (_request, response, next) => {
  try {
    response.json({ profiles: await store.listPublicMatchProfiles() });
  } catch (error) {
    next(error);
  }
});

app.get(
  "/api/matching/discover",
  requireAuth,
  async (request, response, next) => {
    try {
      response.json({
        profiles: await store.listMatchProfiles(
          request.user.uid,
          request.supabase,
        ),
      });
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/api/matching/connections",
  requireAuth,
  async (request, response, next) => {
    try {
      const { recipientId, note } = connectionRequestSchema.parse(request.body);
      if (recipientId === request.user.uid) {
        return response.status(400).json({
          error: "You cannot request an introduction to yourself.",
          code: "SELF_CONNECTION",
        });
      }
      const connection = await store.requestConnection(
        recipientId,
        note,
        request.user.uid,
        request.supabase,
      );
      return response.status(201).json({ connection });
    } catch (error) {
      return next(error);
    }
  },
);

app.get("/api/ledger", requireAuth, async (request, response, next) => {
  try {
    const limit = Math.min(Number(request.query.limit ?? 100), 250);
    const [evidence, agentRuns] = await Promise.all([
      store.listEvidence(limit, request.user.uid, request.supabase),
      store.listAgentRuns(30, request.user.uid, request.supabase),
    ]);
    response.json({ evidence, agentRuns });
  } catch (error) {
    next(error);
  }
});

app.get("/api/evidence/summary", requireAuth, async (request, response, next) => {
  try {
    const [evidence, agentRuns] = await Promise.all([
      store.listEvidence(1000, request.user.uid, request.supabase),
      store.listAgentRuns(250, request.user.uid, request.supabase),
    ]);
    response.json(summarizeEvidence(evidence, agentRuns));
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/evidence",
  requireAuth,
  requireEvidenceAdmin,
  async (request, response, next) => {
    try {
      const event = evidenceSchema.parse(request.body);
      const saved = await store.addEvidence(
        event,
        request.user.uid,
        request.supabase,
      );
      log("INFO", "evidence_recorded", {
        evidenceId: saved.id,
        evidenceType: saved.type,
        status: saved.status,
      });
      response.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  },
);

app.post(
  "/api/agents/founder-sprint",
  requireAuth,
  rateLimitAgents,
  async (request, response, next) => {
    const runId = randomUUID();
    const startedAt = Date.now();
    try {
      const { profile } = founderSprintSchema.parse(request.body);
      const evidence = await store.listEvidence(
        100,
        request.user.uid,
        request.supabase,
      );
      const output = await generateFounderSprint(profile, evidence);
      const run = await store.saveAgentRun(
        {
          id: runId,
          type: "founder-sprint",
          status: "completed",
          provider: geminiProvider(),
          model: config.geminiModel,
          durationMs: Date.now() - startedAt,
          input: { profile },
          output,
          humanApprovalRequired: true,
        },
        request.user.uid,
        request.supabase,
      );
      log("INFO", "agent_run_completed", {
        runId,
        durationMs: run.durationMs,
        provider: run.provider,
      });
      response.status(201).json(run);
    } catch (error) {
      await store.saveAgentRun(
        {
          id: runId,
          type: "founder-sprint",
          status: "failed",
          provider: geminiProvider(),
          durationMs: Date.now() - startedAt,
          error: error.message,
        },
        request.user.uid,
        request.supabase,
      );
      if (error.code === "GEMINI_NOT_CONFIGURED") {
        return response.status(503).json({
          error: error.message,
          code: error.code,
        });
      }
      return next(error);
    }
  },
);

app.post(
  "/api/agents/check-in",
  requireAuth,
  rateLimitAgents,
  async (request, response, next) => {
    try {
      const { runId } = checkInSchema.parse(request.body);
      const [runs, evidence] = await Promise.all([
        store.listAgentRuns(250, request.user.uid, request.supabase),
        store.listEvidence(250, request.user.uid, request.supabase),
      ]);
      const run = runs.find((item) => item.id === runId);
      if (!run) return response.status(404).json({ error: "Agent run not found." });
      const output = await generateCheckIn({ run, evidence });
      const saved = await store.saveAgentRun(
        {
          type: "evidence-check-in",
          status: "completed",
          provider: geminiProvider(),
          model: config.geminiModel,
          parentRunId: runId,
          output,
          humanApprovalRequired: true,
        },
        request.user.uid,
        request.supabase,
      );
      return response.status(201).json(saved);
    } catch (error) {
      if (error.code === "GEMINI_NOT_CONFIGURED") {
        return response.status(503).json({
          error: error.message,
          code: error.code,
        });
      }
      return next(error);
    }
  },
);

app.post("/api/payments/checkout", requireAuth, async (request, response, next) => {
  if (!stripe || !config.stripePriceId) {
    return response.status(503).json({
      error: "Stripe Checkout is not configured.",
      code: "PAYMENTS_NOT_CONFIGURED",
    });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: config.stripePriceId, quantity: 1 }],
      success_url: `${config.publicAppUrl}/app/proof?checkout=success`,
      cancel_url: `${config.publicAppUrl}/app/proof?checkout=cancelled`,
      customer_email: request.user.email || undefined,
      client_reference_id: request.user.uid,
      metadata: {
        product: "founder-dna-sprint",
        supabaseUserId: request.user.uid,
      },
    });
    response.status(201).json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDirectory, { maxAge: config.nodeEnv === "production" ? "1h" : 0 }));

app.use((request, response, next) => {
  if (request.method !== "GET" || request.path.startsWith("/api/")) return next();
  response.sendFile(path.join(distDirectory, "index.html"));
});

app.use((error, request, response, _next) => {
  const requestId = randomUUID();
  const validationError = error instanceof z.ZodError;
  log(validationError ? "WARNING" : "ERROR", "request_failed", {
    requestId,
    method: request.method,
    path: request.path,
    message: error.message,
  });
  response.status(validationError ? 400 : 500).json({
    error: validationError
      ? "The request did not match the expected format."
      : "The request could not be completed.",
    code: validationError ? "VALIDATION_ERROR" : "INTERNAL_ERROR",
    requestId,
    ...(validationError ? { details: error.issues } : {}),
  });
});

export { app };
export default app;

const isDirectExecution =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  app.listen(config.port, "0.0.0.0", () => {
    log("INFO", "server_started", {
      port: config.port,
      geminiProvider: geminiProvider(),
      persistence: store.provider,
    });
  });
}
