import { readJsonLimited } from "@/lib/server/body-limit";
import {
  acceptChatConsent,
  CHAT_AUDIT_POLICY_VERSION,
  getChatConsent,
  withdrawChatConsent,
} from "@/lib/server/consent";
import { getSession } from "@/lib/server/session";
import { checkOrganizationAccess } from "@/lib/server/workos";

export async function GET(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json({ ok: true, consent: await getChatConsent(user) });
  } catch (error) {
    console.error("Consent read failed:", error);
    return Response.json({ error: "Consent status unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  const body = await readJsonLimited<{ policyVersion?: unknown; accepted?: unknown }>(req, 4 * 1024);
  if (body instanceof Response) return body;
  if (body.accepted !== true || body.policyVersion !== CHAT_AUDIT_POLICY_VERSION) {
    return Response.json({ error: "Current audit policy acceptance is required" }, { status: 400 });
  }
  try {
    return Response.json({
      ok: true,
      consent: await acceptChatConsent({ ...user, organizationId: access.organizationId }),
    });
  } catch (error) {
    console.error("Consent write failed:", error);
    return Response.json({ error: "Consent could not be recorded" }, { status: 503 });
  }
}

export async function DELETE(req: Request) {
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await withdrawChatConsent(user);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Consent withdrawal failed:", error);
    return Response.json({ error: "Consent could not be withdrawn" }, { status: 503 });
  }
}
