import { SplashScreen } from "@capacitor/splash-screen";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { BrandSplash } from "./components/BrandSplash";
import { Layout } from "./components/Layout";
import { PublicLayout } from "./components/PublicLayout";
import { RequireAuth } from "./components/RequireAuth";
import { useAuth } from "./context/AuthProvider";
import { usePersistentProfile } from "./hooks/usePersistentProfile";
import { Navigate, Route, Routes, useLocation } from "./lib/router";
import { Assessment } from "./pages/Assessment";
import { Blueprint } from "./pages/Blueprint";
import { CofounderNetwork } from "./pages/CofounderNetwork";
import { Dashboard } from "./pages/Dashboard";
import { Evidence } from "./pages/Evidence";
import { Foundry } from "./pages/Foundry";
import { Opportunities } from "./pages/Opportunities";
import { Settings } from "./pages/Settings";
import { AuthPage } from "./pages/public/AuthPage";
import { Agencies } from "./pages/public/Agencies";
import { FoundryVision } from "./pages/public/FoundryVision";
import { HowItWorks } from "./pages/public/HowItWorks";
import { Impact } from "./pages/public/Impact";
import { Judges } from "./pages/public/Judges";
import { Landing } from "./pages/public/Landing";
import { Matching } from "./pages/public/Matching";
import { Method } from "./pages/public/Method";
import { NotFound } from "./pages/public/NotFound";
import { Privacy } from "./pages/public/Privacy";
import { PasswordReset } from "./pages/public/PasswordReset";

const SPLASH_SESSION_KEY = "founder-dna-splash-seen-v1";

const pageMetadata: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Founder DNA — From overlooked potential to new employers",
    description:
      "Identify latent founder potential, validate local opportunity, and incubate evidence-backed companies with human-approved AI.",
  },
  "/how-it-works": {
    title: "How it works — Founder DNA",
    description:
      "See the Founder DNA assessment, validation brief, Gemini field sprint, and proof-led decision loop.",
  },
  "/method": {
    title: "Method & trust — Founder DNA",
    description:
      "Inspect Founder DNA's scoring boundaries, AI safeguards, and verified evidence standard.",
  },
  "/impact": {
    title: "Impact thesis — Founder DNA",
    description:
      "See how Founder DNA tests an evidence-gated pathway from unemployment to employer creation.",
  },
  "/foundry": {
    title: "90-day AI Foundry — Founder DNA",
    description:
      "Explore six guarded AI workstreams designed to help operate a new company for its first 90 days.",
  },
  "/matching": {
    title: "Complementary founder matching — Founder DNA",
    description:
      "See how Founder DNA turns individual capability gaps into consent-based co-founder matching briefs.",
  },
  "/agencies": {
    title: "For workforce agencies — Founder DNA",
    description:
      "Plan a controlled, measurable founder pathway for workforce and economic-development programs.",
  },
  "/judges": {
    title: "Reviewer brief — Founder DNA",
    description:
      "Inspect the working prototype, system vision, architecture, business model, and validation boundaries.",
  },
  "/privacy": {
    title: "Privacy — Founder DNA",
    description:
      "Understand how Founder DNA handles account, assessment, AI, and evidence data.",
  },
  "/login": {
    title: "Sign in — Founder DNA",
    description: "Sign in securely to your private Founder DNA workspace.",
  },
  "/signup": {
    title: "Create a workspace — Founder DNA",
    description: "Create your Founder DNA workspace and begin the assessment.",
  },
  "/reset-password": {
    title: "Reset password — Founder DNA",
    description: "Choose a new password for your Founder DNA workspace.",
  },
  "/app": {
    title: "Founder command center — Founder DNA",
    description: "Review your founder signal, hypothesis, sprint, and proof.",
  },
  "/app/assessment": {
    title: "DNA assessment — Founder DNA",
    description: "Map how you operate under constraint through scenario choices.",
  },
  "/app/opportunities": {
    title: "Opportunity lab — Founder DNA",
    description: "Explore clearly labeled business hypotheses to validate.",
  },
  "/app/blueprint": {
    title: "Founder blueprint — Founder DNA",
    description: "Turn your operating profile into a focused validation brief.",
  },
  "/app/matches": {
    title: "Co-founder matching — Founder DNA",
    description:
      "Discover complementary founders through verified identity, skill alignment, availability, and mutual consent.",
  },
  "/app/foundry": {
    title: "The Foundry — Founder DNA",
    description: "Generate and review an auditable Gemini founder sprint.",
  },
  "/app/proof": {
    title: "Proof ledger — Founder DNA",
    description: "Record and inspect verified business evidence and agent runs.",
  },
  "/app/settings": {
    title: "Workspace settings — Founder DNA",
    description: "Manage appearance, account, infrastructure, and founder data.",
  },
};

