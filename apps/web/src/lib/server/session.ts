/**
 * Cookie-session helper for Next route handlers — iron-session sealing,
 * identical cookie name/shape/TTL to the retired Hono server so existing
 * sessions keep working across the migration.
 */
import { sealData, unsealData } from "iron-session";
import { isIP } from "node:net";

const COOKIE_NAME = "mlai_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

let didWarnAboutDevSecret = false;

// Fail closed at request time in production: a guessable session secret means
// forgeable sessions. The dev fallback exists only so local work runs without
// setup, and deferring this check lets Next compile route handlers without
// requiring production secrets during build analysis.
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET (≥32 chars) is required in production — generate with: openssl rand -base64 32",
    );
  }
  if (secret && !didWarnAboutDevSecret) {
    didWarnAboutDevSecret = true;
    console.warn("[Auth] SESSION_SECRET is shorter than 32 chars — using dev fallback.");
  }
  return "development-only-change-me-32-characters-minimum";
}

export interface SessionData {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  company?: string | null;
  useCase?: string | null;
  organizationId?: string | null;
  authenticationMethod?: string | null;
  authenticatedAt?: number;
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

export function clientIpOf(req: Request): string {
  // The production origin is reachable only through Cloudflare and the Google
  // load balancer. Cloudflare-Connecting-IP is the one value Cloudflare
  // overwrites with the connecting visitor; an incoming X-Forwarded-For chain
  // may already contain attacker-controlled entries before either proxy
  // appends to it.
  const cloudflareIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp && isIP(cloudflareIp)) return cloudflareIp;
  if (process.env.NODE_ENV === "production") return "unknown";

  // Direct local/test traffic has no Cloudflare header. Accept only a valid
  // first hop, and never carry arbitrary header text into session/rate keys.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && isIP(first)) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp && isIP(realIp) ? realIp : "unknown";
}

export async function setSessionCookie(req: Request, data: SessionData): Promise<string> {
  const sessionData = {
    ...data,
    clientIp: clientIpOf(req),
    userAgent: req.headers.get("user-agent") || "unknown",
  };
  const sealed = await sealData(sessionData, {
    password: getSessionSecret(),
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
      password: getSessionSecret(),
      ttl: COOKIE_MAX_AGE,
    });

    // iron-session does NOT throw on a malformed or forged seal — it resolves to
    // an empty object. Since every protected route gates with `if (!user)`, and
    // `{}` is truthy, returning it unchecked let any request carrying
    // `mlai_session=<anything>` pass the authentication check with an undefined
    // userId and email. Require the identity fields the callers actually rely on.
    if (!data || typeof data.userId !== "string" || !data.userId) return null;
    if (typeof data.email !== "string" || !data.email) return null;

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
