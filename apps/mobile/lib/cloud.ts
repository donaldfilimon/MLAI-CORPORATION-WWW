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
      return { label: "Synced to your private iCloud", ok: true };
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
async function readLocal(): Promise<VaultItem[]> {
  const raw = await SecureStore.getItemAsync(FALLBACK_KEY).catch(() => null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // A corrupt or unexpectedly-shaped blob must not brick every Vault load —
    // treat it as empty; the next write self-heals by overwriting it.
    return Array.isArray(parsed) ? (parsed as VaultItem[]) : [];
  } catch {
    return [];
  }
}
async function writeLocal(items: VaultItem[]): Promise<void> {
  await SecureStore.setItemAsync(FALLBACK_KEY, JSON.stringify(items));
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
  const items = await readLocal();
  await writeLocal([item, ...items]);
  return item;
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
  const items = await readLocal();
  await writeLocal(applyEdit(items, recordName, title, body));
  return { recordName, title, body, createdAt };
}

export async function removeItem(recordName: string): Promise<void> {
  const ck = getCloudKit();
  if (ck) {
    await ck.remove(recordName);
    return;
  }
  const items = await readLocal();
  await writeLocal(items.filter((i) => i.recordName !== recordName));
}
