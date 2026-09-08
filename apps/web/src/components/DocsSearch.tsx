"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildDocsSearchIndex } from "@/lib/docs-index";
import { searchDocuments, type SearchRecord } from "@/lib/docs-search";

const MARKETING_SEARCH_PATHS = ["/docs", "/research"];

function isMarketingSearchPath(pathname: string): boolean {
  return MARKETING_SEARCH_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export interface DocsSearchProps {
  /** Controlled open state from a parent trigger (Docs sidebar / Navbar). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, registers global ⌘K / Ctrl+K on marketing docs/research routes. */
  enableHotkey?: boolean;
  /** Compact trigger button (sidebar / header). */
  showTrigger?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
}

/**
 * Local documentation search (⌘K). Ported behavior from the MLAI review
 * package: deterministic ranking, keyboard result selection, Escape closes and
 * restores focus, markup-like queries stay plain text. Does not call a model.
 */
export function DocsSearch({
  open: controlledOpen,
  onOpenChange,
  enableHotkey = true,
  showTrigger = false,
  triggerClassName,
  triggerLabel = "Search docs",
}: DocsSearchProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const statusId = useId();

  const index = useMemo(() => buildDocsSearchIndex(), []);
  const results = useMemo(
    () => searchDocuments(query, index),
    [query, index],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("search") === "1" && isMarketingSearchPath(pathname)) {
      setOpen(true);
      params.delete("search");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next);
    }
  }, [pathname, setOpen]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      // Focus after dialog paints.
      requestAnimationFrame(() => {
        document.getElementById("doc-search")?.focus();
      });
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    // Restore focus to the trigger when it is still connected and visible.
    requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      if (trigger?.isConnected && trigger.getClientRects().length) {
        trigger.focus();
      }
    });
  }, [setOpen]);

  useEffect(() => {
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("mlai:open-docs-search", onOpenEvent);
    return () => window.removeEventListener("mlai:open-docs-search", onOpenEvent);
  }, [setOpen]);

  useEffect(() => {
    if (!enableHotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.matches(
          "input, textarea, select, [contenteditable=true], [contenteditable='']",
        )
      ) {
        return;
      }
      // Console / showcase kits own ⌘K on their surfaces.
      if (
        pathname.startsWith("/console") ||
        pathname.startsWith("/showcase") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup")
      ) {
        return;
      }
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enableHotkey, pathname, setOpen, showTrigger]);

  const go = useCallback(
    (record: SearchRecord) => {
      close();
      navigate(record.href);
    },
    [close, navigate],
  );

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const hit = results[selected];
      if (hit) go(hit);
      return;
    }
    if (event.key === "Escape") {
      // Dialog also handles Escape; ensure populated fields close the dialog
      // rather than only clearing (review fix).
      event.preventDefault();
      close();
    }
  };

  const statusText = !query.trim()
    ? `Showing ${results.length} starting guides. Local search — no AI calls.`
    : results.length === 0
      ? "No documentation matches."
      : `${results.length} ${results.length === 1 ? "result" : "results"}.`;

  return (
    <>
      {showTrigger ? (
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-text-dim transition-colors hover:border-cyan-500/30 hover:text-cyan-300",
            triggerClassName,
          )}
          aria-label="Search documentation"
          onClick={() => setOpen(true)}
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-text-dim sm:inline">
            ⌘K
          </kbd>
        </button>
      ) : null}

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent
          className="gap-0 overflow-hidden bg-surface/95 p-0 sm:max-w-xl border-white/10"
          showCloseButton
        >
          <DialogHeader className="border-b border-white/10 px-4 py-3 sm:px-5">
            <DialogTitle className="text-base font-medium text-white">
              Search the documentation
            </DialogTitle>
            <DialogDescription className="text-xs text-text-dim">
              Local index over docs sections and research titles. Nothing is sent
              to a model.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <Search className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
            <Input
              id="doc-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="What would you like to understand?"
              autoComplete="off"
              aria-label="Search documentation"
              aria-controls={listId}
              aria-autocomplete="list"
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
            <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-text-dim sm:inline">
              ESC
            </kbd>
          </div>

          <div
            id={listId}
            role="listbox"
            aria-label="Documentation results"
            className="max-h-[min(24rem,50vh)] overflow-y-auto p-2"
          >
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-text-dim">
                No matches. Try another word — queries are plain text, not
                patterns.
              </p>
            ) : (
              results.map((record, index) => {
                const active = index === selected;
                return (
                  <button
                    key={record.slug}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-xl px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-cyan-400/10 ring-1 ring-cyan-400/30"
                        : "hover:bg-white/5",
                    )}
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => go(record)}
                  >
                    {record.group ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
                        {record.group}
                      </span>
                    ) : null}
                    <span className="text-sm font-medium text-white">
                      {record.title}
                    </span>
                    <span className="line-clamp-2 text-xs leading-relaxed text-text-dim">
                      {record.description}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5 text-[10px] text-text-dim sm:px-5">
            <p id={statusId} role="status" aria-live="polite">
              {statusText}
            </p>
            <span className="hidden sm:inline">↑ ↓ to choose · Enter to open</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
