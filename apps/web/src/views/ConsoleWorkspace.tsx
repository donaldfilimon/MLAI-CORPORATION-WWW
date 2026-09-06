/* Console → Workspace. The Files screen from the console redesign: a
   collapsible rail, a top bar with search, and Drive/SharePoint results
   grouped by source with a rows/grid toggle and type filters.

   Layered-panels direction: the rail, the top bar and the result panels each
   sit on a different surface so the shell reads as depth rather than one flat
   dark field. Colour comes from the Lab tokens in src/index.css (--ink,
   --cyan, --violet, --amber, --accent-soft, --accent-line); the design-system
   ramp in src/design/mlai-ds-tokens.css stays scoped to .mlai-ds and is
   deliberately not pulled in here.

   Data arrives through lib/workspace-sources.ts, backed by the same-origin
   /api/workspace/* handlers. Provider tokens live server-side only; this view
   never holds one. A source the user has not linked comes back as
   `unconfigured` and renders a Connect action rather than an error. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Cloud,
  File as FileIcon,
  FileText,
  Folder,
  HardDrive,
  Inbox,
  Layers,
  LayoutGrid,
  Link2 as LinkIcon,
  List,
  PanelLeft,
  Presentation,
  Search,
  Table2,
  type LucideIcon,
} from "lucide-react";
import type { WorkspaceSourceId } from "@/lib/workspace-sources";
import { SOURCE_PROVIDER, liveWorkspaceAdapters } from "@/lib/workspace-adapters";
import {
  DEFAULT_WINDOW,
  KIND_LABEL,
  countByKind,
  filterFiles,
  formatFileSize,
  formatModified,
  loadWorkspaceSources,
  type WorkspaceFile,
  type WorkspaceFileKind,
  type WorkspaceSourceResult,
} from "@/lib/workspace-sources";

type Tab = "files" | "today" | "triage" | "work" | "metrics";

/** One row of /api/workspace/connections. */
interface ProviderRow {
  provider: "google" | "microsoft";
  label: string;
  /** The server holds OAuth credentials for this provider. */
  configured: boolean;
  /** This user has linked an account. */
  connected: boolean;
  accountEmail: string | null;
  connectedAt: string | null;
}

type ConnectionState = Partial<Record<"google" | "microsoft", ProviderRow>>;

const TABS: readonly (readonly [Tab, string, LucideIcon])[] = [
  ["files", "Files", Folder],
  ["today", "Today", CalendarDays],
  ["triage", "Triage", Inbox],
  ["work", "Work", Layers],
  ["metrics", "Metrics", BarChart3],
];

const KIND_ICON: Record<WorkspaceFileKind, LucideIcon> = {
  doc: FileText,
  slides: Presentation,
  sheet: Table2,
  pdf: FileIcon,
  other: FileIcon,
};

/* Slides keep amber and sheets emerald so file kinds stay separable on sight;
   everything else takes the cyan console accent. */
const KIND_ACCENT: Record<WorkspaceFileKind, string> = {
  doc: "var(--cyan)",
  slides: "var(--amber)",
  sheet: "var(--emerald)",
  pdf: "var(--violet)",
  other: "rgba(232,237,246,0.55)",
};

const KIND_TINT: Record<WorkspaceFileKind, string> = {
  doc: "rgba(34,211,238,0.09)",
  slides: "rgba(251,191,36,0.09)",
  sheet: "rgba(52,211,153,0.09)",
  pdf: "rgba(168,85,247,0.09)",
  other: "rgba(255,255,255,0.04)",
};

const SOURCE_ICON: Record<string, LucideIcon> = {
  "google-drive": HardDrive,
  sharepoint: Cloud,
};

const FILTERS: readonly (readonly [string, WorkspaceFileKind | null])[] = [
  ["All", null],
  [KIND_LABEL.doc, "doc"],
  [KIND_LABEL.slides, "slides"],
  [KIND_LABEL.sheet, "sheet"],
  [KIND_LABEL.pdf, "pdf"],
];

/* Layered-panel surface, shared by the result panels and the empty states. */
const PANEL: React.CSSProperties = {
  background: "rgba(255,255,255,0.018)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 14,
  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
};

const ROW_GRID = "minmax(0,3fr) 110px 130px 90px";
const MONO = "var(--font-mono)";

