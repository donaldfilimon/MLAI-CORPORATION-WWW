"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { paletteItems } from "@/lib/nav";

export function Palette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? paletteItems.filter((a) => (a.label + a.hint).toLowerCase().includes(s)) : [...paletteItems];
  }, [q]);

  useEffect(() => setSel(0), [q]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 20); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter") {
        const it = items[sel];
        if (it) { router.push(it.href); setOpen(false); }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, items, sel, router]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      role="dialog" aria-modal="true" aria-label="Command palette"
      className="fixed inset-0 z-[100] flex justify-center bg-black/70 px-4 backdrop-blur-sm"
      style={{ paddingTop: "14vh" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise h-fit w-full max-w-[520px] overflow-hidden rounded-[14px] border border-line-hi"
        style={{ background: "#0A0A0B", boxShadow: "0 24px 80px -20px rgba(0,0,0,0.9)" }}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
          <Search size={15} className="text-faint" />
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to…" aria-label="Search pages"
            className="flex-1 bg-transparent text-[14.5px] outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-dim">ESC</kbd>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-1.5">
          {items.length === 0 && <div className="p-6 text-center text-[13px] text-faint">No matches</div>}
          {items.map((it, i) => (
            <button
              key={it.href}
              onMouseEnter={() => setSel(i)}
              onClick={() => { router.push(it.href); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
              style={{ background: i === sel ? "var(--color-raise-hi)" : "transparent" }}
            >
              <span className="text-[14px]">{it.label}</span>
              <span className="text-[12px] text-faint">{it.hint}</span>
              {i === sel && <CornerDownLeft size={13} className="ml-auto text-dim" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
