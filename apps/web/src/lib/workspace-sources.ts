/**
 * Workspace sources — the fetch seam behind `/console/workspace`.
 *
 * The Files view renders `WorkspaceSourceResult[]` and knows nothing about
 * where the rows came from. Two adapters ship here:
 *
 *   - `httpWorkspaceAdapter` — the real one. Point it at a route handler that
 *     holds the Google/Microsoft credentials server-side and returns
 *     `{ files: WorkspaceFile[] }`. Nothing in this module reads a token, so
 *     no connector secret can reach the browser bundle through it.
 *   - `staticWorkspaceAdapter` — an in-memory adapter for fixtures and tests.
 *
 * Wiring checklist for the site team:
 *   1. Add `app/api/workspace/<source>/route.ts` returning `{ files: [...] }`
 *      shaped as `WorkspaceFile` (see `parseWorkspaceFile` for the accepted
 *      shape — unknown fields are dropped, malformed rows are skipped).
 *   2. Swap the fixture adapters in `views/ConsoleWorkspace.tsx` for
 *      `httpWorkspaceAdapter({ ..., endpoint: "/api/workspace/<source>" })`.
 *   3. Every handler that reads a request body must use
 *      `lib/server/body-limit.ts`; these are GETs, so they carry none.
 *
 * `loadWorkspaceSources` never rejects: a source that is down, unconfigured,
 * or empty is a rendered state, not a thrown error. An empty result is
 * deliberately distinguishable from an unconfigured one — the console shows
 * "connected, nothing in window" rather than inventing rows.
 */

/** The connected sources the Files view groups by. */
export type WorkspaceSourceId = "google-drive" | "sharepoint";

/** Google and Microsoft stay split; they are separate identities. */
export type WorkspaceIdentity = "google" | "microsoft";

export type WorkspaceFileKind = "doc" | "slides" | "sheet" | "pdf" | "other";

export interface WorkspaceFile {
  /** Stable per-source id. Used as the React key. */
  id: string;
  title: string;
  kind: WorkspaceFileKind;
  source: WorkspaceSourceId;
  /** ISO-8601. Rendered through `formatModified` so the output is stable. */
  modified: string;
  /** Null when the source does not report a size (folders, native docs). */
  sizeBytes: number | null;
  url: string;
  owner: string | null;
}

/** How far back to ask each source for. */
export interface WorkspaceWindow {
  days: number;
}

export const DEFAULT_WINDOW: WorkspaceWindow = { days: 30 };

/**
 * `empty` means the source answered with no files for the window;
 * `unconfigured` means it has no credentials wired yet. They render
 * differently and must not be collapsed into one state.
 */
export type WorkspaceSourceStatus = "ok" | "empty" | "unconfigured" | "error";

export interface WorkspaceSourceResult {
  source: WorkspaceSourceId;
  identity: WorkspaceIdentity;
  label: string;
  status: WorkspaceSourceStatus;
  files: WorkspaceFile[];
  /** Operator-facing detail for `unconfigured` / `error`. Never user content. */
  message?: string;
}

export interface WorkspaceAdapter {
  readonly id: WorkspaceSourceId;
  readonly identity: WorkspaceIdentity;
  readonly label: string;
  list(window: WorkspaceWindow, signal?: AbortSignal): Promise<WorkspaceFile[]>;
}

const KINDS: readonly WorkspaceFileKind[] = ["doc", "slides", "sheet", "pdf", "other"];

const SOURCES: readonly WorkspaceSourceId[] = ["google-drive", "sharepoint"];

/** Display labels for the type filter. Keep in sync with `KINDS`. */
export const KIND_LABEL: Record<WorkspaceFileKind, string> = {
  doc: "Docs",
  slides: "Slides",
  sheet: "Sheets",
  pdf: "PDFs",
  other: "Other",
};

/**
 * Drive and Graph both answer with MIME types; this maps the ones that carry a
 * distinct icon. Everything unrecognised is `other` rather than a guess.
 */
export function kindFromMimeType(mimeType: string | null | undefined): WorkspaceFileKind {
  if (!mimeType) return "other";
  const m = mimeType.toLowerCase();
  if (m === "application/pdf") return "pdf";
  if (m.includes("presentation") || m.includes("powerpoint")) return "slides";
  if (m.includes("spreadsheet") || m.includes("excel")) return "sheet";
  if (m.includes("document") || m.includes("msword") || m.startsWith("text/")) return "doc";
  return "other";
}

function isKind(value: unknown): value is WorkspaceFileKind {
  return typeof value === "string" && (KINDS as readonly string[]).includes(value);
}

