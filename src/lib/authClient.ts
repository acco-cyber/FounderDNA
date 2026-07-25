import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  getSupabaseClient,
  isGoogleAuthEnabled,
  isSupabaseConfigured,
} from "./supabaseClient";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  provider: "supabase" | "local-review";
  isLocalReview: boolean;
}

const LOCAL_REVIEW_KEY = "founder-dna-local-review-v1";

export { isGoogleAuthEnabled, isSupabaseConfigured };
export const isLocalReviewAvailable =
  import.meta.env.DEV ||
  String(import.meta.env.VITE_ENABLE_LOCAL_REVIEW ?? "") === "true";

function toAuthUser(user: SupabaseUser): AuthUser {
  const metadata = user.user_metadata ?? {};
  return {
    uid: user.id,
    email: user.email ?? "",
    displayName:
      String(metadata.display_name ?? metadata.full_name ?? metadata.name ?? "") ||
      user.email?.split("@")[0] ||
      "Founder",
    photoURL: String(metadata.avatar_url ?? metadata.picture ?? ""),
    emailVerified: Boolean(user.email_confirmed_at),
    provider: "supabase",
    isLocalReview: false,
  };
}

export function observeSupabaseAuth(
  listener: (user: AuthUser | null) => void,
): () => void {
  const client = getSupabaseClient();
  let active = true;

  void client.auth.getSession().then(({ data }) => {
    if (active) {
      listener(data.session?.user ? toAuthUser(data.session.user) : null);
    }
  });

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    if (active) listener(session?.user ? toAuthUser(session.user) : null);
  });

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  if (!data.user) throw new Error("The sign-in session could not be created.");
  return toAuthUser(data.user);
}

export async function createEmailAccount(
  name: string,
  email: string,
  password: string,
) {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { display_name: name.trim(), full_name: name.trim() },
      emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error("The account could not be created.");
  return {
    user: data.session ? toAuthUser(data.user) : null,
    requiresEmailConfirmation: !data.session,
  };
}

export async function signInWithGoogle() {
  if (!isGoogleAuthEnabled) {
    throw new Error("Google sign-in has not been enabled for this deployment.");
  }
  const { error } = await getSupabaseClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/app`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email.trim(),
    { redirectTo: `${window.location.origin}/reset-password` },
  );
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) throw error;
}

export async function signOutSupabase() {
  if (!isSupabaseConfigured) return;
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}

export function getLocalReviewUser(): AuthUser | null {
  if (!isLocalReviewAvailable) return null;
  return window.localStorage.getItem(LOCAL_REVIEW_KEY) === "active"
    ? {
        uid: "local-reviewer",
        email: "review@localhost",
        displayName: "Local reviewer",
        photoURL: "",
        emailVerified: true,
        provider: "local-review",
        isLocalReview: true,
      }
    : null;
}

export function beginLocalReview(): AuthUser {
  if (!isLocalReviewAvailable) {
    throw new Error("Local review sessions are disabled in production builds.");
  }
  window.localStorage.setItem(LOCAL_REVIEW_KEY, "active");
  return getLocalReviewUser()!;
}

export function endLocalReview() {
  window.localStorage.removeItem(LOCAL_REVIEW_KEY);
}

export async function getApiAuthHeaders(): Promise<Record<string, string>> {
  if (getLocalReviewUser()) {
    return { "X-Founder-Local-Review": "1" };
  }
  if (!isSupabaseConfigured) return {};
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export function friendlyAuthError(error: unknown): string {
  const code =
    typeof error === "object" && error && "code" in error
      ? String(error.code)
      : "";
  const messages: Record<string, string> = {
    email_exists: "An account already uses this email address.",
    user_already_exists: "An account already uses this email address.",
    invalid_credentials: "The email or password is incorrect.",
    email_not_confirmed: "Confirm your email before signing in.",
    validation_failed: "Check the email address and password, then try again.",
    over_email_send_rate_limit:
      "Too many email requests. Please wait before trying again.",
    over_request_rate_limit: "Too many attempts. Please wait and try again.",
    weak_password: "Use a stronger password with at least eight characters.",
    oauth_provider_not_supported:
      "Google sign-in has not been enabled for this deployment.",
  };
  return (
    messages[code] ??
    (error instanceof Error ? error.message : "Authentication could not be completed.")
  );
}
