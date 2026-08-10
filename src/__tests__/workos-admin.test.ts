import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionData } from "../lib/server/session";

const session: SessionData = {
  userId: "user_123",
  email: "donald@mlai-corp.com",
  accessToken: "test-access-token",
};

async function loadWorkos() {
  vi.resetModules();
  return import("../lib/server/workos");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("admin access policy", () => {
  it("fails closed in production when ADMIN_EMAILS is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAILS", "");

    const { checkAdminIdentity } = await loadWorkos();

    expect(checkAdminIdentity(session)).toEqual({
      ok: false,
      error: "Administrative access is not configured",
    });
  });

  it("rejects signed-in users outside the admin allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");

    const { checkAdminIdentity } = await loadWorkos();

    expect(checkAdminIdentity(session)).toEqual({
      ok: false,
      error: "Administrative access required",
    });
  });

  it("accepts allowlisted admin emails case-insensitively", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAILS", "ADMIN@example.com, Donald@MLAI-Corp.com ");

    const { checkAdminIdentity } = await loadWorkos();

    expect(checkAdminIdentity(session)).toEqual({ ok: true });
  });
});

// Single-slash-prefixed inputs that the WHATWG URL parser nonetheless resolves
// to https://evil.com/ when used as a relative URL: it reads a backslash as a
// path separator (so `/\` is really `//`) and strips tab/CR/LF from anywhere in
// the input before parsing (leaving `//evil.com` again). The old guard checked
// only a literal `//` prefix, so all five rode straight through `state` and out
// of the callback as a redirect for a freshly authenticated user.
const OFF_SITE_VECTORS = [
  "/\\evil.com",
  "/\r/evil.com",
  "/\n/evil.com",
  "/\t/evil.com",
  "/\r\n/evil.com",
];

describe("getReturnTo — open-redirect guard", () => {
  it("rejects unsafe targets, returning '/'", async () => {
    const { getReturnTo } = await loadWorkos();
    // missing / non-string
    expect(getReturnTo(undefined)).toBe("/");
    expect(getReturnTo(null)).toBe("/");
    expect(getReturnTo("")).toBe("/");
    // absolute / protocol-relative — the classic open-redirect vectors
    expect(getReturnTo("//evil.com")).toBe("/");
    expect(getReturnTo("https://evil.com")).toBe("/");
    expect(getReturnTo("javascript:alert(1)")).toBe("/");
    // internal API paths must not be a post-auth landing target
    expect(getReturnTo("/api/auth/login")).toBe("/");
    // backslash + C0 whitespace — see OFF_SITE_VECTORS above
    for (const vector of OFF_SITE_VECTORS) expect(getReturnTo(vector)).toBe("/");
    // the rest of C0 and DEL are rejected too, so the guard is a range rather
    // than an enumeration of whatever today's parser happens to strip
    expect(getReturnTo("/\u0001/evil.com")).toBe("/");
    expect(getReturnTo("/blog\u001F/evil.com")).toBe("/");
    expect(getReturnTo("/blog\u007Fpost")).toBe("/");
  });

  it("passes through safe same-origin relative paths unchanged", async () => {
    const { getReturnTo } = await loadWorkos();
    expect(getReturnTo("/")).toBe("/");
    expect(getReturnTo("/blog/post")).toBe("/blog/post");
    expect(getReturnTo("/console")).toBe("/console");
    // legitimate query/fragment/percent-encoding must survive
    expect(getReturnTo("/blog?page=2#top")).toBe("/blog?page=2#top");
    expect(getReturnTo("/team/donald%20filimon")).toBe("/team/donald%20filimon");
  });
});

// getReturnTo is a character-level predicate; this exercises the real sink with
// the real WHATWG parser, which is the check that actually has to hold.
describe("redirectToFrontend — resolved target never leaves our origin", () => {
  it("keeps every known escape vector on the frontend origin", async () => {
    vi.stubEnv("FRONTEND_URL", "https://mlai-corp.com");
    const { redirectToFrontend } = await loadWorkos();

    for (const vector of [...OFF_SITE_VECTORS, "//evil.com", "https://evil.com"]) {
      expect(new URL(redirectToFrontend(vector)).origin).toBe("https://mlai-corp.com");
    }
    expect(redirectToFrontend()).toBe("https://mlai-corp.com/");
  });

  it("preserves legitimate same-origin destinations", async () => {
    vi.stubEnv("FRONTEND_URL", "https://mlai-corp.com");
    const { redirectToFrontend } = await loadWorkos();

    expect(redirectToFrontend("/console")).toBe("https://mlai-corp.com/console");
    expect(redirectToFrontend("/login?error=auth_failed")).toBe(
      "https://mlai-corp.com/login?error=auth_failed",
    );
  });
});