export function ConsoleWorkspace() {
  const [tab, setTab] = useState<Tab>("files");
  const [expanded, setExpanded] = useState(true);
  const [view, setView] = useState<"rows" | "grid">("rows");
  const [kind, setKind] = useState<WorkspaceFileKind | null>(null);
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState<WorkspaceSourceResult[] | null>(null);
  const [connections, setConnections] = useState<ConnectionState>({});
  const [reload, setReload] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let live = true;
    loadWorkspaceSources(liveWorkspaceAdapters(), DEFAULT_WINDOW, controller.signal).then(
      (result) => {
        if (live) setSources(result);
      },
    );
    return () => {
      live = false;
      controller.abort();
    };
  }, [reload]);

  /* Which accounts are linked, and which providers the server can offer at
     all — an unconfigured provider gets no Connect button, because pressing it
     would only bounce off a missing client secret. */
  useEffect(() => {
    const controller = new AbortController();
    let live = true;
    fetch("/api/workspace/connections", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        if (!live || !body || typeof body !== "object") return;
        const rows = (body as { providers?: unknown }).providers;
        if (!Array.isArray(rows)) return;
        const next: ConnectionState = {};
        for (const row of rows as ProviderRow[]) next[row.provider] = row;
        setConnections(next);
      })
      .catch(() => {
        /* The console still renders; sources report their own state. */
      });
    return () => {
      live = false;
      controller.abort();
    };
  }, [reload]);

  const disconnect = useCallback(async (source: WorkspaceSourceId) => {
    await fetch(`/api/workspace/disconnect/${SOURCE_PROVIDER[source]}`, { method: "POST" });
    setReload((n) => n + 1);
  }, []);

  /* ⌘K focuses search rather than opening a palette that goes nowhere. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const allFiles = useMemo(
    () => (sources ?? []).flatMap((source) => source.files),
    [sources],
  );
  const counts = useMemo(() => countByKind(allFiles), [allFiles]);
  const matched = useMemo(
    () => filterFiles(allFiles, { kind, query }),
    [allFiles, kind, query],
  );

  const filtered = useCallback(
    (source: WorkspaceSourceResult) => filterFiles(source.files, { kind, query }),
    [kind, query],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        color: "var(--color-text)",
        display: "flex",
        fontFamily: "var(--font-sans)",
      }}
    >
      <Rail tab={tab} setTab={setTab} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar
          tab={tab}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
        />

        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px 40px" }}>
          {tab === "files" ? (
            <>
              <PageHead
                view={view}
                setView={setView}
                total={matched.length}
                loading={sources === null}
              />

              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 26 }}>
                {FILTERS.map(([label, value]) => {
                  const on = value === kind;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setKind(value)}
                      aria-pressed={on}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 999,
                        cursor: "pointer",
                        fontFamily: MONO,
                        fontSize: 10.5,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        border: `1px solid ${on ? "var(--accent-line)" : "rgba(255,255,255,0.08)"}`,
                        background: on ? "var(--accent-soft)" : "rgba(255,255,255,0.03)",
                        color: on ? "#67e8f9" : "rgba(232,237,246,0.55)",
                        transition: "all 180ms cubic-bezier(.22,1,.36,1)",
                      }}
                    >
                      {label} <span style={{ opacity: 0.5 }}>{counts[label] ?? 0}</span>
                    </button>
                  );
                })}
              </div>

              {sources === null ? (
                <Note>Loading connected sources…</Note>
              ) : (
                sources.map((source) => (
                  <SourceSection
                    key={source.source}
                    source={source}
                    files={filtered(source)}
                    view={view}
                    filtering={kind !== null || query.trim().length > 0}
                    connection={connections[SOURCE_PROVIDER[source.source]]}
                    onDisconnect={disconnect}
                  />
                ))
              )}
            </>
          ) : (
            <NotBuilt tab={tab} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── rail ─────────────────────────────────────────────────────────────────── */

