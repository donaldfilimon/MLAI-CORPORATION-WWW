"use client";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Brand } from "./brand.js";
import { Anchor, type LinkComponent } from "./link.js";
export interface PublicNavProps {
  /** Primary navigation entries as [label, href] pairs. */
  items?: [string, string][];
  /** Current path, used to mark the active entry. */
  currentPath?: string;
  signInHref?: string;
  workspaceHref?: string;
  contactHref?: string;
  brandMark?: string;
  Link?: LinkComponent;
}
/** SiteNav-aligned defaults — product pages first, Contact is the primary CTA. */
const defaultItems: [string, string][] = [
  ["WDBX", "/wdbx"],
  ["ABI", "/abi"],
  ["IWL", "/abbey"],
  ["Platform", "/platform"],
  ["Research", "/research"],
  ["Company", "/company"],
  ["Investors", "/investors"],
  ["Docs", "/docs"],
];
function isActive(currentPath: string, href: string) {
  if (!currentPath) return false;
  if (currentPath === href) return true;
  return href !== "/" && currentPath.startsWith(`${href}/`);
}
export function PublicNav({
  items = defaultItems,
  currentPath = "",
  signInHref = "/sign-in",
  workspaceHref = "/app",
  contactHref = "/contact",
  brandMark,
  Link = Anchor,
}: PublicNavProps) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [currentPath]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="public-header">
      <div className="header-inner">
        <Brand mark={brandMark} Link={Link} />
        <button
          ref={toggle}
          className="icon-button mobile-only"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="public-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="public-nav"
          aria-label="Primary navigation"
          className={open ? "public-nav open" : "public-nav"}
        >
          {items.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(currentPath, href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <div className="nav-actions">
            <Link href={signInHref}>Sign in</Link>
            <Link href={workspaceHref}>Console</Link>
            <Link
              className="button primary small nav-contact"
              href={contactHref}
            >
              Contact
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
