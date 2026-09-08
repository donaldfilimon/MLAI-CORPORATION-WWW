import { agentSummaries } from "./agent-store";
import { projectCreateSchema } from "../contracts";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { all, one, run, sqlite } from "./db";
import { Context, body, fail, id, json, now, owner, resource } from "./http";
import { connections } from "./config";
const nameSchema = projectCreateSchema;
export async function workspaceRoutes(
  req: Request,
  path: string[],
  ctx: Context,
): Promise<Response | undefined> {
  const [section, key, action] = path;
  if (section === "bootstrap" && req.method === "GET")
    return json({
      user: { id: ctx.userId, name: ctx.name },
      staff: ctx.staff,
      role: ctx.role,
      notificationsEnabled: !!one<{ notifications: number }>(
        "SELECT notifications FROM memberships WHERE workspace_id=? AND user_id=?",
        ctx.workspaceId,
        ctx.userId,
      )?.notifications,
      workspace: one("SELECT * FROM workspaces WHERE id=?", ctx.workspaceId),
      workspaces: all(
        "SELECT w.*,m.role FROM workspaces w JOIN memberships m ON w.id=m.workspace_id WHERE m.user_id=? ORDER BY w.created_at",
        ctx.userId,
      ),
      projects: all(
        "SELECT * FROM projects WHERE workspace_id=? ORDER BY updated_at DESC",
        ctx.workspaceId,
      ),
      unread:
        one<{ n: number }>(
          "SELECT count(*) n FROM notifications WHERE user_id=? AND workspace_id=? AND read_at IS NULL",
          ctx.userId,
          ctx.workspaceId,
        )?.n || 0,
    });
  if (section === "workspaces") {
    if (req.method === "POST" && !key) {
      if (ctx.apiKey)
        fail(403, "session_required", "A browser session is required.");
      const data = await body(req, nameSchema),
        wid = id();
      sqlite.transaction(() => {
        run(
          "INSERT INTO workspaces(id,name,created_at) VALUES(?,?,?)",
          wid,
          data.name,
          now(),
        );
        run(
          "INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,'owner')",
          wid,
          ctx.userId,
        );
      })();
      return json({ id: wid }, 201);
    }
    if (key === "settings" && req.method === "PATCH") {
      owner(ctx);
      const data = await body(
        req,
        z.object({
          name: z.string().trim().min(1).max(120).optional(),
          provider_id: z.string().nullable().optional(),
          hosted_consent: z.boolean().optional(),
          onboarded: z.boolean().optional(),
        }),
      );
      if (
        data.provider_id &&
        !connections().some(
          (c) =>
            c.id === data.provider_id && ["local", "hosted"].includes(c.kind),
        )
      )
        fail(
          400,
          "invalid_provider",
          "Select an operator-configured model provider.",
        );
      const existing = one<{
        provider_id: string | null;
        hosted_consent: number;
      }>("SELECT * FROM workspaces WHERE id=?", ctx.workspaceId)!;
      const selected = connections().find(
        (c) =>
          c.id ===
          (data.provider_id === undefined
            ? existing.provider_id
            : data.provider_id),
      );
      if (
        selected?.kind === "hosted" &&
        !(data.hosted_consent ?? !!existing.hosted_consent)
      )
        fail(
          400,
          "consent_required",
          "Enable hosted processing explicitly before selecting this provider.",
        );
      run(
        "UPDATE workspaces SET name=coalesce(?,name),provider_id=?,hosted_consent=coalesce(?,hosted_consent),onboarded=coalesce(?,onboarded) WHERE id=?",
        data.name ?? null,
        data.provider_id === undefined
          ? existing.provider_id
          : data.provider_id,
        data.hosted_consent === undefined ? null : Number(data.hosted_consent),
        data.onboarded === undefined ? null : Number(data.onboarded),
        ctx.workspaceId,
      );
      return json({ ok: true });
    }
    if (key === "members") {
      if (req.method === "GET")
        return json(
          all(
            "SELECT u.id,u.name,u.email,m.role FROM memberships m JOIN user u ON u.id=m.user_id WHERE m.workspace_id=?",
            ctx.workspaceId,
          ),
        );
      owner(ctx);
      if (req.method === "POST") {
        const data = await body(
          req,
          z.object({
            email: z.string().email(),
            role: z.enum(["owner", "member", "viewer"]),
          }),
        );
        const u = one<{ id: string }>(
          "SELECT id FROM user WHERE email=?",
          data.email.toLowerCase(),
        );
        if (!u)
          fail(
            404,
            "account_not_found",
            "That person must register a local account first.",
          );
        if (u.id === ctx.userId && data.role !== "owner")
          fail(
            400,
            "owner_required",
            "You cannot remove your own owner role here.",
          );
        run(
          "INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,?) ON CONFLICT(workspace_id,user_id) DO UPDATE SET role=excluded.role",
          ctx.workspaceId,
          u.id,
          data.role,
        );
        return json({ ok: true });
      }
      if (req.method === "DELETE" && action) {
        if (action === ctx.userId)
          fail(400, "owner_required", "You cannot remove your own membership.");
        run(
          "DELETE FROM memberships WHERE workspace_id=? AND user_id=?",
          ctx.workspaceId,
          action,
        );
        return json({ ok: true });
      }
    }
  }
  if (section === "projects") {
    if (!key && req.method === "GET")
      return json(
        all(
          "SELECT * FROM projects WHERE workspace_id=? ORDER BY updated_at DESC",
          ctx.workspaceId,
        ),
      );
    if (!key && req.method === "POST") {
      const data = await body(req, nameSchema),
        pid = id();
      run(
        "INSERT INTO projects(id,workspace_id,name,description,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        pid,
        ctx.workspaceId,
        data.name,
        data.description || "",
        now(),
        now(),
      );
      return json({ id: pid }, 201);
    }
    if (key) {
      resource("projects", key, ctx);
      if (req.method === "PATCH") {
        const data = await body(
          req,
          z
            .object({
              name: z.string().trim().min(1).max(120).optional(),
              description: z.string().max(4000).optional(),
              archived: z.boolean().optional(),
            })
            .strict(),
        );
        run(
          "UPDATE projects SET name=coalesce(?,name),description=coalesce(?,description),archived=coalesce(?,archived),updated_at=? WHERE id=?",
          data.name ?? null,
          data.description ?? null,
          data.archived === undefined ? null : Number(data.archived),
          now(),
          key,
        );
        return json({ ok: true });
      }
      if (req.method === "DELETE") {
        run("DELETE FROM projects WHERE id=?", key);
        return json({ ok: true });
      }
    }
  }
  if (section === "conversations") {
    if (!key && req.method === "GET")
      return json(
        all(
          "SELECT * FROM conversations WHERE workspace_id=? ORDER BY updated_at DESC",
          ctx.workspaceId,
        ),
      );
    if (!key && req.method === "POST") {
      const data = await body(
        req,
        z.object({
          title: z.string().trim().min(1).max(160).default("New conversation"),
          project_id: z.string().nullable().optional(),
        }),
      );
      if (data.project_id) resource("projects", data.project_id, ctx);
      const cid = id();
      run(
        "INSERT INTO conversations(id,workspace_id,project_id,title,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        cid,
        ctx.workspaceId,
        data.project_id || null,
        data.title,
        now(),
        now(),
      );
      return json({ id: cid }, 201);
    }
    if (key) {
      const c = resource("conversations", key, ctx);
      if (req.method === "GET") {
        const messages = all(
          "SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at,rowid",
          key,
        ).map((m) => ({
          ...m,
          citations: JSON.parse(String(m.citations)).map(
            (citation: Record<string, unknown>) => ({
              ...citation,
              content:
                one<{ content: string }>(
                  "SELECT content FROM chunks WHERE id=? AND document_id=? AND workspace_id=?",
                  citation.id,
                  citation.documentId,
                  ctx.workspaceId,
                )?.content || "",
              removed: !one(
                "SELECT id FROM chunks WHERE id=? AND document_id=? AND workspace_id=?",
                citation.id,
                citation.documentId,
                ctx.workspaceId,
              ),
            }),
          ),
        }));
        if (action === "export")
          return new Response(
            JSON.stringify(
              {
                ...c,
                messages,
                agentRuns: ctx.apiKey ? [] : agentSummaries(key),
              },
              null,
              2,
            ),
            {
              headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="conversation-${key}.json"`,
              },
            },
          );
        return json({
          ...c,
          messages,
          agentRuns: ctx.apiKey ? [] : agentSummaries(key),
        });
      }
      if (req.method === "PATCH") {
        const data = await body(
          req,
          z.object({
            title: z.string().trim().min(1).max(160).optional(),
            project_id: z.string().nullable().optional(),
          }),
        );
        if (data.project_id) resource("projects", data.project_id, ctx);
        run(
          "UPDATE conversations SET title=?,project_id=?,updated_at=? WHERE id=?",
          data.title ?? c.title,
          data.project_id === undefined ? c.project_id : data.project_id,
          now(),
          key,
        );
        return json({ ok: true });
      }
      if (req.method === "DELETE") {
        run("DELETE FROM conversations WHERE id=?", key);
        return json({ ok: true });
      }
    }
  }
  if (section === "api-keys") {
    owner(ctx);
    if (req.method === "GET")
      return json(
        all(
          "SELECT id,name,prefix,scopes,created_at,revoked_at,last_used_at FROM api_keys WHERE workspace_id=? ORDER BY created_at DESC",
          ctx.workspaceId,
        ),
      );
    if (req.method === "POST") {
      const data = await body(
        req,
        z.object({
          name: z.string().trim().min(1).max(100),
          scopes: z
            .array(z.enum(["read", "write", "chat", "documents", "console"]))
            .min(1)
            .max(5),
        }),
      );
      const secret = `mlai_${randomBytes(32).toString("base64url")}`,
        kid = id();
      run(
        "INSERT INTO api_keys(id,workspace_id,user_id,name,prefix,hash,scopes,created_at) VALUES(?,?,?,?,?,?,?,?)",
        kid,
        ctx.workspaceId,
        ctx.userId,
        data.name,
        secret.slice(0, 12),
        createHash("sha256").update(secret).digest("hex"),
        JSON.stringify(data.scopes),
        now(),
      );
      return json({ id: kid, secret }, 201);
    }
    if (req.method === "DELETE" && key) {
      run(
        "UPDATE api_keys SET revoked_at=? WHERE id=? AND workspace_id=?",
        now(),
        key,
        ctx.workspaceId,
      );
      return json({ ok: true });
    }
  }
  if (section === "notifications") {
    if (req.method === "GET")
      return json(
        all(
          "SELECT * FROM notifications WHERE workspace_id=? AND user_id=? ORDER BY created_at DESC LIMIT 100",
          ctx.workspaceId,
          ctx.userId,
        ),
      );
    if (req.method === "PATCH") {
      if (key === "preferences") {
        const data = await body(req, z.object({ enabled: z.boolean() }));
        run(
          "UPDATE memberships SET notifications=? WHERE workspace_id=? AND user_id=?",
          Number(data.enabled),
          ctx.workspaceId,
          ctx.userId,
        );
      } else
        run(
          "UPDATE notifications SET read_at=? WHERE workspace_id=? AND user_id=? AND (? IS NULL OR id=?)",
          now(),
          ctx.workspaceId,
          ctx.userId,
          key ?? null,
          key ?? null,
        );
      return json({ ok: true });
    }
  }
  if (section === "traces" && req.method === "GET")
    return json(
      all(
        "SELECT * FROM traces WHERE workspace_id=? ORDER BY created_at DESC LIMIT 100",
        ctx.workspaceId,
      ),
    );
  if (section === "usage" && req.method === "GET")
    return json(
      all(
        "SELECT provider,count(*) requests,sum(input_tokens) input_tokens,sum(output_tokens) output_tokens,avg(duration_ms) avg_duration_ms FROM traces WHERE workspace_id=? GROUP BY provider",
        ctx.workspaceId,
      ),
    );
}
