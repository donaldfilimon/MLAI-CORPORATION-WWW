import type { Context, Next } from "hono";
import type { createCookieSessionStorage } from "./session";

// ── Rate Limiter ──────────────────────────────────────────────────────────
const rateLimits = new Map<string, { count: number; reset: number }>();

export const rateLimiter = (options: { windowMs: number; max: number }) => {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const path = c.req.path;
    const key = `${ip}:${path}`;

    const now = Date.now();
    const limit = rateLimits.get(key) || {
      count: 0,
      reset: now + options.windowMs,
    };

    if (now > limit.reset) {
      limit.count = 1;
      limit.reset = now + options.windowMs;
    } else {
      limit.count++;
    }

    rateLimits.set(key, limit);

    if (limit.count > options.max) {
      return c.json(
        { error: "Too many requests, please try again later." },
        429,
      );
    }

    await next();
  };
};

// ── Request Logger & ID ───────────────────────────────────────────────────
export const loggerMiddleware = async (c: Context, next: Next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);

  const start = Date.now();
  console.log(`[${requestId}] ${c.req.method} ${c.req.url} - Started`);

  await next();

  const duration = Date.now() - start;
  console.log(
    `[${requestId}] ${c.req.method} ${c.req.url} - ${c.res.status} (${duration}ms)`,
  );
};

// ── Session Renewal ───────────────────────────────────────────────────────
// Automatically rotate session if it's older than a certain threshold
export const sessionRenewal = (
  session: ReturnType<typeof createCookieSessionStorage>,
) => {
  return async (c: Context, next: Next) => {
    const user = await session.get(c);
    if (user) {
      // In a real app, we might check an 'issuedAt' timestamp in the session.
      // Iron-session 'unsealData' doesn't easily expose this without us adding it.
      // For now, we'll just re-save it to update Max-Age on every authenticated request
      // or implement a more surgical check if needed.
      const cookie = await session.set(c, user);
      c.header("Set-Cookie", cookie);
    }
    await next();
  };
};
