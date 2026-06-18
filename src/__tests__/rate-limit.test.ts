import { describe, it, expect } from "vitest";
import { rateLimit } from "../lib/server/rate-limit";

// Each test uses a unique limiter `name` so the module-level in-memory store
// is isolated between tests (no shared-state bleed).
function reqWith(xff: string): Request {
  return new Request("https://example.test/api/x", {
    headers: { "x-forwarded-for": xff },
  });
}

describe("rateLimit — keys on the leftmost X-Forwarded-For IP", () => {
  it("appended proxy hops cannot mint a fresh bucket (bypass is closed)", () => {
    const name = `bypass-${Math.random()}`;
    const opts = { windowMs: 60_000, max: 3 };
    // Same client (1.2.3.4), a different appended hop on every call. Pre-fix,
    // each distinct raw header was its own bucket → unlimited. Post-fix they
    // all collapse to the leftmost IP and share one bucket.
    expect(rateLimit(name, reqWith("1.2.3.4, hop-a"), opts)).toBe(true); // 1
    expect(rateLimit(name, reqWith("1.2.3.4, hop-b"), opts)).toBe(true); // 2
    expect(rateLimit(name, reqWith("1.2.3.4, hop-c"), opts)).toBe(true); // 3
    expect(rateLimit(name, reqWith("1.2.3.4, hop-d"), opts)).toBe(false); // over limit
  });

  it("keeps distinct client IPs in distinct buckets", () => {
    const name = `distinct-${Math.random()}`;
    const opts = { windowMs: 60_000, max: 1 };
    expect(rateLimit(name, reqWith("10.0.0.1"), opts)).toBe(true);
    expect(rateLimit(name, reqWith("10.0.0.2"), opts)).toBe(true); // different client → own bucket
    expect(rateLimit(name, reqWith("10.0.0.1, edge"), opts)).toBe(false); // same client as call 1 → over limit
  });

  it("falls back to x-real-ip, then 'unknown', when X-Forwarded-For is absent", () => {
    const name = `fallback-${Math.random()}`;
    const opts = { windowMs: 60_000, max: 1 };
    const realIp = new Request("https://example.test/api/x", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(rateLimit(name, realIp, opts)).toBe(true);
    expect(rateLimit(name, realIp, opts)).toBe(false);
  });
});
