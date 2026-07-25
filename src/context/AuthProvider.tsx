import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  beginLocalReview,
  createEmailAccount,
  endLocalReview,
  getLocalReviewUser,
  isGoogleAuthEnabled,
  isLocalReviewAvailable,
  isSupabaseConfigured,
  observeSupabaseAuth,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutSupabase,
  updatePassword,
  type AuthUser,
} from "../lib/authClient";

type AuthStatus = "loading" | "ready";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  configured: boolean;
  localReviewAvailable: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  googleEnabled: boolean;
  signUpEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  startLocalReview: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(() => getLocalReviewUser());

  useEffect(() => {
    if (getLocalReviewUser()) {
      setStatus("ready");
      return;
    }
    if (!isSupabaseConfigured) {
      setStatus("ready");
      return;
    }

    const unsubscribe = observeSupabaseAuth((nextUser) => {
      setUser(getLocalReviewUser() ?? nextUser);
      setStatus("ready");
    });

    return unsubscribe;
  }, []);

  const signInEmail = useCallback(async (email: string, password: string) => {
    setUser(await signInWithEmail(email, password));
  }, []);

  const signUpEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await createEmailAccount(name, email, password);
      if (result.user) setUser(result.user);
      return {
        requiresEmailConfirmation: result.requiresEmailConfirmation,
      };
    },
    [],
  );

  const signInGoogleAccount = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordReset(email);
  }, []);

  const changePassword = useCallback(async (password: string) => {
    await updatePassword(password);
  }, []);

  const startLocalReview = useCallback(() => {
    setUser(beginLocalReview());
  }, []);

  const signOut = useCallback(async () => {
    endLocalReview();
    await signOutSupabase();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      configured: isSupabaseConfigured,
      localReviewAvailable: isLocalReviewAvailable,
      googleEnabled: isGoogleAuthEnabled,
      signInEmail,
      signUpEmail,
      signInGoogle: signInGoogleAccount,
      resetPassword,
      changePassword,
      startLocalReview,
      signOut,
    }),
    [
      resetPassword,
      changePassword,
      signInEmail,
      signInGoogleAccount,
      signOut,
      signUpEmail,
      startLocalReview,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
