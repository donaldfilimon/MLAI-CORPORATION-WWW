import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clientIpOf,
  destroySessionCookie,
  getSession,
  setSessionCookie,
  toPublicUser,
  type SessionData,
} from "@/lib/server/session";

/**
 * `session.ts` seals the auth cookie, so it is the most security-sensitive module
 * in `src/lib/server/` — and it was the one module without a test, while every
 * sibling (db, rate-limit, llm, workos) had one.
 *
 * Everything here runs in the suite's `node` environment: the module touches only
 * `Request`, `Headers`, `process.env`, and iron-session. No jsdom.
 */

const SECRET = "test-session-secret-at-least-32-chars-long";

const BASE: SessionData = {
  userId: "user_123",
  email: "operator@example.com",
  accessToken: "access-token-value",
  refreshToken: "refresh-token-value",
};

function reqWith(headers: Record<string, string> = {}): Request {
  return new Request("https://mlai-corp.com/api/auth/me", { headers });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("clientIpOf", () => {
  it("prefers Cloudflare's overwritten connecting IP over a spoofed forwarding chain", () => {
    expect(clientIpOf(reqWith({
      "cf-connecting-ip": "203.0.113.55",
      "x-forwarded-for": "198.51.100.77, 203.0.113.55, 10.0.0.1",
    }))).toBe("203.0.113.55");
  });

  it("fails closed on forwarding headers without Cloudflare in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(clientIpOf(reqWith({ "x-forwarded-for": "198.51.100.77, 10.0.0.1" }))).toBe(
      "unknown",
    );
  });

  it("rejects arbitrary non-IP header values", () => {
    expect(clientIpOf(reqWith({ "cf-connecting-ip": "attacker", "x-real-ip": "also-not-ip" }))).toBe(
      "unknown",
    );
  });

  it("takes the leftmost X-Forwarded-For hop, not the last", () => {
    // The leftmost entry is the original client. Using any other position lets a
    // caller append junk hops to manufacture a fresh identity per request, which
    // would defeat both the session binding and the rate limiter that keys on it.
    expect(clientIpOf(reqWith({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 10.0.0.2" }))).toBe(
      "203.0.113.7",
    );
  });

  it("trims surrounding whitespace on the chosen hop", () => {
    expect(clientIpOf(reqWith({ "x-forwarded-for": "  203.0.113.7 , 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
  });

  it("falls through to x-real-ip when the leftmost hop is empty rather than taking hop two", () => {
    // Deliberate: a header like ", 1.2.3.4" must NOT resolve to 1.2.3.4, or the
    // leftmost-hop guarantee above is trivially bypassed with a leading comma.
    expect(clientIpOf(reqWith({ "x-forwarded-for": ", 1.2.3.4", "x-real-ip": "198.51.100.9" }))).toBe(
      "198.51.100.9",
    );
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    expect(
      clientIpOf(reqWith({ "x-forwarded-for": "203.0.113.7", "x-real-ip": "198.51.100.9" })),
    ).toBe("203.0.113.7");
  });

  it('returns the literal "unknown" when neither header is present', () => {
    expect(clientIpOf(reqWith())).toBe("unknown");
  });
});

describe("toPublicUser", () => {
  it("strips both tokens and keeps everything else", () => {
    const pub = toPublicUser({ ...BASE, company: "MLAI" });
    expect(pub).not.toHaveProperty("accessToken");
    expect(pub).not.toHaveProperty("refreshToken");
    expect(pub.userId).toBe("user_123");
    expect(pub.company).toBe("MLAI");
  });
});

describe("session secret policy", () => {
  it("throws in production when SESSION_SECRET is too short", async () => {
    // Fails closed at REQUEST time, not import time — a guessable secret means
    // forgeable sessions, but deferring the check lets Next compile route
    // handlers during build analysis without production secrets present.
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "too-short");
    await expect(setSessionCookie(reqWith(), BASE)).rejects.toThrow(/SESSION_SECRET/);
  });

  it("throws in production when SESSION_SECRET is unset entirely", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    await expect(setSessionCookie(reqWith(), BASE)).rejects.toThrow(/required in production/);
  });

  it("falls back to the dev secret outside production instead of throwing", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", "too-short");
    await expect(setSessionCookie(reqWith(), BASE)).resolves.toContain("mlai_session=");
  });
});

describe("cookie construction", () => {
  it("sets HttpOnly, SameSite=Lax and the 7-day TTL, and omits Secure off production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", SECRET);
    const cookie = await setSessionCookie(reqWith(), BASE);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain(`Max-Age=${60 * 60 * 24 * 7}`);
    expect(cookie).not.toContain("Secure");
  });

  it("adds Secure in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", SECRET);
    expect(await setSessionCookie(reqWith(), BASE)).toContain("; Secure");
  });

  it("destroySessionCookie expires immediately", () => {
    vi.stubEnv("NODE_ENV", "development");
    const cookie = destroySessionCookie();
    expect(cookie).toContain("mlai_session=;");
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("HttpOnly");
  });
});

