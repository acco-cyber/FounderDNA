import {
  Activity,
  BookOpenCheck,
  Bot,
  ChevronDown,
  Compass,
  Dna,
  Handshake,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthProvider";
import { Link, NavLink, useLocation } from "../lib/router";
import type { FounderProfile } from "../types";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const navItems = [
  { to: "/app", label: "Overview", icon: LayoutDashboard },
  { to: "/app/assessment", label: "DNA Assessment", icon: Dna },
  { to: "/app/opportunities", label: "Opportunity Lab", icon: Compass },
  { to: "/app/blueprint", label: "Founder Blueprint", icon: BookOpenCheck },
  { to: "/app/matches", label: "Co-founder Match", icon: Handshake },
  { to: "/app/foundry", label: "The Foundry", icon: Bot },
  { to: "/app/proof", label: "Proof Ledger", icon: ReceiptText },
];

const pageMeta: Record<string, { title: string; eyebrow: string }> = {
  "/app": { title: "Founder command center", eyebrow: "Founder workspace" },
  "/app/assessment": { title: "Map your founder DNA", eyebrow: "Assessment" },
  "/app/opportunities": { title: "Opportunity lab", eyebrow: "Hypothesis library" },
  "/app/blueprint": { title: "Your founder blueprint", eyebrow: "Execution plan" },
  "/app/matches": { title: "Co-founder network", eyebrow: "Complementary DNA" },
  "/app/foundry": { title: "The Foundry", eyebrow: "Agent mission control" },
  "/app/proof": { title: "Business proof ledger", eyebrow: "Evidence room" },
  "/app/settings": { title: "Workspace settings", eyebrow: "Account & preferences" },
};

interface LayoutProps {
  children: ReactNode;
  profile: FounderProfile;
}

export function Layout({ children, profile }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? pageMeta["/app"];
  const displayName = profile.name || user?.displayName || "New founder";
  const initials =
    profile.initials ||
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() ||
    "FD";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace-content">
        Skip to workspace
      </a>
      <aside className={`sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-top">
          <Link to="/app" aria-label="Founder DNA workspace">
            <BrandMark />
          </Link>
          <button
            className="icon-button sidebar-close"
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <span className="nav-label">Workspace</span>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? "is-active" : ""}`}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="sidebar-card-icon">
            <Sparkles size={16} />
          </span>
          <div>
            <strong>Evidence before scale</strong>
            <span>Run one 7-day field sprint</span>
          </div>
          <div className="mini-progress">
            <span style={{ width: profile.assessmentComplete ? "35%" : "8%" }} />
          </div>
        </div>

        <Link className="sidebar-profile" to="/app/settings">
          <span className="avatar avatar-small">{initials}</span>
          <div>
            <strong>{displayName}</strong>
            <span>
              {user?.isLocalReview
                ? "Local review session"
                : profile.city
                  ? `${profile.city}, ${profile.region}`
                  : user?.email || "Account settings"}
            </span>
          </div>
          <ChevronDown size={16} />
        </Link>
      </aside>

      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="page-heading">
            <span>{meta.eyebrow}</span>
            <h1>{meta.title}</h1>
          </div>
          <div className="topbar-actions">
            <div className="system-status">
              <i />
              <span>Human-approved</span>
            </div>
            <ThemeToggle />
            <Link
              className="icon-button topbar-settings"
              to="/app/settings"
              aria-label="Open settings"
            >
              <Settings size={18} />
            </Link>
            <Link className="topbar-avatar" to="/app/settings" aria-label="Account settings">
              {initials}
            </Link>
          </div>
        </header>
        <main id="workspace-content" className="main-content">
          <div className="page-transition" key={location.pathname}>
            {children}
          </div>
        </main>
        <footer className="app-footer">
          <span>Founder DNA · evidence-first venture operating system</span>
          <span className="footer-data-note">
            <Activity size={13} /> Hypotheses are labeled; outcomes require proof
          </span>
          <button
            className="footer-sign-out"
            type="button"
            onClick={() => void signOut()}
          >
            <LogOut size={13} /> Sign out
          </button>
        </footer>
      </div>
    </div>
  );
}
