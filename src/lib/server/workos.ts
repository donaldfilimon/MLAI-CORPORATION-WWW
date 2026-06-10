/**
 * WorkOS client + auth helpers for Next route handlers — ported verbatim
 * from the retired Hono server (env contract unchanged).
 */
import { WorkOS } from "@workos-inc/node";
import type { SessionData } from "./session";

export const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
export const CLIENT_ID = process.env.WORKOS_CLIENT_ID;
export const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
export const FRONTEND_URL = process.env.FRONTEND_URL ?? APP_URL;
export const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

const workos = WORKOS_API_KEY ? new WorkOS(WORKOS_API_KEY) : null;

export function requireWorkOS() {
  if (!workos || !CLIENT_ID) return null;
  return workos;
}

export function getReturnTo(value: string | undefined | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.startsWith("/api/")) return "/";
  return value;
}

export function redirectToFrontend(path = "/") {
  return new URL(getReturnTo(path), FRONTEND_URL).toString();
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
// Policy lives in the WorkOS Dashboard (docs/mfa-workos-runbook.md). When
// ADMIN_REQUIRE_MFA=true, admin reads require ≥1 enrolled factor; fails closed.

export const ADMIN_REQUIRE_MFA = process.env.ADMIN_REQUIRE_MFA === "true";

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
