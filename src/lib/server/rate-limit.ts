/**
 * In-memory fixed-window rate limiter for route handlers — same windows and
 * limits as the retired Hono middleware. Keyed by client IP; the IP is used
 * only in this in-memory map, never persisted.
 */

type Bucket = { count: number; reset: number };

const stores = new Map<string, Map<string, Bucket>>();

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
  const key =
    req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
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
