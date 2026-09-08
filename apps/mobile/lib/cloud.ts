import * as SecureStore from "expo-secure-store";
import { getCloudKit, isCloudKitAvailable, type CloudAccountStatus } from "@/modules/mlai-cloudkit";

/* ──────────────────────────────────────────────────────────────────────────
   The vault repository. When the native CloudKit module is present (a dev or
   production build), reads/writes hit the user's *private* CloudKit database.
   Otherwise — Expo Go, web, Android — it transparently falls back to an
   encrypted on-device store so the feature is still exercisable. The active
   backend is surfaced to the UI via `backend` / `describeStatus`.
   ────────────────────────────────────────────────────────────────────────── */

export const RECORD_TYPE = "VaultItem";
const FALLBACK_KEY = "mlai.vault.local.v1";

// Monotonic suffix so locally-created recordNames stay unique even when two
// adds land in the same millisecond (Date.now() alone collides → delete/edit
// would hit the wrong note and React keys would clash).
let localSeq = 0;

export type VaultItem = {
  recordName: string;
  title: string;
  body: string;
  createdAt: number;
};

export type Backend = "cloudkit" | "local";

export const backend: Backend = isCloudKitAvailable ? "cloudkit" : "local";

export type VaultStatus =
  | { backend: "cloudkit"; account: CloudAccountStatus }
  | { backend: "local"; account: "local" };

export async function getStatus(): Promise<VaultStatus> {
  const ck = getCloudKit();
  if (ck) {
    const account = await ck.getAccountStatus();
    return { backend: "cloudkit", account };
  }
  return { backend: "local", account: "local" };
}

export function describeStatus(s: VaultStatus): { label: string; ok: boolean } {
  if (s.backend === "local") return { label: "Local only — build a dev client for iCloud sync", ok: false };
  switch (s.account) {
    case "available":
      return { label: "Private iCloud account available", ok: true };
    case "noAccount":
      return { label: "No iCloud account — sign in to iCloud in Settings", ok: false };
    case "restricted":
      return { label: "iCloud restricted on this device", ok: false };
    case "temporarilyUnavailable":
      return { label: "iCloud temporarily unavailable", ok: false };
    default:
      return { label: "Checking iCloud…", ok: false };
  }
}

// ── local fallback helpers ──────────────────────────────────────────────────
export type VaultStorageErrorCode = "read" | "malformed-json" | "invalid-records" | "write" | "missing-record";

export class VaultStorageError extends Error {
  constructor(public readonly code: VaultStorageErrorCode, message: string) {
    super(message);
    this.name = "VaultStorageError";
  }
}

async function readLocal(): Promise<VaultItem[]> {
  let raw: string | null;
  try {
    raw = await SecureStore.getItemAsync(FALLBACK_KEY);
  } catch {
    throw new VaultStorageError("read", "Could not read local vault storage. Retry when device storage is available.");
  }
  if (raw === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new VaultStorageError("malformed-json", "Local vault data is unreadable JSON. Saved data has been preserved; retry after storage recovery.");
  }
  const names = new Set<string>();
  if (!Array.isArray(parsed) || !parsed.every((item: unknown) => {
    if (typeof item !== "object" || item === null) return false;
    const r = item as Record<string, unknown>;
    if (typeof r.recordName !== "string" || !r.recordName.trim() || names.has(r.recordName) ||
        typeof r.title !== "string" || typeof r.body !== "string" ||
        typeof r.createdAt !== "number" || !Number.isFinite(r.createdAt)) return false;
    names.add(r.recordName);
    return true;
  })) {
    throw new VaultStorageError("invalid-records", "Local vault records have an invalid format. Saved data has been preserved; retry after storage recovery.");
  }
  return parsed as VaultItem[];
}
async function writeLocal(items: VaultItem[]): Promise<void> {
  try {
    await SecureStore.setItemAsync(FALLBACK_KEY, JSON.stringify(items));
  } catch {
    throw new VaultStorageError("write", "Could not write local vault storage. Your draft is available to retry.");
  }
}

// Serialize the complete read/validate/write transaction within this JS runtime.
// A rejected operation releases the queue without allowing a later writer to
// bypass validation. SecureStore offers no cross-process transaction primitive.
let localMutation: Promise<unknown> = Promise.resolve();
function mutateLocal<T>(operation: () => Promise<T>): Promise<T> {
  const result = localMutation.then(operation);
  localMutation = result.catch(() => undefined);
  return result;
}

// ── pure helpers ────────────────────────────────────────────────────────────
/** Re-insert an item into a list, keeping the newest-first order `listItems`
   returns. Used to roll back a *failed* optimistic delete by restoring just the
   removed item into the current list — so notes added during the in-flight
   delete are preserved, rather than clobbered by a stale whole-list snapshot. */
export function reinsertSorted(items: VaultItem[], item: VaultItem): VaultItem[] {
  return [...items, item].sort((a, b) => b.createdAt - a.createdAt);
}

/** Apply an in-place edit to the matching item, preserving list position and
   every other field (notably `createdAt`). Pure — used for the optimistic UI
   update so an edit doesn't reorder the list. */
export function applyEdit(items: VaultItem[], recordName: string, title: string, body: string): VaultItem[] {
  return items.map((i) => (i.recordName === recordName ? { ...i, title, body } : i));
}

/** Filter a vault by a free-text query: case-insensitive substring match over
   title and body. An empty/whitespace query returns the list unchanged. Pure —
   the Vault filters the already-loaded list client-side (local-first). */
export function filterItems(items: VaultItem[], query: string): VaultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (i) => i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q),
  );
}

// ── public repository API ───────────────────────────────────────────────────
export async function listItems(limit = 50): Promise<VaultItem[]> {
  const ck = getCloudKit();
  if (ck) {
    const rows = await ck.query(RECORD_TYPE, limit);
    return rows.map((r) => ({
      recordName: r.recordName,
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      createdAt: Number(r.createdAt ?? 0),
    }));
  }
  const items = await readLocal();
  return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

export async function addItem(title: string, body: string): Promise<VaultItem> {
  const createdAt = Date.now();
  const ck = getCloudKit();
  if (ck) {
    const rec = await ck.save(RECORD_TYPE, null, { title, body, createdAt });
    return { recordName: rec.recordName, title, body, createdAt };
  }
  const item: VaultItem = { recordName: `local-${createdAt}-${localSeq++}`, title, body, createdAt };
  return mutateLocal(async () => {
    const items = await readLocal();
    await writeLocal([item, ...items]);
    return item;
  });
}

export async function updateItem(
  recordName: string,
  title: string,
  body: string,
  createdAt: number,
): Promise<VaultItem> {
  const ck = getCloudKit();
  if (ck) {
    // Passing the existing recordName updates that record in place; createdAt is
    // re-sent so the stored value (and ordering) is preserved.
    const rec = await ck.save(RECORD_TYPE, recordName, { title, body, createdAt });
    return { recordName: rec.recordName, title, body, createdAt };
  }
  return mutateLocal(async () => {
    const items = await readLocal();
    const existing = items.find((item) => item.recordName === recordName);
    if (!existing) throw new VaultStorageError("missing-record", "This note is no longer stored. Keep your draft and retry after refreshing.");
    await writeLocal(applyEdit(items, recordName, title, body));
    return { ...existing, title, body };
  });
}

export async function removeItem(recordName: string): Promise<void> {
  const ck = getCloudKit();
  if (ck) {
    await ck.remove(recordName);
    return;
  }
  await mutateLocal(async () => {
    const items = await readLocal();
    await writeLocal(items.filter((i) => i.recordName !== recordName));
  });
}
