/**
 * WorkOS client + auth helpers for Next route handlers — ported verbatim
 * from the retired Hono server (env contract unchanged).
 */
import { randomBytes, timingSafeEqual } from "node:crypto";
import { WorkOS } from "@workos-inc/node";
import type { SessionData } from "./session";

export const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
export const CLIENT_ID = process.env.WORKOS_CLIENT_ID;
export const WORKOS_ORGANIZATION_ID = process.env.WORKOS_ORGANIZATION_ID?.trim();
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
export const FRONTEND_URL = process.env.FRONTEND_URL ?? APP_URL;
export const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

/**
 * Warn loudly when APP_URL and FRONTEND_URL name different hosts.
 *
 * This coupling is NEW, and it is not obvious from either variable's name.
 * The OAuth state nonce is stored in a host-scoped cookie set by whichever
 * host served `/api/auth/login` (built from APP_URL), but the post-auth
 * redirect targets FRONTEND_URL. If those differ — a `www.` vs. apex split is
 * the classic case — the browser will not send the nonce cookie back, the
 * callback's CSRF check fails, and EVERY login dies with `invalid_state`.
 *
 * Before the nonce existed this configuration worked fine, because `state`
 * was just a return path and no cookie had to survive the round trip. So an
 * operator can hit this by changing nothing at all. A startup warning is
 * cheap; a silent site-wide login outage is not. Deliberately a warning and
 * not a throw: a split host is legitimate for a reverse-proxy setup that
 * rewrites Host, and refusing to boot would be worse than saying so.
 */
if (new URL(APP_URL).host !== new URL(FRONTEND_URL).host) {
  console.warn(
    `[Auth] APP_URL (${new URL(APP_URL).host}) and FRONTEND_URL (${new URL(FRONTEND_URL).host}) ` +
      "resolve to different hosts. The OAuth state cookie is set on APP_URL's host and will not " +
      "be sent back on the callback, so every sign-in will fail with `invalid_state`. " +
      "Point both at the same host unless a proxy rewrites Host between them.",
  );
}

const workos = WORKOS_API_KEY ? new WorkOS(WORKOS_API_KEY) : null;

export function requireWorkOS() {
  if (!workos || !CLIENT_ID) return null;
  return workos;
}

/**
 * Characters that let a "/"-prefixed path escape its own origin once the
 * WHATWG URL parser resolves it against FRONTEND_URL. Verified against the
 * real parser: `/\evil.com`, `/<TAB>/evil.com`, `/<CR>/evil.com` and
 * `/<LF>/evil.com` all resolve to `https://evil.com/`, because the parser
 * treats a backslash as a path separator (so `/\` is really `//`, i.e.
 * protocol-relative) and strips tab/CR/LF from *anywhere* in the input before
 * parsing (so what is left is again `//evil.com`). The old `startsWith("//")`
 * check never saw either form.
 *
 * The whole C0 range plus DEL is rejected rather than only the three the
 * parser happens to strip today: none of them belongs in a legitimate
 * same-origin path, and a guard that enumerates exactly one parser version's
 * behavior is the kind that silently stops matching it. Reject outright and
 * fall back to "/" rather than stripping the characters — a stripped value is
 * still an attacker-shaped value, and "sanitize then trust" is how this class
 * of bug comes back.
 *
 * Deliberately flagless: a /g regex carries `lastIndex` across `.test()`
 * calls, so it would return false on every other call.
 */
const UNSAFE_RETURN_TO = /[\u0000-\u001F\u007F\\]/;

export function getReturnTo(value: string | undefined | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (UNSAFE_RETURN_TO.test(value)) return "/";
  if (value.startsWith("/api/")) return "/";
  return value;
}

export function redirectToFrontend(path = "/") {
  const base = new URL(FRONTEND_URL);
  const target = new URL(getReturnTo(path), base);
  // Post-parse origin assertion, on top of getReturnTo's character-level
  // predicate. This is the actual sink, so whatever the parser decided the
  // resolved URL means, it must still name our own origin — a character the
  // predicate does not enumerate can then never turn this into an off-site
  // redirect. Belt and braces on purpose; neither check alone is structural.
  if (target.origin !== base.origin) return new URL("/", base).toString();
  return target.toString();
}

// ── OAuth `state` nonce (login CSRF) ─────────────────────────────────────────
// `state` used to be nothing but the post-login return path, so the callback
// would accept an authorization `code` delivered from anywhere: an attacker
// starts their own AuthKit sign-in, keeps the unused `code`, and navigates the
// victim's browser to /api/auth/callback?code=<attacker's>. The victim's
// browser is then holding a valid session for the *attacker's* WorkOS user.
// The IP/UA session binding does not help — the forged cookie is minted from
// the victim's own request, so it binds to the victim's own IP and UA and
// validates normally.
//
// The fix is the standard one: `state` carries a nonce that also lives in a
// short-lived cookie on the browser that started the flow, and the callback
// requires the two to match. An attacker can supply a `code`, but not a
// matching cookie in the victim's browser.

