"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Github, Search } from "lucide-react";
import { Mark } from "./Mark";
import { nav } from "@/lib/nav";
import { org } from "@/lib/brand";

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const active = (href: string) => path === href || path === `${href}/`;

  const openPalette = () =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(0,0,0,0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--color-line)" : "transparent"}`,
      }}
    >
      <nav className="mx-auto flex h-[62px] max-w-[1120px] items-center justify-between px-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark size={24} />
          <span className="font-mono text-[14.5px] font-semibold tracking-[0.09em]">MLAI</span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href} href={n.href}
              aria-current={active(n.href) ? "page" : undefined}
              className="rounded-md px-[11px] py-1.5 text-[13px] transition-colors"
              style={{
                color: active(n.href) ? "var(--color-fg)" : "var(--color-muted)",
                background: active(n.href) ? "var(--color-raise-hi)" : "transparent",
              }}
            >
              {n.label}
            </Link>
          ))}
          <button
            onClick={openPalette} aria-label="Open command palette"
            className="ml-2 flex items-center gap-1.5 rounded-md border border-line bg-raise px-2.5 py-1.5 text-faint"
          >
            <Search size={13} />
            <kbd className="font-mono text-[10px]">⌘K</kbd>
          </button>
          <a href={org.repo} target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="p-2 text-muted">
            <Github size={15} />
          </a>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-black/95 px-6 pb-[18px] pt-3 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.href} href={n.href} onClick={() => setOpen(false)}
              className="block py-2.5 text-[14.5px]"
              style={{ color: active(n.href) ? "var(--color-fg)" : "var(--color-muted)" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
