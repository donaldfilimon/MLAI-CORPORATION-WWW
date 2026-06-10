import { getSession } from "@/lib/server/session";
import { generateLlmResponse, type ChatMessage } from "@/lib/server/llm";
import { rateLimit, tooMany } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit("llm-chat", req, { windowMs: 60 * 1000, max: 10 })) return tooMany();
  const user = await getSession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages =
    body.messages
      ?.filter(
        (message) =>
          ["system", "user", "assistant"].includes(message.role) &&
          typeof message.content === "string" &&
          message.content.trim().length > 0,
      )
      .slice(-12) ?? [];

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
