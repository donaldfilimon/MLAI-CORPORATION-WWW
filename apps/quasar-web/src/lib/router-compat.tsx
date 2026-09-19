"use client";

/**
 * react-router-dom → Next.js compatibility shim.
 *
 * The SPA was written against react-router v7; under Next the module specifier
 * "react-router-dom" is aliased here (tsconfig paths + next.config webpack
 * alias), so the 25 importing files keep their code unchanged while getting
 * Next primitives underneath:
 *   Link / NavLink  → next/link  (to= mapped to href=)
 *   useLocation     → usePathname + search/hash from window
 *   useNavigate     → next/navigation router.push / replace
 *   useParams       → next/navigation useParams
 *   useSearchParams → next/navigation (read-only tuple shape preserved)
 *
 * Router/Routes/Route/Outlet/BrowserRouter are intentionally absent — routing
 * structure lives in app/, and nothing inside the Next tree imports them.
 */

import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import {
  forwardRef,
  useMemo,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";

type To = string | { pathname?: string; search?: string; hash?: string };

function toHref(to: To): string {
  if (typeof to === "string") return to;
  return `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;
}

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: To;
  replace?: boolean;
  state?: unknown;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state: _state, children, ...rest },
  ref,
) {
  return (
    <NextLink href={toHref(to)} replace={replace} ref={ref} {...rest}>
      {children}
    </NextLink>
  );
});

type NavLinkRenderState = { isActive: boolean; isPending: boolean };

export interface NavLinkProps
  extends Omit<LinkProps, "className" | "style" | "children"> {
  className?: string | ((state: NavLinkRenderState) => string | undefined);
  style?: CSSProperties | ((state: NavLinkRenderState) => CSSProperties | undefined);
  children?: ReactNode | ((state: NavLinkRenderState) => ReactNode);
  end?: boolean;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ to, className, style, children, end, ...rest }, ref) {
    const pathname = usePathname() ?? "/";
    const href = toHref(to);
    const target = href.split(/[?#]/)[0] || "/";
    const isActive = end
      ? pathname === target
      : pathname === target ||
        (target !== "/" && pathname.startsWith(`${target}/`));
    const state: NavLinkRenderState = { isActive, isPending: false };
    return (
      <Link
        to={to}
        ref={ref}
        className={typeof className === "function" ? className(state) : className}
        style={typeof style === "function" ? style(state) : style}
        {...rest}
      >
        {typeof children === "function" ? children(state) : children}
      </Link>
    );
  },
);

export function useLocation() {
  // Deliberately avoids useNextSearchParams(): that hook forces a Suspense
  // boundary at prerender time, and every useLocation consumer here keys off
  // pathname only. search/hash are read from window (client components run
  // after hydration for any code that actually inspects them).
  const pathname = usePathname() ?? "/";
  return useMemo(
    () => ({
      pathname,
      search: typeof window !== "undefined" ? window.location.search : "",
      hash: typeof window !== "undefined" ? window.location.hash : "",
      state: null,
      key: "default",
    }),
    [pathname],
  );
}

export function useNavigate() {
  const router = useRouter();
  return useMemo(
    () =>
      (to: To | number, options?: { replace?: boolean }) => {
        if (typeof to === "number") {
          if (to < 0) router.back();
          else router.forward();
          return;
        }
        const href = toHref(to);
        if (options?.replace) router.replace(href);
        else router.push(href);
      },
    [router],
  );
}

export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  return (useNextParams() ?? {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (next: URLSearchParams | string) => void,
] {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const value = useMemo(
    () => new URLSearchParams(params?.toString() ?? ""),
    [params],
  );
  const setValue = (next: URLSearchParams | string) => {
    const qs = typeof next === "string" ? next : next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };
  return [value, setValue];
}
