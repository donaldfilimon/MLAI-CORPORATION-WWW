import { readConversationAudit } from "@/lib/server/audit-store";
import { readJsonLimited } from "@/lib/server/body-limit";
import { getSession } from "@/lib/server/session";
import { checkAdminAccess, checkOrganizationAccess } from "@/lib/server/workos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = await checkAdminAccess(user);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: 403 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  const { id } = await context.params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid audit id" }, { status: 400 });
  const body = await readJsonLimited<{ reason?: unknown }>(req, 4 * 1024);
  if (body instanceof Response) return body;
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 8 || reason.length > 200) {
    return Response.json({ error: "An access reason of 8–200 characters is required" }, { status: 400 });
  }
  try {
    const audit = await readConversationAudit({
      id,
      user: { ...user, organizationId: access.organizationId },
      admin: true,
      reason,
    });
    if (!audit) return Response.json({ error: "Audit not found" }, { status: 404 });
    return Response.json({ ok: true, audit }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin audit read failed:", error);
    return Response.json({ error: "Audit could not be decrypted" }, { status: 503 });
  }
}
