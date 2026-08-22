import { readJsonLimited } from "@/lib/server/body-limit";
import { getSession } from "@/lib/server/session";
import { generateLlmResponse, type ChatMessage } from "@/lib/server/llm";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit("llm-chat", req, { windowMs: 60 * 1000, max: 10 })) return tooMany();
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
    const response = await generateLlmResponse(messages, user);
    return Response.json({ ok: true, ...response });
  } catch (err) {
    console.error("LLM API error:", err);
    return Response.json({ error: "LLM request failed" }, { status: 502 });
  }
}
