"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Brand } from "./brand";
export function PublicNav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="public-header">
      <div className="header-inner">
        <Brand />
        <button
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
          className={open ? "public-nav open" : "public-nav"}
        >
          {[
            ["Architecture", "/architecture"],
            ["Products", "/platform"],
            ["Research", "/research"],
            ["Docs", "/docs"],
            ["Company", "/company"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <div className="nav-actions">
            <Link href="/sign-in">Sign in</Link>
            <Link className="button secondary small" href="/app">
              Open workspace
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