export const AUTH_STATE_COOKIE = "mlai_auth_state";
// One sign-in round trip, including a password reset or an MFA challenge on
// the AuthKit side. Long enough not to fail real users, short enough that a
// nonce left behind by an abandoned attempt expires on its own.
const AUTH_STATE_MAX_AGE = 600; // seconds

export interface AuthState {
  nonce: string;
  returnTo: string;
}

export function createAuthStateNonce(): string {
  return randomBytes(32).toString("base64url");
}

/** `state` wire format: base64url(JSON({ nonce, returnTo })). */
export function encodeAuthState(nonce: string, returnTo: string): string {
  const payload: AuthState = { nonce, returnTo };
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

// Node's base64url decoder is lenient — it accepts standard-alphabet `+`/`/`,
// padding, and simply skips bytes it does not recognize — so a charset check
// has to come first for "malformed base64" to be a rejection rather than a
// silent partial decode.
const BASE64URL = /^[A-Za-z0-9_-]+$/;

/**
 * Parse the `state` WorkOS echoed back. Returns null — never throws — for
 * every shape that is not a well-formed state we minted, including the
 * pre-nonce plain-path format that an in-flight login started before this
 * change would still be carrying. Callers turn null into the ordinary
 * `?error=` redirect, so a malformed `state` is an auth failure, not a 500.
 */
export function decodeAuthState(raw: string | null | undefined): AuthState | null {
  if (!raw || !BASE64URL.test(raw)) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const { nonce, returnTo } = parsed as Record<string, unknown>;
    if (typeof nonce !== "string" || !nonce) return null;
    // The nonce closes CSRF, not the open redirect — `returnTo` came back over
    // the wire and still has to clear the same guard as the inbound value.
    return { nonce, returnTo: getReturnTo(typeof returnTo === "string" ? returnTo : "/") };
  } catch {
    return null;
  }
}

export function timingSafeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  // timingSafeEqual throws on a length mismatch, so the length compare has to
  // happen first. That leaks the length, which is fine: the nonce is a fixed
  // 32 random bytes and its length is not the secret.
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

