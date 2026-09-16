"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Callout, Eyebrow, ProvLegend, SpecList, StepList } from "@/components/site";

/* Three-pane docs shell: sticky nav, one content page at a time, and a ⌘K
   palette. Pages are declared once and drive the sidebar, the palette, and the
   prev/next rail, so a new page cannot appear in one and be missing from another. */

type PageId = "quickstart" | "arch" | "wdbx" | "abi" | "personas" | "prov";

type DocPage = {
  id: PageId;
  group: string;
  label: string;
  title: string;
  lead: string;
};

const PAGES: DocPage[] = [
  {
    id: "quickstart",
    group: "Getting started",
    label: "Quickstart",
    title: "Install, build, first query.",
    lead: "ABI is a Zig framework for local AI orchestration, semantic vector storage, and GPU capability reporting. Build the CLI and MCP server from a pinned toolchain; on macOS use the ./build.sh wrapper.",
  },
  {
    id: "arch",
    group: "Getting started",
    label: "Architecture overview",
    title: "Five layers, each with one job.",
    lead: "From the metal up: Apple Silicon, Apple's public frameworks, the store, the runtime, and the assistant. The trace layer spans all five.",
  },
  {
    id: "wdbx",
    group: "Platform",
    label: "WDBX API reference",
    title: "The store, as a tool surface.",
    lead: "The abi-mcp server speaks JSON-RPC 2.0 over stdio, with an optional local HTTP transport. Everything an operator can run at the terminal, an agent can call as a tool.",
  },
  {
    id: "abi",
    group: "Platform",
    label: "ABI tensor guide",
    title: "Tensors on unified memory.",
    lead: "ABI spends the GPU to make WDBX's distance math and Abbey's inference fast. Pipelines are zero-copy by construction because CPU and GPU share one pool of memory.",
  },
  {
    id: "personas",
    group: "Platform",
    label: "Persona routing guide",
    title: "Deterministic routing, inspectable weights.",
    lead: "The Abbey–Aviva–Abi framework answers one question: how do you get advanced capability without giving up governance? Routing is a trace event, not a hidden model call.",
  },
  {
    id: "prov",
    group: "Policy",
    label: "Provenance & claims",
    title: "Every number carries its proof.",
    lead: "Every published metric carries one of three classes — measured, target, or reported — and they are never conflated. This page is the standing contract.",
  },
];

const GROUP_ORDER = ["Getting started", "Platform", "Policy"] as const;

export function DocsShell({ children }: { children?: (page: DocPage) => ReactNode }) {
  const [pageId, setPageId] = useState<PageId>("quickstart");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        setQuery("");
      } else if (event.key === "Escape") {
        setPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const index = PAGES.findIndex((p) => p.id === pageId);
  const page = PAGES[index];
  const prev = PAGES[(index + PAGES.length - 1) % PAGES.length];
  const next = PAGES[(index + 1) % PAGES.length];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES;
    return PAGES.filter((p) => `${p.label} ${p.title} ${p.group}`.toLowerCase().includes(q));
  }, [query]);

  function open(id: PageId) {
    setPageId(id);
    setPaletteOpen(false);
  }

  return (
    <div className="container-custom grid grid-cols-1 gap-12 pb-24 pt-10 md:grid-cols-[230px_1fr]">
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mb-7 flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-left transition-colors hover:border-cyan-500/30"
          >
            <span className="flex-1 text-sm text-text-dim/70">Search docs…</span>
            <kbd className="rounded border border-white/12 px-1.5 py-0.5 font-mono text-[10px] text-text-dim/70">
              ⌘K
            </kbd>
          </button>

          <nav aria-label="Documentation">
            {GROUP_ORDER.map((group) => (
              <div key={group} className="mb-6">
                <Eyebrow>{group}</Eyebrow>
                <ul className="mt-2.5 space-y-0.5">
                  {PAGES.filter((p) => p.group === group).map((p) => {
                    const active = p.id === pageId;
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => open(p.id)}
                          aria-current={active ? "page" : undefined}
                          className={`w-full rounded-lg border-l-2 px-2.5 py-1.5 text-left text-[13.5px] transition-colors ${
                            active
                              ? "border-cyan-400 bg-cyan-400/8 text-white"
                              : "border-transparent text-text-dim hover:text-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="min-w-0 max-w-3xl">
        <div className="label-chip mb-5">{page.group}</div>
        <h1 className="section-title">{page.title}</h1>
        <p className="section-subtitle">{page.lead}</p>

        {children ? children(page) : <DefaultPageBody page={page} />}

        <div className="mt-12 flex justify-between border-t border-white/8 pt-5">
          <button
            type="button"
            onClick={() => open(prev.id)}
            className="font-mono text-[11.5px] uppercase tracking-widest text-text-dim hover:text-white"
          >
            ← {prev.label}
          </button>
          <button
            type="button"
            onClick={() => open(next.id)}
            className="font-mono text-[11.5px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300"
          >
            {next.label} →
          </button>
        </div>
      </main>

      {paletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={() => setPaletteOpen(false)}
          className="fixed inset-0 z-100 flex justify-center bg-black/60 pt-[15vh] backdrop-blur-[4px]"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="h-fit w-[560px] overflow-hidden rounded-2xl border border-white/12 bg-popover shadow-2xl"
          >
            <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3.5">
              <span className="font-mono text-[13px] text-cyan-400">⌘K</span>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the palette exists to be typed into */}
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Jump to a page…"
                aria-label="Search documentation"
                className="flex-1 bg-transparent text-[14.5px] text-white outline-none placeholder:text-text-dim/60"
              />
              <kbd className="rounded border border-white/12 px-1.5 py-0.5 font-mono text-[10px] text-text-dim/70">
                ESC
              </kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => open(r.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-cyan-400/8"
                  >
                    <span className="w-28 font-mono text-[10px] uppercase tracking-widest text-text-dim/60">
                      {r.group}
                    </span>
                    <span className="text-sm text-white/90">{r.label}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="p-4 text-center text-sm text-text-dim/70">
                  recall@10 = 0.000 — nothing matches.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/** Minimal bodies so the shell is runnable on its own; the real pages pass a
   `children` render prop and compose `@/components/site` blocks per page. */
function DefaultPageBody({ page }: { page: DocPage }) {
  if (page.id === "wdbx") {
    return (
      <>
        <SpecList
          rows={[
            { k: "Transport", v: "JSON-RPC 2.0 over stdio" },
            { k: "Request cap", v: "64 KB" },
            { k: "Optional HTTP transport", v: "127.0.0.1:8080" },
            { k: "Port override", v: "ABI_MCP_HTTP_PORT" },
          ]}
        />
        <Callout className="mt-8" accent="wdbx" label="Opt-in persistence">
          Completions persist only when store_result is set on the request.
        </Callout>
      </>
    );
  }
  if (page.id === "quickstart") {
    return (
      <StepList
        accent="wdbx"
        steps={[
          { title: "Open a store", body: "The abi CLI creates or attaches a WDBX store on local disk." },
          { title: "Register the tools", body: "abi-mcp exposes the same runtime over MCP." },
          { title: "Attach a persona profile", body: "The profile bounds what any persona can call." },
        ]}
      />
    );
  }
  if (page.id === "prov") {
    return <ProvLegend />;
  }
  return null;
}
