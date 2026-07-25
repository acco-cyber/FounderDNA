import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase publishable credentials are intentionally safe to ship to web and
// Android clients. Database access remains protected by Row-Level Security.
const DEFAULT_SUPABASE_URL = "https://hvbdkuytaoghdkafsrrt.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_DlG1XhMIcubBf8FF7lErIQ_wYm5fiqh";

export const supabaseUrl = String(
  import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL,
).trim();
export const supabasePublishableKey = String(
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    DEFAULT_SUPABASE_PUBLISHABLE_KEY,
).trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export const isGoogleAuthEnabled =
  String(import.meta.env.VITE_SUPABASE_GOOGLE_ENABLED ?? "false") === "true";

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Authentication is not configured. Add the Supabase URL and publishable key.",
    );
  }

  browserClient ??= createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
  return browserClient;
}