const b64url = (value: string) => Buffer.from(value, "utf8").toString("base64url");

describe("OAuth state nonce — login CSRF guard", () => {
  it("round-trips the nonce and return path through the wire format", async () => {
    const { createAuthStateNonce, encodeAuthState, decodeAuthState } = await loadWorkos();

    const nonce = createAuthStateNonce();
    const encoded = encodeAuthState(nonce, "/console");

    // base64url only, so `state` needs no further escaping on the way to WorkOS
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeAuthState(encoded)).toEqual({ nonce, returnTo: "/console" });
  });

  it("mints a fresh high-entropy nonce per sign-in attempt", async () => {
    const { createAuthStateNonce } = await loadWorkos();

    const a = createAuthStateNonce();
    const b = createAuthStateNonce();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43); // 32 random bytes as base64url
  });

  it("still applies the open-redirect guard to the returnTo it decodes", async () => {
    // The nonce closes CSRF, not the open redirect: `returnTo` came back over
    // the wire via WorkOS and is no more trusted than the inbound query param.
    const { encodeAuthState, decodeAuthState } = await loadWorkos();

    expect(decodeAuthState(encodeAuthState("n", "//evil.com"))?.returnTo).toBe("/");
    expect(decodeAuthState(encodeAuthState("n", "/\\evil.com"))?.returnTo).toBe("/");
    expect(decodeAuthState(encodeAuthState("n", "/api/inquiries"))?.returnTo).toBe("/");
  });

  it("returns null instead of throwing for every malformed state", async () => {
    // Each of these must reach the callback's `?error=` redirect, never a 500.
    const { decodeAuthState } = await loadWorkos();

    // absent
    expect(decodeAuthState(undefined)).toBeNull();
    expect(decodeAuthState(null)).toBeNull();
    expect(decodeAuthState("")).toBeNull();
    // legacy plain-path state — a login already in flight when this deploys
    expect(decodeAuthState("/console")).toBeNull();
    // malformed base64url: outside the alphabet, or standard-alphabet+padding,
    // both of which Node's lenient decoder would otherwise chew through
    expect(decodeAuthState("!!!not base64!!!")).toBeNull();
    expect(decodeAuthState("YWJj+/==")).toBeNull();
    // decodes cleanly, but is not JSON
    expect(decodeAuthState(b64url("not json at all"))).toBeNull();
    // JSON, but not an object
    expect(decodeAuthState(b64url("null"))).toBeNull();
    expect(decodeAuthState(b64url("42"))).toBeNull();
    expect(decodeAuthState(b64url('"a bare string"'))).toBeNull();
    // an object, but missing or ill-typed on the field that matters
    expect(decodeAuthState(b64url("{}"))).toBeNull();
    expect(decodeAuthState(b64url('{"returnTo":"/console"}'))).toBeNull();
    expect(decodeAuthState(b64url('{"nonce":""}'))).toBeNull();
    expect(decodeAuthState(b64url('{"nonce":123}'))).toBeNull();
    expect(decodeAuthState(b64url("[]"))).toBeNull();
  });

  it("defaults a missing or ill-typed returnTo to '/' rather than failing", async () => {
    const { decodeAuthState } = await loadWorkos();

    expect(decodeAuthState(b64url('{"nonce":"abc"}'))).toEqual({ nonce: "abc", returnTo: "/" });
    expect(decodeAuthState(b64url('{"nonce":"abc","returnTo":42}'))).toEqual({
      nonce: "abc",
      returnTo: "/",
    });
  });

  it("compares nonces without a length-mismatch throw", async () => {
    const { timingSafeEqualString } = await loadWorkos();

    expect(timingSafeEqualString("abc", "abc")).toBe(true);
    expect(timingSafeEqualString("abc", "abd")).toBe(false);
    // node:crypto's timingSafeEqual throws on unequal lengths — guarded
    expect(timingSafeEqualString("abc", "abcd")).toBe(false);
    expect(timingSafeEqualString("", "abc")).toBe(false);
    expect(timingSafeEqualString("", "")).toBe(true);
  });
});

