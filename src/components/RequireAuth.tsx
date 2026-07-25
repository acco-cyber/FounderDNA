import type { ReactNode } from "react";
import { useAuth } from "../context/AuthProvider";
import { Navigate, useLocation } from "../lib/router";
import { FounderDnaIcon } from "./FounderDnaIcon";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        <FounderDnaIcon animated reversed title="Checking your session" />
        <span>Securing your workspace…</span>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(
      `${location.pathname}${location.search}${location.hash}`,
    );
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
