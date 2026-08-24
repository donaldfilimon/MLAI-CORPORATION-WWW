/**
 * In-memory fixed-window rate limiter for route handlers — same windows and
 * limits as the retired Hono middleware. Keyed by client IP; the IP is used
 * only in this in-memory map, never persisted.
 */

import { clientIpOf } from "./session";

type Bucket = { count: number; reset: number };

const stores = new Map<string, Map<string, Bucket>>();

/**
 * Sweep expired buckets once a store grows past this many entries.
 *
 * Without it the map only ever grows: one entry per distinct client IP, kept
 * forever, since an expired bucket is merely overwritten when that same IP
 * returns. On a long-lived instance facing the open internet that is unbounded
 * memory.
 *
 * The sweep is opportunistic and in-call rather than a `setInterval` reaper, for
 * two reasons: a module-level timer would keep a handle open for the lifetime of
 * the process, and `rate-limit.test.ts` drives time with `vi.setSystemTime` under
 * fake timers — a real interval would fight that harness. Reading `Date.now()`
 * inline keeps the tests honest.
 *
 * Behavior is unchanged by construction: a bucket with `reset < now` is already
 * treated as absent below, so deleting it is indistinguishable from leaving it.
 */
const SWEEP_THRESHOLD = 1_000;

function sweepExpired(store: Map<string, Bucket>, now: number): void {
  if (store.size < SWEEP_THRESHOLD) return;
  for (const [key, bucket] of store) {
    if (bucket.reset < now) store.delete(key);
  }
}

export function rateLimit(
  name: string,
  req: Request,
  { windowMs, max }: { windowMs: number; max: number },
): boolean {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  // session.ts prefers Cloudflare's overwritten connecting-IP header in
  // production and rejects attacker-shaped forwarding values.
  const key = clientIpOf(req);
  const now = Date.now();
  sweepExpired(store, now);
  const bucket = store.get(key);
  if (!bucket || bucket.reset < now) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
}

export function tooMany(): Response {
  return Response.json({ error: "Too many requests" }, { status: 429 });
}
