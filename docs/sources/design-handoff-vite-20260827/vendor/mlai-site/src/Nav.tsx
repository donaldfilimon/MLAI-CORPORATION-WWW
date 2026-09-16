import Link from "./next-link";
import { usePathname } from "./next-navigation";
import { useEffect, useId, useRef, useState } from "react";
import { nav } from "./brand";
import { LogoMark } from "./Logo";

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu on SPA route change (react-router pathname).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + Escape + basic focus trap while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const sheet = document.getElementById(menuId);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusable = sheet.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || active === toggleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [open, menuId]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const closeSheet = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MLAI home">
          <LogoMark size={28} />
          <span className="font-display text-lg font-bold tracking-[0.2em] text-white">MLAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
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
            aria-current={isActive("/contact") ? "page" : undefined}
            className="border border-wdbx/50 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-wdbx transition-colors hover:bg-wdbx hover:text-ink"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={menuId}
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
        id={menuId}
        hidden={!open}
        aria-hidden={!open}
        className={`overflow-hidden border-t border-line bg-ink/95 backdrop-blur-md lg:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col px-6 py-2" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSheet}
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
            onClick={closeSheet}
            aria-current={isActive("/contact") ? "page" : undefined}
            className="mt-3 mb-2 border border-wdbx bg-wdbx px-4 py-2.5 text-center font-mono text-sm font-semibold uppercase tracking-[0.15em] text-ink"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