function Rail({
  tab,
  setTab,
  expanded,
  onToggle,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      style={{
        width: expanded ? 208 : 60,
        flexShrink: 0,
        background: "#080b12",
        borderRight: "1px solid rgba(255,255,255,0.09)",
        display: "flex",
        flexDirection: "column",
        padding: "14px 10px",
        transition: "width 280ms cubic-bezier(.22,1,.36,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 4px 16px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 8,
            background: "linear-gradient(135deg,var(--cyan),#60a5fa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--ink)",
          }}
        >
          M
        </div>
        {expanded && (
          <div style={{ lineHeight: 1.15, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                letterSpacing: "0.16em",
                fontSize: 13,
                color: "#fff",
              }}
            >
              MLAI
            </div>
            <div style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(232,237,246,0.4)" }}>
              console
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          title={expanded ? "Collapse rail" : "Expand rail"}
          aria-label={expanded ? "Collapse rail" : "Expand rail"}
          aria-expanded={expanded}
          style={{
            marginLeft: "auto",
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.11)",
            background: "transparent",
            color: "rgba(232,237,246,0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PanelLeft size={13} strokeWidth={2} />
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {TABS.map(([id, label, Icon]) => {
          const on = id === tab;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              title={label}
              aria-current={on ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "9px 11px",
                borderRadius: 9,
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13.5,
                fontWeight: on ? 600 : 500,
                textAlign: "left",
                color: on ? "var(--color-text)" : "rgba(232,237,246,0.55)",
                background: on ? "var(--accent-soft)" : "transparent",
                boxShadow: on ? "inset 2px 0 0 var(--cyan)" : "none",
                transition: "background 180ms cubic-bezier(.22,1,.36,1)",
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  display: "flex",
                  color: on ? "var(--cyan)" : "rgba(232,237,246,0.4)",
                }}
              >
                <Icon size={16} strokeWidth={2} />
              </span>
              {expanded && (
                <span
                  style={{
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          gap: 7,
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 0",
        }}
      >
        {(
          [
            ["Abbey", "var(--emerald)"],
            ["Aviva", "var(--violet)"],
            ["Abi", "var(--cyan)"],
          ] as const
        ).map(([name, color]) => (
          <span
            key={name}
            title={name}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        ))}
      </div>
    </aside>
  );
}

/* ── top bar ──────────────────────────────────────────────────────────────── */

function Topbar({
  tab,
  query,
  setQuery,
  searchRef,
}: {
  tab: Tab;
  query: string;
  setQuery: (value: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <header
      style={{
        height: 56,
        flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.09)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 20px",
        background: "rgba(8,11,18,0.85)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: MONO,
          fontSize: 11,
          color: "rgba(232,237,246,0.4)",
          flexShrink: 0,
        }}
      >
        <span>mlai</span>
        <span aria-hidden>/</span>
        <span style={{ color: "var(--color-text)" }}>console</span>
        <span aria-hidden>/</span>
        <span style={{ color: "var(--cyan)" }}>{tab}</span>
      </div>

      <label
        style={{
          flex: 1,
          maxWidth: 520,
          display: "flex",
          alignItems: "center",
          gap: 9,
          height: 34,
          padding: "0 12px",
          borderRadius: 9,
          border: "1px solid var(--accent-line)",
          background: "rgba(34,211,238,0.05)",
        }}
      >
        <span style={{ display: "flex", color: "var(--cyan)" }}>
          <Search size={15} strokeWidth={2} />
        </span>
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search files, threads, pages"
          aria-label="Search files"
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: 0,
            outline: "none",
            color: "var(--color-text)",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
        <kbd
          style={{
            fontFamily: MONO,
            fontSize: 10,
            color: "var(--cyan)",
            border: "1px solid var(--accent-line)",
            borderRadius: 5,
            padding: "2px 5px",
          }}
        >
          ⌘K
        </kbd>
      </label>

      <span
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: MONO,
          fontSize: 10,
          padding: "5px 10px",
          borderRadius: 999,
          border: "1px solid rgba(52,211,153,0.3)",
          color: "var(--emerald)",
          background: "rgba(52,211,153,0.1)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--emerald)",
            boxShadow: "0 0 8px var(--emerald)",
          }}
        />
        on-device
      </span>
    </header>
  );
}

/* ── page head ────────────────────────────────────────────────────────────── */

function PageHead({
  view,
  setView,
  total,
  loading,
}: {
  view: "rows" | "grid";
  setView: (view: "rows" | "grid") => void;
  total: number;
  loading: boolean;
}) {
  const toggle = (id: "rows" | "grid", label: string, Icon: LucideIcon) => {
    const on = view === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setView(id)}
        aria-pressed={on}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 10px",
          borderRadius: 6,
          border: 0,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 12,
          fontWeight: 500,
          background: on ? "var(--accent-soft)" : "transparent",
          color: on ? "#67e8f9" : "rgba(232,237,246,0.55)",
        }}
      >
        <Icon size={14} strokeWidth={2} />
        {label}
      </button>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        marginBottom: 22,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: "var(--cyan)",
            marginBottom: 9,
          }}
        >
          RECENT ACROSS SOURCES
        </div>
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "var(--font-display)",
            fontSize: 31,
            fontWeight: 600,
            letterSpacing: "-0.015em",
            lineHeight: 1.08,
            color: "#fff",
          }}
        >
          Files
        </h1>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 9.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(232,237,246,0.35)",
          }}
        >
          {loading ? "Loading" : `${total} shown`} · last {DEFAULT_WINDOW.days} days
        </div>
      </div>
      <div
        style={{
          display: "flex",
          padding: 3,
          gap: 2,
          borderRadius: 9,
          border: "1px solid rgba(255,255,255,0.11)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {toggle("rows", "Rows", List)}
        {toggle("grid", "Grid", LayoutGrid)}
      </div>
    </div>
  );
}

