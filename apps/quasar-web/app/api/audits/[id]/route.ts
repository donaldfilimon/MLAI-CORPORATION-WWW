import { deleteOwnConversationAudit, readConversationAudit } from "@/lib/server/audit-store";
import { getSession } from "@/lib/server/session";
import { checkOrganizationAccess } from "@/lib/server/workos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  const { id } = await context.params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid audit id" }, { status: 400 });
  try {
    const url = new URL(req.url);
    const audit = await readConversationAudit({
      id,
      user: { ...user, organizationId: access.organizationId },
      action: url.searchParams.get("download") === "1" ? "export" : "read",
    });
    if (!audit) return Response.json({ error: "Audit not found" }, { status: 404 });
    return Response.json({ ok: true, audit }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Audit read failed:", error);
    return Response.json({ error: "Audit could not be decrypted" }, { status: 503 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  const { id } = await context.params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid audit id" }, { status: 400 });
  try {
    const deleted = await deleteOwnConversationAudit(id, { ...user, organizationId: access.organizationId });
    if (!deleted) return Response.json({ error: "Audit not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Audit delete failed:", error);
    return Response.json({ error: "Audit could not be deleted" }, { status: 503 });
  }
}
