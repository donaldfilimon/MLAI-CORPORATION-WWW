import { z } from "zod";
import { join } from "node:path";
import { readFile, rm } from "node:fs/promises";
import { all, one, run, sqlite } from "./db";
import {
  Context,
  body,
  fail,
  id,
  json,
  now,
  notify,
  notifyStaff,
} from "./http";
import { boundedUpload, uploadName } from "./documents";
import { deliveriesDir } from "./config";
function engagement(key: string, ctx: Context) {
  const item = one("SELECT * FROM engagements WHERE id=?", key);
  if (!item) fail(404, "not_found", "Engagement not found.");
  const customer = item.workspace_id === ctx.workspaceId;
  const assigned =
    ctx.staff &&
    !ctx.apiKey &&
    !!one(
      "SELECT * FROM assignments WHERE engagement_id=? AND user_id=?",
      key,
      ctx.userId,
    );
  if (!customer && !assigned) fail(404, "not_found", "Engagement not found.");
  return { item, customer, assigned };
}
function staffOnly(ctx: Context) {
  if (!ctx.staff || ctx.apiKey)
    fail(403, "staff_required", "This action requires an MLAI staff session.");
}
export async function portalRoutes(
  req: Request,
  path: string[],
  ctx: Context,
): Promise<Response | undefined> {
  const [section, key, action, target] = path;
  if (section === "staff") {
    staffOnly(ctx);
    if (key === "inquiries" && req.method === "GET")
      return json(
        all("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 100"),
      );
    if (key === "inquiries" && req.method === "PATCH") {
      const data = await body(
        req,
        z.object({
          id: z.string(),
          status: z.enum(["new", "reviewing", "closed"]),
        }),
      );
      run("UPDATE inquiries SET status=? WHERE id=?", data.status, data.id);
      return json({ ok: true });
    }
    if (key === "directory" && req.method === "GET")
      return json({
        staff: all(
          "SELECT u.id,u.name,u.email FROM user u JOIN staff s ON s.user_id=u.id",
        ),
        workspaces: all("SELECT id,name FROM workspaces ORDER BY name"),
      });
    if (key === "engagements" && req.method === "POST") {
      const data = await body(
        req,
        z.object({
          workspace_id: z.string(),
          title: z.string().trim().min(1).max(160),
          description: z.string().min(1).max(8000),
        }),
      );
      if (!one("SELECT id FROM workspaces WHERE id=?", data.workspace_id))
        fail(404, "not_found", "Workspace not found.");
      const eid = id();
      sqlite.transaction(() => {
        run(
          "INSERT INTO engagements(id,workspace_id,title,description,status,created_at,updated_at) VALUES(?,?,?,?,'active',?,?)",
          eid,
          data.workspace_id,
          data.title,
          data.description,
          now(),
          now(),
        );
        run(
          "INSERT INTO assignments(engagement_id,user_id) VALUES(?,?)",
          eid,
          ctx.userId,
        );
        notify(
          data.workspace_id,
          "A new engagement is ready to review.",
          `/app/portal?engagement=${eid}`,
        );
      })();
      return json({ id: eid }, 201);
    }
  }
  if (section !== "engagements") return;
  if (!key && req.method === "GET") {
    const staffView = new URL(req.url).searchParams.get("staff") === "1";
    if (staffView) {
      staffOnly(ctx);
      return json(
        all(
          "SELECT e.* FROM engagements e WHERE e.status='requested' OR EXISTS(SELECT 1 FROM assignments a WHERE a.engagement_id=e.id AND a.user_id=?) ORDER BY e.updated_at DESC",
          ctx.userId,
        ),
      );
    }
    return json(
      all(
        "SELECT * FROM engagements WHERE workspace_id=? ORDER BY updated_at DESC",
        ctx.workspaceId,
      ),
    );
  }
  if (!key && req.method === "POST") {
    const data = await body(
      req,
      z.object({
        title: z.string().trim().min(1).max(160),
        description: z.string().min(1).max(8000),
      }),
    );
    const eid = id();
    run(
      "INSERT INTO engagements(id,workspace_id,title,description,created_at,updated_at) VALUES(?,?,?,?,?,?)",
      eid,
      ctx.workspaceId,
      data.title,
      data.description,
      now(),
      now(),
    );
    notifyStaff(
      "A service request needs triage.",
      `/app/staff?engagement=${eid}`,
    );
    notify(
      ctx.workspaceId,
      "Service request submitted.",
      `/app/portal?engagement=${eid}`,
      ctx.userId,
    );
    return json({ id: eid }, 201);
  }
  if (!key) return;
  if (action === "claim" && req.method === "POST") {
    staffOnly(ctx);
    sqlite.transaction(() => {
      if (
        !one(
          "SELECT id FROM engagements WHERE id=? AND status='requested'",
          key,
        )
      )
        fail(404, "not_found", "Unassigned request not found.");
      run(
        "INSERT OR IGNORE INTO assignments(engagement_id,user_id) VALUES(?,?)",
        key,
        ctx.userId,
      );
      run(
        "UPDATE engagements SET status='active',updated_at=? WHERE id=?",
        now(),
        key,
      );
    })();
    return json({ ok: true });
  }
  const access = engagement(key, ctx),
    workspaceId = String(access.item.workspace_id);
  if (req.method === "GET" && !action)
    return json({
      ...access.item,
      canManage: access.assigned,
      reviews: all(
        "SELECT r.*,u.name FROM reviews r JOIN deliverables d ON d.id=r.deliverable_id JOIN user u ON u.id=r.user_id WHERE d.engagement_id=? ORDER BY r.created_at",
        key,
      ),
      milestones: all(
        "SELECT * FROM milestones WHERE engagement_id=? ORDER BY created_at",
        key,
      ),
      deliverables: all(
        "SELECT d.*,(SELECT decision FROM reviews r WHERE r.deliverable_id=d.id ORDER BY created_at DESC LIMIT 1) decision FROM deliverables d WHERE engagement_id=? ORDER BY created_at DESC",
        key,
      ),
      comments: all(
        "SELECT c.*,u.name FROM comments c JOIN user u ON u.id=c.user_id WHERE engagement_id=? ORDER BY created_at",
        key,
      ),
      assignments: all(
        "SELECT u.id,u.name FROM assignments a JOIN user u ON u.id=a.user_id WHERE a.engagement_id=?",
        key,
      ),
    });
  if (req.method === "PATCH" && !action) {
    const data = await body(
      req,
      z.object({
        status: z
          .enum(["active", "review", "completed", "cancelled"])
          .optional(),
        onboarding: z.record(z.string(), z.string().max(3000)).optional(),
      }),
    );
    if (data.status && !access.assigned)
      fail(
        403,
        "staff_required",
        "Only assigned staff can change engagement status.",
      );
    if (data.onboarding && !access.customer)
      fail(
        403,
        "customer_required",
        "Only workspace members can update customer onboarding.",
      );
    run(
      "UPDATE engagements SET status=coalesce(?,status),onboarding=coalesce(?,onboarding),updated_at=? WHERE id=?",
      data.status ?? null,
      data.onboarding ? JSON.stringify(data.onboarding) : null,
      now(),
      key,
    );
    notifyStaff(
      "Engagement activity updated.",
      `/app/staff?engagement=${key}`,
      key,
      ctx.userId,
    );
    notify(
      workspaceId,
      "Engagement updated.",
      `/app/portal?engagement=${key}`,
      ctx.userId,
    );
    return json({ ok: true });
  }
  if (action === "assign" && req.method === "POST") {
    if (!access.assigned)
      fail(403, "staff_required", "Only assigned staff can add colleagues.");
    const data = await body(req, z.object({ user_id: z.string() }));
    if (!one("SELECT user_id FROM staff WHERE user_id=?", data.user_id))
      fail(400, "not_staff", "The selected account is not MLAI staff.");
    run(
      "INSERT OR IGNORE INTO assignments(engagement_id,user_id) VALUES(?,?)",
      key,
      data.user_id,
    );
    return json({ ok: true });
  }
  if (action === "comments" && req.method === "POST") {
    const data = await body(
      req,
      z.object({ content: z.string().trim().min(1).max(8000) }),
    );
    run(
      "INSERT INTO comments(id,engagement_id,user_id,content,created_at) VALUES(?,?,?,?,?)",
      id(),
      key,
      ctx.userId,
      data.content,
      now(),
    );
    notifyStaff(
      "Engagement activity updated.",
      `/app/staff?engagement=${key}`,
      key,
      ctx.userId,
    );
    notify(
      workspaceId,
      "New engagement comment.",
      `/app/portal?engagement=${key}`,
      ctx.userId,
    );
    return json({ ok: true }, 201);
  }
  if (action === "milestones") {
    if (!access.assigned)
      fail(403, "staff_required", "Only assigned staff can manage milestones.");
    if (req.method === "POST") {
      const data = await body(
        req,
        z.object({
          title: z.string().min(1).max(160),
          due_date: z.string().max(20).optional(),
        }),
      );
      run(
        "INSERT INTO milestones(id,engagement_id,title,due_date,created_at) VALUES(?,?,?,?,?)",
        id(),
        key,
        data.title,
        data.due_date || null,
        now(),
      );
      notifyStaff(
        "Engagement activity updated.",
        `/app/staff?engagement=${key}`,
        key,
        ctx.userId,
      );
      notify(
        workspaceId,
        "Milestone added.",
        `/app/portal?engagement=${key}`,
        ctx.userId,
      );
      return json({ ok: true });
    }
    if (req.method === "PATCH" && target) {
      const data = await body(
        req,
        z.object({ status: z.enum(["planned", "active", "complete"]) }),
      );
      run(
        "UPDATE milestones SET status=? WHERE id=? AND engagement_id=?",
        data.status,
        target,
        key,
      );
      notifyStaff(
        "Engagement activity updated.",
        `/app/staff?engagement=${key}`,
        key,
        ctx.userId,
      );
      notify(
        workspaceId,
        "Milestone updated.",
        `/app/portal?engagement=${key}`,
        ctx.userId,
      );
      return json({ ok: true });
    }
  }
  if (action === "deliverables") {
    if (req.method === "POST" && !target) {
      if (!access.assigned)
        fail(
          403,
          "staff_required",
          "Only assigned staff can upload deliverables.",
        );
      const { name } = uploadName(req),
        did = id(),
        directory = join(deliveriesDir, did),
        size = await boundedUpload(req, directory, "original");
      try {
        sqlite.transaction(() => {
          const version =
            (one<{ n: number }>(
              "SELECT max(version) n FROM deliverables WHERE engagement_id=? AND name=?",
              key,
              name,
            )?.n || 0) + 1;
          run(
            "INSERT INTO deliverables(id,engagement_id,name,version,size,created_at) VALUES(?,?,?,?,?,?)",
            did,
            key,
            name,
            version,
            size,
            now(),
          );
          run(
            "UPDATE engagements SET status='review',updated_at=? WHERE id=?",
            now(),
            key,
          );
          notifyStaff(
            "Engagement activity updated.",
            `/app/staff?engagement=${key}`,
            key,
            ctx.userId,
          );
          notify(
            workspaceId,
            "A deliverable is ready for review.",
            `/app/portal?engagement=${key}`,
            ctx.userId,
          );
        })();
      } catch (e) {
        await rm(directory, { recursive: true, force: true });
        throw e;
      }
      return json({ id: did }, 201);
    }
    if (target) {
      const d = one(
        "SELECT * FROM deliverables WHERE id=? AND engagement_id=?",
        target,
        key,
      );
      if (!d) fail(404, "not_found", "Deliverable not found.");
      if (req.method === "GET")
        return new Response(
          await readFile(join(deliveriesDir, target, "original")),
          {
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(String(d.name))}`,
              "Cache-Control": "private, no-store",
            },
          },
        );
      if (req.method === "POST") {
        if (!access.customer || ctx.role === "viewer")
          fail(
            403,
            "customer_required",
            "An editable customer membership is required for review.",
          );
        const data = await body(
          req,
          z.object({
            decision: z.enum(["approved", "changes_requested"]),
            comment: z.string().max(8000).default(""),
          }),
        );
        const latest = one<{ id: string }>(
          "SELECT id FROM deliverables WHERE engagement_id=? AND name=? ORDER BY version DESC LIMIT 1",
          key,
          d.name,
        );
        if (latest?.id !== target)
          fail(
            409,
            "superseded_version",
            "A newer version is available. Review the latest deliverable.",
          );
        run(
          "INSERT INTO reviews(id,deliverable_id,user_id,decision,comment,created_at) VALUES(?,?,?,?,?,?)",
          id(),
          target,
          ctx.userId,
          data.decision,
          data.comment,
          now(),
        );
        notifyStaff(
          "Engagement activity updated.",
          `/app/staff?engagement=${key}`,
          key,
          ctx.userId,
        );
        notify(
          workspaceId,
          "Deliverable review recorded.",
          `/app/portal?engagement=${key}`,
          ctx.userId,
        );
        return json({ ok: true });
      }
    }
  }
}
