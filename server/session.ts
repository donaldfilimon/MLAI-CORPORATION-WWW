/**
 * Lightweight cookie-session helper using iron-session compatible sealing.
 * Stores a signed+encrypted cookie — no DB needed.
 */
import { sealData, unsealData } from "iron-session";
import type { Context } from "hono";

const COOKIE_NAME = "mlai_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

export function createCookieSessionStorage(password: string) {
  const ttl = COOKIE_MAX_AGE;

  return {
    async set(c: Context, data: SessionData): Promise<string> {
      const clientIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";
      
      const sessionData = {
        ...data,
        clientIp,
        userAgent,
      };

      const sealed = await sealData(sessionData, { password, ttl });
      return `${COOKIE_NAME}=${sealed}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl}${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`;
    },

    async get(c: Context): Promise<SessionData | null> {
      const cookieHeader = c.req.header("cookie") ?? "";
      const match = cookieHeader
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith(`${COOKIE_NAME}=`));
      if (!match) return null;
      const sealed = match.slice(COOKIE_NAME.length + 1);
      try {
        const data = await unsealData<SessionData>(sealed, { password, ttl });
        
        // Validate IP/UA for security hardening
        const currentIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
        const currentUa = c.req.header("user-agent") || "unknown";
        
        if (data.clientIp && data.clientIp !== currentIp) {
          console.warn(`[Auth] Session IP mismatch for user ${data.userId}: expected ${data.clientIp}, got ${currentIp}`);
          // Optional: invalidate session. For now just log or return null.
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
    },

    async destroy(_c: Context): Promise<string> {
      return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`;
    },
  };
}