function PublicPage({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

export default function App() {
  const auth = useAuth();
  const location = useLocation();
  const { profile, setProfile, resetProfile, syncState } = usePersistentProfile(
    auth.user?.uid,
    auth.user?.isLocalReview,
  );
  const [showSplash, setShowSplash] = useState(
    () => window.sessionStorage.getItem(SPLASH_SESSION_KEY) !== "true",
  );

  useEffect(() => {
    const nativeSplashTimer = window.setTimeout(() => {
      void SplashScreen.hide().catch(() => undefined);
    }, 120);
    return () => window.clearTimeout(nativeSplashTimer);
  }, []);

  useEffect(() => {
    const metadata = pageMetadata[location.pathname] ?? {
      title: "Page not found — Founder DNA",
      description: "The requested Founder DNA page could not be found.",
    };
    document.title = metadata.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", metadata.description);
  }, [location.pathname]);

  const completeSplash = useCallback(() => {
    window.sessionStorage.setItem(SPLASH_SESSION_KEY, "true");
    setShowSplash(false);
  }, []);

  const workspace = (content: ReactNode) => (
    <RequireAuth>
      <Layout profile={profile}>{content}</Layout>
    </RequireAuth>
  );

  return (
    <>
      {showSplash && <BrandSplash onComplete={completeSplash} />}
      <Routes>
        <Route path="/" element={<PublicPage><Landing /></PublicPage>} />
        <Route
          path="/how-it-works"
          element={<PublicPage><HowItWorks /></PublicPage>}
        />
        <Route path="/impact" element={<PublicPage><Impact /></PublicPage>} />
        <Route path="/foundry" element={<PublicPage><FoundryVision /></PublicPage>} />
        <Route path="/matching" element={<PublicPage><Matching /></PublicPage>} />
        <Route
          path="/network"
          element={<PublicPage><CofounderNetwork profile={profile} /></PublicPage>}
        />
        <Route path="/agencies" element={<PublicPage><Agencies /></PublicPage>} />
        <Route path="/judges" element={<PublicPage><Judges /></PublicPage>} />
        <Route path="/method" element={<PublicPage><Method /></PublicPage>} />
        <Route path="/privacy" element={<PublicPage><Privacy /></PublicPage>} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/reset-password" element={<PasswordReset />} />

        <Route path="/app" element={workspace(<Dashboard profile={profile} />)} />
        <Route
          path="/app/assessment"
          element={workspace(
            <Assessment
              profile={profile}
              setProfile={setProfile}
              resetProfile={resetProfile}
            />,
          )}
        />
        <Route
          path="/app/opportunities"
          element={workspace(<Opportunities profile={profile} />)}
        />
        <Route
          path="/app/blueprint"
          element={workspace(<Blueprint profile={profile} />)}
        />
        <Route
          path="/app/matches"
          element={workspace(<CofounderNetwork profile={profile} />)}
        />
        <Route
          path="/app/foundry"
          element={workspace(<Foundry profile={profile} />)}
        />
        <Route path="/app/proof" element={workspace(<Evidence />)} />
        <Route
          path="/app/settings"
          element={workspace(
            <Settings
              profile={profile}
              resetProfile={resetProfile}
              syncState={syncState}
            />,
          )}
        />

        <Route path="/assessment" element={<Navigate to="/app/assessment" replace />} />
        <Route
          path="/opportunities"
          element={<Navigate to="/app/opportunities" replace />}
        />
        <Route path="/blueprint" element={<Navigate to="/app/blueprint" replace />} />
        <Route path="/matches" element={<Navigate to="/app/matches" replace />} />
        <Route path="/proof" element={<Navigate to="/app/proof" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />
      </Routes>
    </>
  );
}


js. Module
