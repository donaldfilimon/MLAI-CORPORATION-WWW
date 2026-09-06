/**
 * Server-side calls to Google Drive and Microsoft Graph, mapped onto the
 * `WorkspaceFile` shape the console already renders.
 *
 * Both use read-only endpoints and both are called with a per-user access
 * token minted in `workspace-tokens.ts`. Neither token nor raw provider
 * payload leaves this layer: the routes return only mapped `WorkspaceFile`
 * rows, so a provider field we did not ask for cannot leak into the client.
 *
 * A row the provider returns that we cannot render (no id, no link, a folder)
 * is dropped rather than half-rendered — one odd item must not blank a source.
 */
import {
  kindFromMimeType,
  type WorkspaceFile,
  type WorkspaceSourceId,
} from "@/lib/workspace-sources";

/** Bounded so a large Drive cannot turn one console load into a slow page. */
const PAGE_SIZE = 100;

export function windowStartIso(days: number, now: number = Date.now()): string {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.min(Math.floor(days), 365) : 30;
  return new Date(now - safeDays * 24 * 60 * 60 * 1000).toISOString();
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** Both providers report size as a string or a number depending on endpoint. */
function bytes(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isoOrNull(value: unknown): string | null {
  const raw = text(value);
  if (!raw || Number.isNaN(Date.parse(raw))) return null;
  return new Date(raw).toISOString();
}

async function readJson(response: Response, provider: string): Promise<unknown> {
  if (!response.ok) {
    // Status only. Provider error bodies can echo the query and, on some
    // endpoints, parts of the credential — none of it belongs in a log line.
    throw new Error(`${provider} responded ${response.status}`);
  }
  return response.json();
}

/* ── Google Drive ─────────────────────────────────────────────────────────── */

const DRIVE_FIELDS =
  "files(id,name,mimeType,modifiedTime,size,webViewLink,owners(displayName,emailAddress))";

export function mapDriveFile(input: unknown): WorkspaceFile | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;

  const id = text(row.id);
  const title = text(row.name);
  const modified = isoOrNull(row.modifiedTime);
  const url = text(row.webViewLink);
  if (!id || !title || !modified || !url) return null;

  const mimeType = text(row.mimeType);
  // Folders are navigation, not documents; the Files view lists documents.
  if (mimeType === "application/vnd.google-apps.folder") return null;

  const owners = Array.isArray(row.owners) ? row.owners : [];
  const firstOwner = owners[0] as Record<string, unknown> | undefined;

  return {
    id: `google-drive:${id}`,
    title,
    kind: kindFromMimeType(mimeType),
    source: "google-drive",
    modified,
    sizeBytes: bytes(row.size),
    url,
    owner: firstOwner ? text(firstOwner.displayName) ?? text(firstOwner.emailAddress) : null,
  };
}

export async function fetchDriveFiles(
  accessToken: string,
  days: number,
  fetchImpl: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<WorkspaceFile[]> {
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  // Single-quoted literal inside the Drive query language; the value is an ISO
  // timestamp we generated, so it carries no quote to escape.
  url.searchParams.set("q", `trashed = false and modifiedTime > '${windowStartIso(days)}'`);
  url.searchParams.set("fields", DRIVE_FIELDS);
  url.searchParams.set("orderBy", "modifiedTime desc");
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  url.searchParams.set("spaces", "drive");

  const response = await fetchImpl(url.toString(), {
    signal,
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
  });
  const body = await readJson(response, "Google Drive");
  const rows =
    body && typeof body === "object" && Array.isArray((body as { files?: unknown }).files)
      ? (body as { files: unknown[] }).files
      : [];
  return rows.map(mapDriveFile).filter((file): file is WorkspaceFile => file !== null);
}

/* ── Microsoft Graph ──────────────────────────────────────────────────────── */

export function mapGraphItem(input: unknown): WorkspaceFile | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;

  // `/me/drive/recent` returns shared items as a remoteItem wrapper; the real
  // metadata lives inside it.
  const remote = row.remoteItem && typeof row.remoteItem === "object"
    ? (row.remoteItem as Record<string, unknown>)
    : null;
  const item = remote ?? row;

  if (item.folder) return null;

  const id = text(item.id) ?? text(row.id);
  const title = text(item.name) ?? text(row.name);
  const modified = isoOrNull(item.lastModifiedDateTime ?? row.lastModifiedDateTime);
  const url = text(item.webUrl) ?? text(row.webUrl);
  if (!id || !title || !modified || !url) return null;

  const file = item.file && typeof item.file === "object" ? (item.file as Record<string, unknown>) : null;
  const modifiedBy =
    item.lastModifiedBy && typeof item.lastModifiedBy === "object"
      ? ((item.lastModifiedBy as Record<string, unknown>).user as Record<string, unknown> | undefined)
      : undefined;

  return {
    id: `sharepoint:${id}`,
    title,
    kind: kindFromMimeType(file ? text(file.mimeType) : null),
    source: "sharepoint",
    modified,
    sizeBytes: bytes(item.size ?? row.size),
    url,
    owner: modifiedBy ? text(modifiedBy.displayName) : null,
  };
}

/**
 * Graph's `/me/drive/recent` has no server-side date filter, so the window is
 * applied here. That is a real filter over real rows, not a trim for looks:
 * without it the console would show items older than the stated window.
 */
export async function fetchGraphFiles(
  accessToken: string,
  days: number,
  fetchImpl: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<WorkspaceFile[]> {
  const url = new URL("https://graph.microsoft.com/v1.0/me/drive/recent");
  url.searchParams.set("$top", String(PAGE_SIZE));

  const response = await fetchImpl(url.toString(), {
    signal,
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
  });
  const body = await readJson(response, "Microsoft Graph");
  const rows =
    body && typeof body === "object" && Array.isArray((body as { value?: unknown }).value)
      ? (body as { value: unknown[] }).value
      : [];

  const cutoff = Date.parse(windowStartIso(days));
  return rows
    .map(mapGraphItem)
    .filter((file): file is WorkspaceFile => file !== null)
    .filter((file) => Date.parse(file.modified) >= cutoff);
}

/* ── connected-account identity ───────────────────────────────────────────── */

/**
 * The email of the account just connected, shown in the console so a user can
 * see which account is attached. Best-effort: a failure here must not fail the
 * connection itself, so callers treat null as "unknown account".
 */
export async function fetchAccountEmail(
  source: WorkspaceSourceId,
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const endpoint =
      source === "google-drive"
        ? "https://www.googleapis.com/oauth2/v3/userinfo"
        : "https://graph.microsoft.com/v1.0/me";
    const response = await fetchImpl(endpoint, {
      headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    if (!body || typeof body !== "object") return null;
    const row = body as Record<string, unknown>;
    return text(row.email) ?? text(row.mail) ?? text(row.userPrincipalName);
  } catch {
    return null;
  }
}
