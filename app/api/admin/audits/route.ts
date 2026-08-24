import { listAdminConversationAudits } from "@/lib/server/audit-store";
import { readJsonLimited } from "@/lib/server/body-limit";
import { getSession } from "@/lib/server/session";
import { checkAdminAccess, checkOrganizationAccess } from "@/lib/server/workos";

export async function POST(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await checkAdminAccess(user);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: 403 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  const body = await readJsonLimited<{ reason?: unknown }>(req, 4 * 1024);
  if (body instanceof Response) return body;
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 8 || reason.length > 200) {
    return Response.json({ error: "An access reason of 8–200 characters is required" }, { status: 400 });
  }
  try {
    return Response.json({ ok: true, audits: await listAdminConversationAudits({
      user: { ...user, organizationId: access.organizationId },
      organizationId: access.organizationId,
      reason,
    }) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin audit list failed:", error);
    return Response.json({ error: "Audit history unavailable" }, { status: 503 });
  }
}