// SameSite=Lax, not Strict: the callback arrives as a top-level cross-site GET
// navigation from WorkOS, which Lax permits and Strict does not — Strict here
// would fail *every* login. Same reason the session cookie uses Lax.
export function authStateCookie(nonce: string): string {
  return `${AUTH_STATE_COOKIE}=${nonce}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_STATE_MAX_AGE}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearAuthStateCookie(): string {
  return `${AUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function readAuthStateNonce(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${AUTH_STATE_COOKIE}=`));
  if (!match) return null;
  return match.slice(AUTH_STATE_COOKIE.length + 1) || null;
}

// ── Admin identity ───────────────────────────────────────────────────────────
// Admin reads (inquiries, telemetry summary) expose PII/aggregates, so a valid
// session alone is not enough — the user must be on the ADMIN_EMAILS allowlist
// (comma-separated env var). Unset allowlist: open in development so local
// work runs without setup; DENIED in production (fail closed).

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function checkAdminIdentity(
  user: SessionData,
): { ok: true } | { ok: false; error: string } {
  if (ADMIN_EMAILS.size === 0) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "Administrative access is not configured" };
    }
    console.warn(
      "[Auth] ADMIN_EMAILS is unset — allowing admin reads in development only.",
    );
    return { ok: true };
  }
  if (!ADMIN_EMAILS.has(user.email.toLowerCase())) {
    return { ok: false, error: "Administrative access required" };
  }
  return { ok: true };
}

// ── MFA for administrative access ────────────────────────────────────────────
// Policy lives in WorkOS or, for SSO, the organization's IdP. See the runbook;
// every production path fails closed until its provider-side policy is attested.

export const ADMIN_REQUIRE_MFA = process.env.ADMIN_REQUIRE_MFA === "true";
const ADMIN_MFA_POLICY_VERIFIED = process.env.WORKOS_MFA_POLICY_VERIFIED === "true";
const ADMIN_SSO_MFA_POLICY_VERIFIED =
  process.env.WORKOS_SSO_MFA_POLICY_VERIFIED === "true";
const ADMIN_FRESH_AUTH_MS = 10 * 60 * 1000;
const ADMIN_FUTURE_AUTH_SKEW_MS = 60 * 1000;

/**
 * Extract WorkOS's signed `auth_time` claim from an access token.
 *
 * The token reaches this function only as the result of the server-to-server
 * authorization-code exchange with WorkOS, then lives inside our sealed
 * session. We still parse defensively because a missing/malformed claim must
 * deny administrative access rather than silently becoming "fresh now".
 */
export function accessTokenAuthTime(accessToken: string): number | null {
  const parts = accessToken.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const payload: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object") return null;
    const authTime = (payload as Record<string, unknown>).auth_time;
    if (!Number.isSafeInteger(authTime) || (authTime as number) <= 0) return null;
    return (authTime as number) * 1000;
  } catch {
    return null;
  }
}

function freshAuthentication(user: SessionData): { ok: true } | { ok: false; error: string } {
  if (!user.authenticatedAt) {
    return { ok: false, error: "Verified WorkOS authentication time is required" };
  }
  const age = Date.now() - user.authenticatedAt;
  if (age < -ADMIN_FUTURE_AUTH_SKEW_MS || age > ADMIN_FRESH_AUTH_MS) {
    return { ok: false, error: "Fresh WorkOS authentication is required for administrative access" };
  }
  return { ok: true };
}

// The SDK ships listUserAuthFactors at runtime but the bundled types lag
// behind; this narrow structural type covers exactly what we call.
export type AuthFactorSummary = { id: string; type: string; createdAt: string };
export type FactorListing = {
  listUserAuthFactors(options: { userId: string }): Promise<{ data: AuthFactorSummary[] }>;
};

const mfaFactorCache = new Map<string, { enrolled: boolean; expires: number }>();
const MFA_CACHE_TTL_MS = 5 * 60 * 1000;

export async function userHasMfaFactor(userId: string): Promise<boolean | null> {
  const auth = requireWorkOS();
  if (!auth) return null;
  const cached = mfaFactorCache.get(userId);
  if (cached && cached.expires > Date.now()) return cached.enrolled;
  try {
    const um = auth.userManagement as unknown as FactorListing;
    const factors = await um.listUserAuthFactors({ userId });
    const enrolled = factors.data.length > 0;
    mfaFactorCache.set(userId, { enrolled, expires: Date.now() + MFA_CACHE_TTL_MS });
    return enrolled;
  } catch (err) {
    console.error("WorkOS listUserAuthFactors failed:", err);
    return null;
  }
}

export async function checkAdminMfa(
  user: SessionData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ADMIN_REQUIRE_MFA) return { ok: true };

  const fresh = freshAuthentication(user);
  if (!fresh.ok) return fresh;

  // WorkOS's AuthKit MFA policy explicitly does not apply to SSO users. Their
  // step-up sends them back through the IdP, so production must carry a
  // separate operator attestation that the organization's IdP requires MFA.
  if (user.authenticationMethod === "SSO") {
    if (!ADMIN_SSO_MFA_POLICY_VERIFIED) {
      return { ok: false, error: "Verified SSO identity-provider MFA is required" };
    }
    return { ok: true };
  }

  // An impersonated target user's enrolled factor says nothing about the
  // dashboard actor controlling the session, so it can never authorize an
  // administrative read.
  if (!user.authenticationMethod || user.authenticationMethod === "Impersonation") {
    return { ok: false, error: "Supported authentication method is required for admin access" };
  }
  if (!ADMIN_MFA_POLICY_VERIFIED) {
    return { ok: false, error: "Verified WorkOS MFA policy is required for administrative access" };
  }
  const enrolled = await userHasMfaFactor(user.userId);
  if (enrolled === null) {
    return { ok: false, error: "MFA verification unavailable" };
  }
  if (!enrolled) {
    return { ok: false, error: "MFA enrollment required for administrative access" };
  }
  return { ok: true };
}

export async function checkAdminAccess(
  user: SessionData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const identity = checkAdminIdentity(user);
  if (!identity.ok) return identity;
  return checkAdminMfa(user);
}

// Invite-only beta authorization. Session organization claims are useful
// context but are not revocation proof, so protected generation rechecks the
// active WorkOS membership with a short cache and fails closed on API errors.
const membershipCache = new Map<string, { organizationId: string; expires: number }>();
const MEMBERSHIP_CACHE_TTL_MS = 60 * 1000;

export async function checkOrganizationAccess(
  user: Pick<SessionData, "userId">,
): Promise<
  | { ok: true; organizationId: string }
  | { ok: false; error: string; status: 403 | 503 }
> {
  if (!WORKOS_ORGANIZATION_ID) {
    return { ok: false, error: "Quesar beta organization is not configured", status: 503 };
  }
  const cached = membershipCache.get(user.userId);
  if (cached && cached.expires > Date.now() && cached.organizationId === WORKOS_ORGANIZATION_ID) {
    return { ok: true, organizationId: cached.organizationId };
  }
  const auth = requireWorkOS();
  if (!auth) return { ok: false, error: "WorkOS is not configured", status: 503 };
  try {
    const memberships = await auth.userManagement.listOrganizationMemberships({
      userId: user.userId,
      organizationId: WORKOS_ORGANIZATION_ID,
      statuses: ["active"],
      limit: 10,
    });
    const active = memberships.data.find(
      (membership) =>
        membership.organizationId === WORKOS_ORGANIZATION_ID && membership.status === "active",
    );
    if (!active) {
      return { ok: false, error: "An active Quesar beta invitation is required", status: 403 };
    }
    membershipCache.set(user.userId, {
      organizationId: active.organizationId,
      expires: Date.now() + MEMBERSHIP_CACHE_TTL_MS,
    });
    return { ok: true, organizationId: active.organizationId };
  } catch (error) {
    console.error("WorkOS organization membership check failed:", error);
    return { ok: false, error: "Organization membership verification unavailable", status: 503 };
  }
}
