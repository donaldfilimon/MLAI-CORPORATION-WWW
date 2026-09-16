"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/brand";
import { LogoMark } from "@/components/Logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + close on Escape while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MLAI home">
          <LogoMark size={28} />
          <span className="font-display text-lg font-bold tracking-[0.2em] text-white">MLAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`font-mono text-xs uppercase tracking-[0.15em] transition-colors hover:text-white ${
                isActive(item.href) ? "text-white" : "text-slate-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="border border-wdbx/50 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-wdbx transition-colors hover:bg-wdbx hover:text-ink"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative h-8 w-8 lg:hidden"
        >
          <span
            className={`absolute left-1 right-1 top-2.5 h-px bg-white transition-transform duration-200 ${
              open ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-1 right-1 bottom-2.5 h-px bg-white transition-transform duration-200 ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t border-line bg-ink/95 backdrop-blur-md lg:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col px-6 py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex items-center justify-between border-b border-line/60 py-3 font-mono text-sm uppercase tracking-[0.15em] last:border-0 ${
                isActive(item.href) ? "text-white" : "text-slate-400"
              }`}
            >
              {item.label}
              <span aria-hidden className="text-slate-600">
                →
              </span>
            </Link>
          ))}
          <Link
            href="/contact"
            className="mt-3 mb-2 border border-wdbx bg-wdbx px-4 py-2.5 text-center font-mono text-sm font-semibold uppercase tracking-[0.15em] text-ink"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
