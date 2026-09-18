import { readJsonLimited } from "@/lib/server/body-limit";
import { getSession } from "@/lib/server/session";
import { generateLlmResponse, type ChatMessage } from "@/lib/server/llm";
import { getChatConsent } from "@/lib/server/consent";
import { recordConversationAudit } from "@/lib/server/audit-store";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";
import { checkOrganizationAccess } from "@/lib/server/workos";

export async function POST(req: Request) {
  if (!rateLimit("llm-chat", req, { windowMs: 60 * 1000, max: 10 })) return tooMany();
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const access = await checkOrganizationAccess(user);
  if (!access.ok) return Response.json({ error: access.error }, { status: access.status });
  const authorizedUser = { ...user, organizationId: access.organizationId };

  // 128 KB cap: conversation history (the handler keeps only the last 12 turns).
  // `messages` is typed `unknown` deliberately: `readJsonLimited` guarantees the
  // body is an object, not that any field matches `ChatMessage[]`.
  const body = await readJsonLimited<{ messages?: unknown }>(req, 128 * 1024);
  if (body instanceof Response) return body;

  // Both guards are needed, and neither substitutes for the other. Without the
  // Array check, {"messages":"x"} / 5 / {} reached `.filter` and threw "not a
  // function"; without the per-entry object check, {"messages":[null]} threw on
  // `.role`. Either throw escaped this handler's try/catch (which only wraps the
  // LLM call below) as a 500 instead of the 400 the empty-messages branch means
  // to return. A malformed list simply filters down to nothing and lands there.
  const candidates: unknown[] = Array.isArray(body.messages) ? body.messages : [];
  const messages = candidates
    .filter((message): message is ChatMessage => {
      if (typeof message !== "object" || message === null) return false;
      const { role, content } = message as { role?: unknown; content?: unknown };
      return (
        (role === "system" || role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      );
    })
    .slice(-12);

  if (messages.length === 0) {
    return Response.json({ error: "At least one message is required" }, { status: 400 });
  }

  try {
    const consent = await getChatConsent(authorizedUser);
    if (!consent.accepted) {
      return Response.json(
        { error: "Current conversation audit policy consent is required", consent },
        { status: 428 },
      );
    }
    const response = await generateLlmResponse(messages, authorizedUser);
    // Audit persistence is part of the product contract, not optional
    // observability. If encryption or storage fails, do not return an unlogged
    // model response to the client.
    const audit = await recordConversationAudit(authorizedUser, messages, response);
    return Response.json({ ok: true, ...response, audit });
  } catch (err) {
    console.error("LLM API error:", err);
    return Response.json({ error: "Protected generation failed" }, { status: 503 });
  }
}
