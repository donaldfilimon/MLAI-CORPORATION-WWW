/**
 * Shared gate for the /api/workspace/* handlers.
 *
 * Every workspace route reads one user's private files, so each one requires a
 * session AND active organization membership — the same pair the audit routes
 * use — before it touches a provider. Kept here rather than repeated so a new
 * workspace route cannot accidentally ship without the check.
 */
import type { WorkspaceFile } from "@/lib/workspace-sources";
import { rateLimit, tooMany } from "./rate-limit";
import { getSession, type SessionData } from "./session";
import { checkOrganizationAccess } from "./workos";
import { isProviderConfigured, type WorkspaceProvider } from "./workspace-oauth";
import { getWorkspaceAccessToken, WorkspaceNotConnectedError } from "./workspace-tokens";

export type WorkspaceGate =
  | { ok: true; user: SessionData; organizationId: string | null }
  | { ok: false; response: Response };

export async function gateWorkspaceRequest(req: Request): Promise<WorkspaceGate> {
  const user = await getSession(req);
  if (!user) {
    return {
      ok: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const access = await checkOrganizationAccess(user);
  if (!access.ok) {
    return {
      ok: false,
      response: Response.json({ error: access.error }, { status: access.status }),
    };
  }
  return { ok: true, user, organizationId: access.organizationId ?? null };
}

/**
 * File listings are per-user private data. `private, no-store` keeps them out
 * of shared caches and out of the browser's disk cache.
 */
export const PRIVATE_NO_STORE = { "Cache-Control": "private, no-store" } as const;

/* ── shared file-listing handler ──────────────────────────────────────────── */

/** Clamped: `days` is caller-supplied and bounds how much we ask a provider for. */
export function requestedDays(req: Request, fallback = 30): number {
  const raw = new URL(req.url).searchParams.get("days");
  const parsed = raw === null ? Number.NaN : Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, 365);
}

/**
 * The body both file routes return.
 *
 * `connected: false` is a 200, not an error status: "you have not linked this
 * account" is a normal state of the console, and monitoring should not page on
 * it. The client adapter turns it into the `unconfigured` source state.
 */
export async function respondWithSourceFiles(
  req: Request,
  provider: WorkspaceProvider,
  list: (accessToken: string, days: number, signal: AbortSignal) => Promise<WorkspaceFile[]>,
): Promise<Response> {
  const gate = await gateWorkspaceRequest(req);
  if (!gate.ok) return gate.response;

  // 120/min: the console refetches on filter changes, so this has to sit well
  // above normal interaction while still capping a runaway client.
  if (!rateLimit("workspace-files", req, { windowMs: 60 * 1000, max: 120 })) return tooMany();

  if (!isProviderConfigured(provider)) {
    return Response.json(
      { ok: true, connected: false, reason: "provider_not_configured", files: [] },
      { headers: PRIVATE_NO_STORE },
    );
  }

  const controller = new AbortController();
  // Bound the upstream call so a hung provider cannot pin a Cloud Run instance.
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const accessToken = await getWorkspaceAccessToken(gate.user.userId, provider);
    const files = await list(accessToken, requestedDays(req), controller.signal);
    return Response.json({ ok: true, connected: true, files }, { headers: PRIVATE_NO_STORE });
  } catch (error) {
    if (error instanceof WorkspaceNotConnectedError) {
      return Response.json(
        { ok: true, connected: false, reason: "not_connected", files: [] },
        { headers: PRIVATE_NO_STORE },
      );
    }
    // Message only: provider error bodies can echo the query or the token.
    console.error(
      `[Workspace] ${provider} listing failed:`,
      error instanceof Error ? error.message : error,
    );
    return Response.json(
      { error: "Source unavailable" },
      { status: 502, headers: PRIVATE_NO_STORE },
    );
  } finally {
    clearTimeout(timeout);
  }
}
