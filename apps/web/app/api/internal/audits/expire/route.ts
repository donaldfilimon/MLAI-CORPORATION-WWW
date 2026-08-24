import { expireConversationAudits } from "@/lib/server/audit-store";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { verifyAuditSchedulerRequest } from "@/lib/server/scheduler-auth";

export async function POST(req: Request) {
  if (!rateLimit("audit-expiry", req, { windowMs: 60_000, max: 5 })) return tooMany();
  if (!(await verifyAuditSchedulerRequest(req))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deleted = await expireConversationAudits();
  return Response.json(
    { ok: true, deleted },
    { headers: { "Cache-Control": "no-store" } },
  );
}