describe("state nonce cookie", () => {
  it("is HttpOnly + Lax + short-lived, and Secure only in production", async () => {
    const { authStateCookie } = await loadWorkos();

    vi.stubEnv("NODE_ENV", "development");
    const dev = authStateCookie("n0nce");
    expect(dev).toContain("mlai_auth_state=n0nce");
    expect(dev).toContain("HttpOnly");
    expect(dev).toContain("Path=/");
    // Lax, never Strict: the callback is a top-level cross-site navigation
    // back from WorkOS, which Strict would not send the cookie on at all.
    expect(dev).toContain("SameSite=Lax");
    expect(dev).toContain("Max-Age=600");
    expect(dev).not.toContain("Secure");

    vi.stubEnv("NODE_ENV", "production");
    expect(authStateCookie("n0nce")).toContain("Secure");
  });

  it("clears with Max-Age=0 so a failed attempt leaves no live nonce", async () => {
    const { clearAuthStateCookie } = await loadWorkos();

    const cleared = clearAuthStateCookie();
    expect(cleared).toContain("mlai_auth_state=;");
    expect(cleared).toContain("Max-Age=0");
    expect(cleared).toContain("HttpOnly");
  });

  it("reads the nonce out of a multi-cookie header, and null when absent", async () => {
    const { readAuthStateNonce } = await loadWorkos();

    const withCookie = (cookie?: string) =>
      new Request("https://mlai-corp.com/api/auth/callback", {
        headers: cookie ? { cookie } : {},
      });

    expect(readAuthStateNonce(withCookie("mlai_session=sealed; mlai_auth_state=n0nce; a=b"))).toBe(
      "n0nce",
    );
    expect(readAuthStateNonce(withCookie("mlai_auth_state=n0nce"))).toBe("n0nce");
    expect(readAuthStateNonce(withCookie("mlai_session=sealed"))).toBeNull();
    expect(readAuthStateNonce(withCookie("mlai_auth_state="))).toBeNull();
    expect(readAuthStateNonce(withCookie())).toBeNull();
  });

  it("survives being appended alongside the session cookie on one response", async () => {
    // The callback's success path emits two Set-Cookie values — the session
    // cookie and the nonce clear. If the runtime collapsed them, the failure
    // is silent and severe in both directions (no session at all, or a spent
    // nonce left live), so pin the mechanism the handler depends on.
    const { authStateCookie, clearAuthStateCookie } = await loadWorkos();

    const headers = new Headers({ Location: "/console" });
    headers.append("Set-Cookie", "mlai_session=sealed; Path=/; HttpOnly");
    headers.append("Set-Cookie", clearAuthStateCookie());

    const values = headers.getSetCookie();
    expect(values).toHaveLength(2);
    expect(values[0]).toContain("mlai_session=sealed");
    expect(values[1]).toContain("mlai_auth_state=;");
    // and the login entry's single-cookie form is unaffected
    expect(new Headers({ "Set-Cookie": authStateCookie("n0nce") }).getSetCookie()).toHaveLength(1);
  });

  it("accepts only the nonce from the browser that started the flow", async () => {
    // The composition the two route handlers perform: /api/auth/login mints a
    // nonce into both `state` and the cookie; the callback requires them to
    // agree. An attacker can replay a `code` and even a whole `state`, but
    // cannot set this cookie in the victim's browser — so their state loses.
    const { createAuthStateNonce, encodeAuthState, decodeAuthState, timingSafeEqualString } =
      await loadWorkos();

    const nonce = createAuthStateNonce();
    const state = decodeAuthState(encodeAuthState(nonce, "/console"));
    expect(state).not.toBeNull();
    expect(timingSafeEqualString(state?.nonce ?? "", nonce)).toBe(true);

    // …the same state replayed into a browser holding a different nonce fails
    expect(timingSafeEqualString(state?.nonce ?? "", createAuthStateNonce())).toBe(false);
    // …and a browser holding no nonce at all has nothing to compare
    expect(timingSafeEqualString(state?.nonce ?? "", "")).toBe(false);
  });
});