/** Turn a Set-Cookie string into the Cookie header a follow-up request sends. */
function asCookieHeader(setCookie: string): string {
  return setCookie.split(";")[0] ?? "";
}

describe("seal → unseal round-trip and session binding", () => {
  const bound = { "x-forwarded-for": "203.0.113.7", "user-agent": "MLAI-Test/1.0" };

  async function sealed(headers: Record<string, string>) {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", SECRET);
    return asCookieHeader(await setSessionCookie(reqWith(headers), BASE));
  }

  it("round-trips the session when IP and User-Agent both match", async () => {
    const cookie = await sealed(bound);
    const session = await getSession(reqWith({ ...bound, cookie }));
    expect(session?.userId).toBe("user_123");
    // The tokens survive sealing — only toPublicUser strips them.
    expect(session?.accessToken).toBe("access-token-value");
  });

  it("rejects a session replayed from a different IP", async () => {
    const cookie = await sealed(bound);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const session = await getSession(
      reqWith({ ...bound, "x-forwarded-for": "198.51.100.9", cookie }),
    );
    expect(session).toBeNull();
  });

  it("rejects a session replayed with a different User-Agent", async () => {
    const cookie = await sealed(bound);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const session = await getSession(reqWith({ ...bound, "user-agent": "Other/2.0", cookie }));
    expect(session).toBeNull();
  });

  // Regression guard for an authentication bypass this suite found. iron-session
  // resolves a malformed or forged seal to `{}` instead of throwing, and every
  // protected route gates with `if (!user) return 401` — so a truthy `{}` passed
  // the check. Any request carrying `mlai_session=<anything>` was treated as
  // authenticated, with an undefined userId and email flowing downstream
  // (/api/llm/chat being the worst reachable case).
  it.each([
    ["garbage", "not-a-real-seal"],
    ["a plausible iron-session prefix", "Fe26.2**deadbeef"],
    ["dot-separated segments", "abc.def.ghi"],
    ["empty value", ""],
  ])("rejects a forged cookie: %s", async (_label, value) => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", SECRET);
    expect(await getSession(reqWith({ cookie: `mlai_session=${value}` }))).toBeNull();
  });

  it("rejects a validly sealed payload that carries no identity", async () => {
    // Belt-and-braces on the same failure mode: even a correctly sealed cookie is
    // useless without the fields callers dereference, so it must not authenticate.
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", SECRET);
    const cookie = asCookieHeader(
      await setSessionCookie(reqWith(), { accessToken: "x" } as unknown as SessionData),
    );
    expect(await getSession(reqWith({ cookie }))).toBeNull();
  });

  it("returns null when the cookie is absent", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", SECRET);
    expect(await getSession(reqWith())).toBeNull();
  });

  it("does not match a cookie whose name merely ends with the session name", async () => {
    // The lookup is prefix-based on `mlai_session=`, so a sibling cookie like
    // `not_mlai_session=` must not be mistaken for the real one.
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SESSION_SECRET", SECRET);
    expect(await getSession(reqWith({ cookie: "not_mlai_session=abc" }))).toBeNull();
  });

  it("binds to the leftmost hop, so appending proxy hops does not defeat the check", async () => {
    const cookie = await sealed(bound);
    const session = await getSession(
      reqWith({ ...bound, "x-forwarded-for": "203.0.113.7, 10.0.0.5", cookie }),
    );
    expect(session?.userId).toBe("user_123");
  });
});
