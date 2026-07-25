import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

type AppLocation = {
  pathname: string;
  search: string;
  hash: string;
};

type NavigateOptions = {
  replace?: boolean;
};

type NavigateFunction = (to: string, options?: NavigateOptions) => void;

type RouterContextValue = {
  location: AppLocation;
  navigate: NavigateFunction;
};

const RouterContext = createContext<RouterContextValue | null>(null);

function readLocation(): AppLocation {
  return {
    pathname: window.location.pathname || "/",
    search: window.location.search,
    hash: window.location.hash,
  };
}

function resolveInternalUrl(to: string): URL {
  const url = new URL(to, window.location.href);
  if (url.origin !== window.location.origin) {
    throw new Error("Founder DNA navigation only accepts same-origin routes.");
  }
  return url;
}

function useRouter(): RouterContextValue {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("Router components must be rendered inside BrowserRouter.");
  }
  return router;
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<AppLocation>(readLocation);

  useEffect(() => {
    const handlePopState = () => setLocation(readLocation());
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback<NavigateFunction>((to, options = {}) => {
    const url = resolveInternalUrl(to);
    const next = `${url.pathname}${url.search}${url.hash}`;
    const commitNavigation = () => {
      window.history[options.replace ? "replaceState" : "pushState"]({}, "", next);
      setLocation(readLocation());
    };
    const documentWithTransitions = document as Document & {
      startViewTransition?: (update: () => void) => void;
    };
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (documentWithTransitions.startViewTransition && !reduceMotion) {
      documentWithTransitions.startViewTransition(commitNavigation);
    } else {
      commitNavigation();
    }
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        document.getElementById(location.hash.slice(1))?.scrollIntoView();
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.pathname]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useLocation(): AppLocation {
  return useRouter().location;
}

export function useNavigate(): NavigateFunction {
  return useRouter().navigate;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};

export function Link({ to, onClick, target, ...props }: LinkProps) {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      target === "_blank" ||
      props.download
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return <a {...props} href={to} target={target} onClick={handleClick} />;
}

type NavLinkProps = Omit<LinkProps, "className"> & {
  className?: string | ((state: { isActive: boolean }) => string);
  end?: boolean;
};

export function NavLink({ className, end = false, to, ...props }: NavLinkProps) {
  const { pathname } = useLocation();
  const targetPath = resolveInternalUrl(to).pathname;
  const isActive =
    pathname === targetPath ||
    (!end && targetPath !== "/" && pathname.startsWith(`${targetPath}/`));
  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link
      {...props}
      to={to}
      className={resolvedClassName}
      aria-current={isActive ? "page" : undefined}
    />
  );
}

type RouteProps = {
  path: string;
  element: ReactNode;
};

export function Route(_props: RouteProps) {
  return null;
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  let fallback: ReactNode = null;

  for (const child of Children.toArray(children)) {
    if (!isValidElement<RouteProps>(child)) continue;
    if (child.props.path === "*") {
      fallback = child.props.element;
    } else if (child.props.path === pathname) {
      return child.props.element;
    }
  }

  return fallback;
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}

export function Outlet() {
  return null;
}
