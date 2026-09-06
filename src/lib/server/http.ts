import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { auth } from "./auth";
import { all, one, run, sqlite } from "./db";
import { appUrl } from "./config";
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export function fail(status: number, code: string, message: string): never {
  throw new ApiError(status, code, message);
}
export const id = () => randomUUID();
export const now = () => Date.now();
export function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export async function body<T>(
  req: Request,
  schema: z.ZodType<T>,
  limit = 128 * 1024,
): Promise<T> {
  const reader = req.body?.getReader();
  let size = 0;
  const parts: Uint8Array[] = [];
  if (reader) {
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) {
          await reader.cancel();
          fail(413, "body_too_large", "Request body exceeds the limit.");
        }
        parts.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  let value: unknown;
  try {
    value = JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch {
    fail(400, "invalid_json", "Expected a JSON object.");
  }
  const result = schema.safeParse(value);
  if (!result.success)
    fail(
      400,
      "invalid_input",
      result.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    );
  return result.data;
}
export function sameOrigin(req: Request) {
  if (
    ["GET", "HEAD", "OPTIONS"].includes(req.method) ||
    req.headers.get("authorization")?.startsWith("Bearer ")
  )
    return;
  const origin = req.headers.get("origin");
  if (origin !== new URL(appUrl).origin)
    fail(403, "invalid_origin", "The request origin is not allowed.");
}
export function rateLimit(key: string, max = 60, windowMs = 60_000) {
  sqlite.transaction(() => {
    const row = one<{ count: number; expires_at: number }>(
      "SELECT * FROM rate_limits WHERE key=?",
      key,
    );
    if (!row || row.expires_at < now()) {
      run(
        "INSERT OR REPLACE INTO rate_limits(key,count,expires_at) VALUES(?,1,?)",
        key,
        now() + windowMs,
      );
      return;
    }
    if (row.count >= max)
      fail(429, "rate_limited", "Too many requests. Try again shortly.");
    run("UPDATE rate_limits SET count=count+1 WHERE key=?", key);
  })();
}
export interface Context {
  userId: string;
  name: string;
  workspaceId: string;
  role: "owner" | "member" | "viewer";
  staff: boolean;
  apiKey: boolean;
}
export async function identity(req: Request) {
  const s = await auth.api.getSession({ headers: req.headers });
  if (!s) fail(401, "unauthenticated", "Sign in to continue.");
  return s.user;
}
export async function context(req: Request, scope = "read"): Promise<Context> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  let userId: string,
    name: string,
    workspaceId: string,
    apiKey = false;
  if (token) {
    const k = one<{
      id: string;
      user_id: string;
      workspace_id: string;
      scopes: string;
    }>(
      "SELECT * FROM api_keys WHERE hash=? AND revoked_at IS NULL",
      createHash("sha256").update(token).digest("hex"),
    );
    if (!k) fail(401, "invalid_key", "API key is invalid or revoked.");
    if (!JSON.parse(k.scopes).includes(scope))
      fail(403, "missing_scope", "API key does not allow this operation.");
    userId = k.user_id;
    workspaceId = k.workspace_id;
    name = "API client";
    apiKey = true;
    run("UPDATE api_keys SET last_used_at=? WHERE id=?", now(), k.id);
  } else {
    const user = await identity(req);
    userId = user.id;
    name = user.name;
    workspaceId =
      new URL(req.url).searchParams.get("workspace") ||
      req.headers.get("x-workspace-id") ||
      one<{ workspace_id: string }>(
        "SELECT workspace_id FROM memberships WHERE user_id=? ORDER BY rowid LIMIT 1",
        userId,
      )?.workspace_id ||
      "";
  }
  const membership = one<{ role: Context["role"] }>(
    "SELECT role FROM memberships WHERE workspace_id=? AND user_id=?",
    workspaceId,
    userId,
  );
  if (!membership)
    fail(
      403,
      "workspace_forbidden",
      "You do not have access to this workspace.",
    );
  if (scope !== "read" && membership.role === "viewer")
    fail(403, "read_only", "This workspace membership is read-only.");
  rateLimit(
    `${userId}:${scope}`,
    scope === "chat" ? 20 : scope === "read" ? 600 : 120,
  );
  return {
    userId,
    name,
    workspaceId,
    role: membership.role,
    staff: !!one("SELECT user_id FROM staff WHERE user_id=?", userId),
    apiKey,
  };
}
export function owner(ctx: Context) {
  if (ctx.role !== "owner" || ctx.apiKey)
    fail(403, "owner_required", "A workspace owner session is required.");
}
export function resource(
  table: "projects" | "documents" | "conversations" | "engagements",
  resourceId: string,
  ctx: Context,
) {
  const row = one(
    `SELECT * FROM ${table} WHERE id=? AND workspace_id=?`,
    resourceId,
    ctx.workspaceId,
  );
  if (!row) fail(404, "not_found", "Resource not found.");
  return row;
}
export function notify(
  workspaceId: string,
  title: string,
  href: string,
  except?: string,
) {
  for (const m of all<{ user_id: string }>(
    "SELECT user_id FROM memberships WHERE workspace_id=? AND notifications=1",
    workspaceId,
  )) {
    if (m.user_id !== except)
      run(
        "INSERT INTO notifications(id,workspace_id,user_id,title,href,created_at) VALUES(?,?,?,?,?,?)",
        id(),
        workspaceId,
        m.user_id,
        title,
        href,
        now(),
      );
  }
}
export function notifyStaff(
  title: string,
  href: string,
  engagementId?: string,
  except?: string,
) {
  const staff = engagementId
    ? all<{ user_id: string }>(
        "SELECT user_id FROM assignments WHERE engagement_id=?",
        engagementId,
      )
    : all<{ user_id: string }>("SELECT user_id FROM staff");
  for (const person of staff) {
    if (person.user_id === except) continue;
    const home = one<{ workspace_id: string; notifications: number }>(
      "SELECT workspace_id,notifications FROM memberships WHERE user_id=? ORDER BY rowid LIMIT 1",
      person.user_id,
    );
    if (home?.notifications)
      run(
        "INSERT INTO notifications(id,workspace_id,user_id,title,href,created_at) VALUES(?,?,?,?,?,?)",
        id(),
        home.workspace_id,
        person.user_id,
        title,
        href,
        now(),
      );
  }
}
export function trace(
  ctx: Context,
  operation: string,
  provider: string | null,
  status: string,
  start: number,
  usage?: { input?: number; output?: number },
) {
  run(
    "INSERT INTO traces(id,workspace_id,operation,provider,status,duration_ms,input_tokens,output_tokens,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
    id(),
    ctx.workspaceId,
    operation,
    provider,
    status,
    now() - start,
    usage?.input ?? null,
    usage?.output ?? null,
    now(),
  );
}
export async function handle(
  req: Request,
  fn: () => Promise<Response> | Response,
) {
  const requestId = id();
  try {
    sameOrigin(req);
    const response = await fn();
    response.headers.set("X-Request-ID", requestId);
    return response;
  } catch (e) {
    const err =
      e instanceof ApiError
        ? e
        : new ApiError(
            500,
            "internal_error",
            "The operation could not be completed.",
          );
    if (!(e instanceof ApiError))
      console.error(
        "request_failed",
        requestId,
        e instanceof Error ? e.name : "unknown",
      );
    return Response.json(
      { error: { code: err.code, message: err.message, requestId } },
      {
        status: err.status,
        headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
      },
    );
  }
}