function isSource(value: unknown): value is WorkspaceSourceId {
  return typeof value === "string" && (SOURCES as readonly string[]).includes(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Narrow one untrusted row into a `WorkspaceFile`, or `null` if it cannot be
 * rendered. Returning null (rather than throwing) keeps one malformed row from
 * blanking the whole source.
 */
export function parseWorkspaceFile(input: unknown, source: WorkspaceSourceId): WorkspaceFile | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const row = input as Record<string, unknown>;

  const id = nonEmptyString(row.id);
  const title = nonEmptyString(row.title);
  const url = nonEmptyString(row.url);
  const modified = nonEmptyString(row.modified);
  if (!id || !title || !url || !modified) return null;
  if (Number.isNaN(Date.parse(modified))) return null;

  const size = row.sizeBytes;
  const sizeBytes = typeof size === "number" && Number.isFinite(size) && size >= 0 ? size : null;

  return {
    id,
    title,
    url,
    modified,
    sizeBytes,
    kind: isKind(row.kind) ? row.kind : "other",
    source: isSource(row.source) ? row.source : source,
    owner: nonEmptyString(row.owner),
  };
}

/** In-memory adapter — fixtures, stories, and tests. */
export function staticWorkspaceAdapter(config: {
  id: WorkspaceSourceId;
  identity: WorkspaceIdentity;
  label: string;
  files: WorkspaceFile[];
}): WorkspaceAdapter {
  return {
    id: config.id,
    identity: config.identity,
    label: config.label,
    list: async () => config.files,
  };
}

/**
 * HTTP adapter. `endpoint` is a same-origin path served by a route handler
 * that talks to Google/Microsoft with server-held credentials.
 */
export function httpWorkspaceAdapter(config: {
  id: WorkspaceSourceId;
  identity: WorkspaceIdentity;
  label: string;
  endpoint: string;
  fetchImpl?: typeof fetch;
}): WorkspaceAdapter {
  return {
    id: config.id,
    identity: config.identity,
    label: config.label,
    async list(window, signal) {
      const doFetch = config.fetchImpl ?? fetch;
      const url = `${config.endpoint}?days=${encodeURIComponent(String(window.days))}`;
      const response = await doFetch(url, { signal, headers: { accept: "application/json" } });
      if (!response.ok) {
        throw new Error(`${config.label} responded ${response.status}`);
      }
      const body: unknown = await response.json();
      const rows =
        body && typeof body === "object" && Array.isArray((body as { files?: unknown }).files)
          ? ((body as { files: unknown[] }).files satisfies unknown[])
          : [];
      return rows
        .map((row) => parseWorkspaceFile(row, config.id))
        .filter((file): file is WorkspaceFile => file !== null);
    },
  };
}

function messageOf(reason: unknown): string {
  if (reason instanceof Error && reason.message) return reason.message;
  return typeof reason === "string" && reason ? reason : "Source unavailable";
}

/**
 * Run every adapter concurrently and fold the outcomes into render-ready
 * results. Rejections become `error` rows; this function does not throw.
 */
export async function loadWorkspaceSources(
  adapters: readonly WorkspaceAdapter[],
  window: WorkspaceWindow = DEFAULT_WINDOW,
  signal?: AbortSignal,
): Promise<WorkspaceSourceResult[]> {
  const settled = await Promise.allSettled(adapters.map((adapter) => adapter.list(window, signal)));

  return adapters.map((adapter, index) => {
    const outcome = settled[index]!;
    if (outcome.status === "rejected") {
      return {
        source: adapter.id,
        identity: adapter.identity,
        label: adapter.label,
        status: "error",
        files: [],
        message: messageOf(outcome.reason),
      };
    }
    const files = sortByModifiedDesc(outcome.value);
    return {
      source: adapter.id,
      identity: adapter.identity,
      label: adapter.label,
      status: files.length > 0 ? "ok" : "empty",
      files,
    };
  });
}

/** Newest first — the view's only ordering. */
export function sortByModifiedDesc(files: readonly WorkspaceFile[]): WorkspaceFile[] {
  return [...files].sort((a, b) => Date.parse(b.modified) - Date.parse(a.modified));
}

export interface WorkspaceFilter {
  /** `null` means "All". */
  kind: WorkspaceFileKind | null;
  query: string;
}

export function filterFiles(files: readonly WorkspaceFile[], filter: WorkspaceFilter): WorkspaceFile[] {
  const query = filter.query.trim().toLowerCase();
  return files.filter((file) => {
    if (filter.kind && file.kind !== filter.kind) return false;
    if (query && !file.title.toLowerCase().includes(query)) return false;
    return true;
  });
}

/** Counts for the filter pills, including the `All` total. */
export function countByKind(files: readonly WorkspaceFile[]): Record<string, number> {
  const counts: Record<string, number> = { All: files.length };
  for (const kind of KINDS) counts[KIND_LABEL[kind]] = 0;
  for (const file of files) counts[KIND_LABEL[file.kind]] = (counts[KIND_LABEL[file.kind]] ?? 0) + 1;
  return counts;
}

const SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** `null` renders as an em dash rather than "0 B", which would be a claim. */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${SIZE_UNITS[unit]}`;
}

const MODIFIED_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formatted in UTC on purpose: the same timestamp must render identically on
 * the server and in the browser, or React logs a hydration mismatch.
 */
export function formatModified(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return "—";
  return MODIFIED_FORMAT.format(new Date(parsed));
}
