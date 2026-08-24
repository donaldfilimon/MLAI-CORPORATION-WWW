import { listConversationAudits } from "@/lib/server/audit-store";
import { getSession } from "@/lib/server/session";
import { checkOrganizationAccess } from "@/lib/server/workos";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  try {
    return Response.json({ ok: true, audits: await listConversationAudits({ ...user, organizationId: access.organizationId }) });
  } catch (error) {
    console.error("Audit list failed:", error);
    return Response.json({ error: "Audit history unavailable" }, { status: 503 });
  }
}