/* ── one source ───────────────────────────────────────────────────────────── */

function SourceSection({
  source,
  files,
  view,
  filtering,
  connection,
  onDisconnect,
}: {
  source: WorkspaceSourceResult;
  files: WorkspaceFile[];
  view: "rows" | "grid";
  filtering: boolean;
  connection: ProviderRow | undefined;
  onDisconnect: (source: WorkspaceSourceId) => void;
}) {
  const Icon = SOURCE_ICON[source.source] ?? Folder;
  const tint = source.identity === "google" ? "var(--cyan)" : "var(--violet)";
  const provider = SOURCE_PROVIDER[source.source];

  return (
    <section style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
        <span style={{ display: "flex", color: tint }}>
          <Icon size={15} strokeWidth={2} />
        </span>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}>
          {source.label}
        </h2>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(232,237,246,0.4)" }}>
          {source.status === "ok"
            ? `${files.length} FILES · ${source.identity === "google" ? "MY DRIVE" : "TENANT"}`
            : source.status.toUpperCase()}
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: "linear-gradient(90deg,rgba(255,255,255,0.11),transparent)",
          }}
        />
        {connection?.connected && (
          <>
            {connection.accountEmail && (
              <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(232,237,246,0.4)" }}>
                {connection.accountEmail}
              </span>
            )}
            <button
              type="button"
              onClick={() => onDisconnect(source.source)}
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.11)",
                background: "transparent",
                color: "rgba(232,237,246,0.55)",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {source.status === "error" ? (
        <EmptyPanel
          title={`${source.label} could not be reached.`}
          detail={source.message ?? "The source returned an error."}
        />
      ) : source.status === "unconfigured" ? (
        connection && !connection.configured ? (
          <EmptyPanel
            title={`${source.label} is not available on this deployment.`}
            detail="NO OAUTH CREDENTIALS CONFIGURED FOR THIS PROVIDER"
          />
        ) : (
          <ConnectPanel label={source.label} provider={provider} accent={tint} />
        )
      ) : source.files.length === 0 ? (
        <EmptyPanel
          title={`No files returned for the last ${DEFAULT_WINDOW.days} days.`}
          detail={
            source.identity === "microsoft"
              ? "MICROSOFT 365 CONNECTED · TENANT EMPTY OR OUT OF SCOPE"
              : "SOURCE CONNECTED · NOTHING IN WINDOW"
          }
        />
      ) : files.length === 0 && filtering ? (
        <EmptyPanel
          title="Nothing matches the current filter."
          detail={`${source.files.length} file(s) in this source are hidden by the search or type filter.`}
        />
      ) : view === "rows" ? (
        <FileRows files={files} />
      ) : (
        <FileGrid files={files} />
      )}
    </section>
  );
}

