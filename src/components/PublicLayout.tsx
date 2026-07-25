import {
  ArrowRight,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeProvider";
import { Link, NavLink, useLocation } from "../lib/router";
import { BrandMark } from "./BrandMark";
import { ThemeToggle } from "./ThemeToggle";

const publicNavigation = [
  { to: "/how-it-works", label: "Platform" },
  { to: "/impact", label: "Impact" },
  { to: "/agencies", label: "For agencies" },
  { to: "/method", label: "Trust" },
  { to: "/judges", label: "For judges" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="public-header">
        <div className="public-header-inner">
          <Link className="public-brand" to="/" aria-label="Founder DNA home">
            <BrandMark reversed={resolvedTheme === "dark"} tagline />
          </Link>

          <nav className="public-nav" aria-label="Public navigation">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "is-active" : "")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="public-actions">
            <ThemeToggle />
            {user ? (
              <Link className="button button-primary public-cta" to="/app">
                Open workspace <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link className="public-sign-in" to="/login">
                  Sign in
                </Link>
                <Link className="button button-primary public-cta" to="/signup">
                  Start free <ArrowRight size={15} />
                </Link>
              </>
            )}
            <button
              className="public-menu-button"
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="public-mobile-nav">
            <nav aria-label="Mobile public navigation">
              {publicNavigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? "is-active" : "")}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {!user && (
              <div>
                <Link className="button button-secondary" to="/login">
                  Sign in
                </Link>
                <Link className="button button-primary" to="/signup">
                  Start free
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main id="main-content" className="public-main">
        {children}
      </main>

      <footer className="public-footer">
        <div className="public-footer-grid">
          <div className="public-footer-brand">
            <BrandMark reversed tagline />
            <p>
              Identify overlooked founder potential, incubate evidence-backed
              companies, and verify what the market proves.
            </p>
          </div>
          <div>
            <strong>Platform</strong>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/foundry">90-day Foundry</Link>
            <Link to="/matching">DNA Matching</Link>
          </div>
          <div>
            <strong>Review</strong>
            <Link to="/impact">Impact thesis</Link>
            <Link to="/agencies">For agencies</Link>
            <Link to="/judges">Judge brief</Link>
          </div>
          <div>
            <strong>Trust</strong>
            <Link to="/privacy">Privacy</Link>
            <Link to="/method#evidence-standard">Evidence standard</Link>
            <Link to="/login">Founder login</Link>
          </div>
          <div className="public-footer-status">
            <strong>Operating principle</strong>
            <span>
              <ShieldCheck size={15} /> Human approval before action
            </span>
            <span>
              <Sparkles size={15} /> Gemini outputs stay auditable
            </span>
          </div>
        </div>
        <div className="public-footer-bottom">
          <span>© {new Date().getFullYear()} Founder DNA</span>
          <span>Potential is a hypothesis. Evidence earns the claim.</span>
        </div>
      </footer>
    </div>
  );
}
