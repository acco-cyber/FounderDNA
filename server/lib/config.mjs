const booleanFromEnv = (value, fallback = false) => {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
};

const listFromEnv = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const googleCloudProject = process.env.GOOGLE_CLOUD_PROJECT ?? "";
const nodeEnv = process.env.NODE_ENV ?? "development";
const defaultSupabaseUrl = "https://hvbdkuytaoghdkafsrrt.supabase.co";
const defaultSupabasePublishableKey =
  "sb_publishable_DlG1XhMIcubBf8FF7lErIQ_wYm5fiqh";
const supabaseUrl = process.env.SUPABASE_URL ?? defaultSupabaseUrl;

export const config = Object.freeze({
  nodeEnv,
  port: Number(process.env.PORT ?? 8080),
  googleCloudProject,
  googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION ?? "global",
  useVertexAi: booleanFromEnv(process.env.GOOGLE_GENAI_USE_VERTEXAI, true),
  useSupabase: booleanFromEnv(
    process.env.USE_SUPABASE,
    nodeEnv === "production",
  ),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  evidenceAdminKey: process.env.EVIDENCE_ADMIN_KEY ?? "",
  schedulerSecret: process.env.SCHEDULER_SECRET ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceId: process.env.STRIPE_PRICE_ID ?? "",
  publicAppUrl: process.env.PUBLIC_APP_URL ?? "http://localhost:4173",
  allowedOrigins: listFromEnv(process.env.ALLOWED_ORIGINS),
  supabaseUrl,
  supabasePublishableKey:
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    defaultSupabasePublishableKey,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
  supabaseJwksUrl:
    process.env.SUPABASE_JWKS_URL ??
    `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
});

export const geminiProvider = () => {
  if (config.useVertexAi && config.googleCloudProject) return "vertex-ai";
  if (config.geminiApiKey) return "gemini-developer-api";
  return "not-configured";
};

export const persistenceProvider = () =>
  config.useSupabase &&
  config.supabaseUrl &&
  config.supabasePublishableKey
    ? "supabase"
    : "local-file";
