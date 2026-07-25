import {
  createContextClient,
  verifyCredentials,
} from "@supabase/server/core";
import { config } from "./config.mjs";

const supabaseEnvironment = () => ({
  url: config.supabaseUrl,
  publishableKeys: {
    default: config.supabasePublishableKey,
  },
  secretKeys: config.supabaseSecretKey
    ? { default: config.supabaseSecretKey }
    : {},
  jwks: new URL(config.supabaseJwksUrl),
});

export const isAuthenticationConfigured = () =>
  Boolean(
    config.supabaseUrl &&
      config.supabasePublishableKey &&
      config.supabaseJwksUrl,
  );

export async function verifySupabaseAccessToken(token) {
  if (!isAuthenticationConfigured()) {
    throw new Error("Supabase authentication is not configured.");
  }

  const { data, error } = await verifyCredentials(
    { token, apikey: null },
    {
      auth: "user",
      env: supabaseEnvironment(),
    },
  );
  if (error) throw error;
  return data;
}

export async function requireAuth(request, response, next) {
  if (
    config.nodeEnv !== "production" &&
    request.get("x-founder-local-review") === "1"
  ) {
    request.user = {
      uid: "local-reviewer",
      email: "review@localhost",
      name: "Local reviewer",
      provider: "local-review",
      admin: true,
    };
    request.supabase = null;
    return next();
  }

  if (!isAuthenticationConfigured()) {
    return response.status(503).json({
      error: "Production authentication is not configured.",
      code: "AUTH_NOT_CONFIGURED",
    });
  }

  const authorization = request.get("authorization") ?? "";
  const match = authorization.match(/^Bearer ([^\s]+)$/);
  if (!match) {
    return response.status(401).json({
      error: "Sign in to access this workspace.",
      code: "AUTH_REQUIRED",
    });
  }

  try {
    const authentication = await verifySupabaseAccessToken(match[1]);
    const claims = authentication.userClaims;
    if (!claims?.id) throw new Error("The token has no user identity.");

    request.accessToken = authentication.token;
    request.supabase = createContextClient({
      auth: { token: authentication.token },
      env: supabaseEnvironment(),
    });
    request.user = {
      uid: claims.id,
      email: claims.email ?? "",
      name: claims.email?.split("@")[0] ?? "Founder",
      provider: "supabase",
      admin: false,
    };
    return next();
  } catch {
    return response.status(401).json({
      error: "Your session is invalid or expired. Sign in again.",
      code: "AUTH_INVALID",
    });
  }
}
