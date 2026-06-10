/**
 * Cookie-session helper for Next route handlers — iron-session sealing,
 * identical cookie name/shape/TTL to the retired Hono server so existing
 * sessions keep working across the migration.
 */
import { sealData, unsealData } from "iron-session";

const COOKIE_NAME = "mlai_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Fail closed in production: a guessable session secret means forgeable
// sessions. The dev fallback exists only so local work runs without setup.
const SESSION_SECRET = (() => {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET (≥32 chars) is required in production — generate with: openssl rand -base64 32",
    );
  }
  if (secret) {
    console.warn("[Auth] SESSION_SECRET is shorter than 32 chars — using dev fallback.");
  }
  return "development-only-change-me-32-characters-minimum";
})();

export interface SessionData {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  organizationId?: string | null;
  authenticationMethod?: string | null;
  refreshToken?: string;
  accessToken: string;
  clientIp?: string;
  userAgent?: string;
}

export type PublicSessionUser = Omit<SessionData, "accessToken" | "refreshToken">;

export function toPublicUser(data: SessionData): PublicSessionUser {
  const { accessToken: _accessToken, refreshToken: _refreshToken, ...publicUser } = data;
  return publicUser;
}

// X-Forwarded-For is only trustworthy behind a proxy that overwrites it
// (Cloud Run does). Use the leftmost entry — the original client — so a
// spoofed multi-hop header can't manufacture a "matching" IP string.
function clientIpOf(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export async function setSessionCookie(req: Request, data: SessionData): Promise<string> {
  const sessionData = {
    ...data,
    clientIp: clientIpOf(req),
    userAgent: req.headers.get("user-agent") || "unknown",
  };
  const sealed = await sealData(sessionData, {
    password: SESSION_SECRET,
    ttl: COOKIE_MAX_AGE,
  });
  return `${COOKIE_NAME}=${sealed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export async function getSession(req: Request): Promise<SessionData | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const sealed = match.slice(COOKIE_NAME.length + 1);
  try {
    const data = await unsealData<SessionData>(sealed, {
      password: SESSION_SECRET,
      ttl: COOKIE_MAX_AGE,
    });

    // Sessions are bound to client IP + User-Agent (hardening carried over).
    const currentIp = clientIpOf(req);
    const currentUa = req.headers.get("user-agent") || "unknown";
    if (data.clientIp && data.clientIp !== currentIp) {
      console.warn(
        `[Auth] Session IP mismatch for user ${data.userId}: expected ${data.clientIp}, got ${currentIp}`,
      );
      return null;
    }
    if (data.userAgent && data.userAgent !== currentUa) {
      console.warn(`[Auth] Session User-Agent mismatch for user ${data.userId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function destroySessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}
