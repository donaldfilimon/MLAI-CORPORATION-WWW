import { getSession, toPublicUser } from "@/lib/server/session";
import { getLlmStatus } from "@/lib/server/llm";
import { checkOrganizationAccess } from "@/lib/server/workos";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });

  return Response.json({
    ok: true,
    user: toPublicUser({ ...user, organizationId: access.organizationId }),
    llm: getLlmStatus(),
  });
}