function FileRows({ files }: { files: WorkspaceFile[] }) {
  return (
    <div style={{ ...PANEL, overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: ROW_GRID,
          gap: 14,
          padding: "9px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.09)",
          background: "rgba(255,255,255,0.02)",
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: "0.12em",
          color: "rgba(232,237,246,0.4)",
        }}
      >
        <span>NAME</span>
        <span>TYPE</span>
        <span>MODIFIED</span>
        <span style={{ textAlign: "right" }}>SIZE</span>
      </div>
      {files.map((file) => {
        const Icon = KIND_ICON[file.kind];
        return (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              display: "grid",
              gridTemplateColumns: ROW_GRID,
              gap: 14,
              padding: "11px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: KIND_TINT[file.kind],
                  color: KIND_ACCENT[file.kind],
                }}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
              <span
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 13.5,
                  color: "var(--color-text)",
                }}
              >
                {file.title}
              </span>
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10,
                color: KIND_ACCENT[file.kind],
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {KIND_LABEL[file.kind]}
            </span>
            <span style={{ fontSize: 12, color: "rgba(232,237,246,0.55)" }}>
              {formatModified(file.modified)}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: "rgba(232,237,246,0.4)",
                textAlign: "right",
              }}
            >
              {formatFileSize(file.sizeBytes)}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function FileGrid({ files }: { files: WorkspaceFile[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
        gap: 14,
      }}
    >
      {files.map((file) => {
        const Icon = KIND_ICON[file.kind];
        return (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noreferrer noopener"
            className="glass-card"
            style={{
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
              padding: 0,
              overflow: "hidden",
              borderRadius: 14,
            }}
          >
            <span
              style={{
                height: 104,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: KIND_TINT[file.kind],
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                color: KIND_ACCENT[file.kind],
              }}
            >
              <Icon size={30} strokeWidth={1.6} />
            </span>
            <span
              style={{
                padding: "11px 13px 13px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--color-text)",
                  lineHeight: 1.35,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.title}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9.5,
                  letterSpacing: "0.08em",
                  color: "rgba(232,237,246,0.4)",
                  textTransform: "uppercase",
                }}
              >
                {KIND_LABEL[file.kind]} · {formatModified(file.modified)} ·{" "}
                {formatFileSize(file.sizeBytes)}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

/* ── small shared pieces ──────────────────────────────────────────────────── */

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div
      style={{
        border: "1px dashed rgba(255,255,255,0.11)",
        borderRadius: 14,
        padding: 30,
        textAlign: "center",
        background: "rgba(255,255,255,0.018)",
      }}
    >
      <div style={{ fontSize: 13.5, color: "rgba(232,237,246,0.55)", marginBottom: 6 }}>{title}</div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.1em",
          color: "rgba(232,237,246,0.4)",
        }}
      >
        {detail}
      </div>
    </div>
  );
}

/* A plain link, not a form: the CSP sets `form-action 'self'`, and the connect
   route answers with a cross-origin redirect to the provider's consent screen. */
function ConnectPanel({
  label,
  provider,
  accent,
}: {
  label: string;
  provider: "google" | "microsoft";
  accent: string;
}) {
  return (
    <div
      style={{
        border: "1px dashed rgba(255,255,255,0.11)",
        borderRadius: 14,
        padding: 30,
        textAlign: "center",
        background: "rgba(255,255,255,0.018)",
      }}
    >
      <div style={{ fontSize: 13.5, color: "rgba(232,237,246,0.55)", marginBottom: 14 }}>
        Connect {label} to see your recent files here.
      </div>
      <a
        href={`/api/workspace/connect/${provider}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          border: `1px solid ${accent}`,
          color: accent,
          background: "rgba(255,255,255,0.03)",
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        <LinkIcon size={13} strokeWidth={2} />
        Connect {label}
      </a>
      <div
        style={{
          marginTop: 14,
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: "0.1em",
          color: "rgba(232,237,246,0.35)",
        }}
      >
        READ-ONLY ACCESS &middot; DISCONNECT ANY TIME
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...PANEL, padding: 24, fontSize: 13, color: "rgba(232,237,246,0.55)" }}>
      {children}
    </div>
  );
}

/* The other four tabs are designed but not built. Say so plainly rather than
   shipping a shell full of invented rows. */
function NotBuilt({ tab }: { tab: Tab }) {
  const label = TABS.find(([id]) => id === tab)?.[1] ?? tab;
  return (
    <EmptyPanel
      title={`${label} is not built yet.`}
      detail="FILES SHIPPED FIRST · REMAINING TABS FOLLOW THE SAME SHELL"
    />
  );
}
