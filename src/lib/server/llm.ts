/**
 * LLM provider call — ported verbatim from the retired Hono server.
 * Gemini when configured; safe scaffold fallback otherwise.
 */
import type { SessionData } from "./session";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function generateLlmResponse(messages: ChatMessage[], user: SessionData) {
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const prompt = messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join("\n\n");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are MLAI's private AI systems assistant. Be direct, technical, and safety-conscious. The signed-in user is ${user.email}.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 900,
          },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Gemini request failed: ${res.status} ${detail}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("")
      .trim();
    if (text) return { provider, model, text };
  }

  return {
    provider: "local-fallback",
    model: "mlai-safe-scaffold",
    text: `LLM provider is not configured yet, so this protected API returned a scaffolded response. Received request: ${lastUserMessage || "No prompt provided."}\n\nNext steps: set GEMINI_API_KEY or another provider key server-side, keep calls behind WorkOS sessions, and add workflow-specific policies before enabling production actions.`,
  };
}
