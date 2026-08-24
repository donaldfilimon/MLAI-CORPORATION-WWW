import type { SessionData } from "./session";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmResult = { provider: "gemini" | "local-fallback"; model: string; text: string };

const GEMINI_MODEL = "gemini-3.7-flash";
const GATEWAY_MODEL = `google/${GEMINI_MODEL}`;
const SYSTEM_PREAMBLE =
  "You are Quesar, MLAI's private AI systems assistant. Be direct, technical, safety-conscious, and explicit about uncertainty. Never imply that an unverified target is a measured result.";

function gatewayConfig(): { url: string; token: string; gatewayId: string } | null {
  const rawUrl = process.env.CLOUDFLARE_AI_GATEWAY_URL?.trim();
  const token = process.env.CLOUDFLARE_AI_GATEWAY_TOKEN?.trim();
  const gatewayId = process.env.CLOUDFLARE_AI_GATEWAY_ID?.trim();
  if (!rawUrl || !token || !gatewayId) return null;
  const url = new URL(rawUrl);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "api.cloudflare.com" ||
    !/^\/client\/v4\/accounts\/[^/]+\/ai\/v1\/chat\/completions$/.test(url.pathname) ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "CLOUDFLARE_AI_GATEWAY_URL must be the Cloudflare AI REST chat-completions endpoint",
    );
  }
  return { url: url.toString(), token, gatewayId };
}

async function callGemini(messages: ChatMessage[]): Promise<LlmResult | null> {
  const gateway = gatewayConfig();
  if (!gateway) return null;

  const turns = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({ role: message.role, content: message.content }));
  const inlinePolicy = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  if (!turns.some((message) => message.role === "user")) return null;

  const response = await fetch(gateway.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gateway.token}`,
      "cf-aig-gateway-id": gateway.gatewayId,
      // Cloudflare logs payloads by default. Quesar keeps the only content log
      // in its own KMS-encrypted audit store; the gateway retains metadata only.
      "cf-aig-collect-log-payload": "false",
      "cf-aig-skip-cache": "true",
      "cf-aig-request-timeout": "25000",
      "cf-aig-max-attempts": "2",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model: GATEWAY_MODEL,
      messages: [
        { role: "system", content: [SYSTEM_PREAMBLE, inlinePolicy].filter(Boolean).join("\n\n") },
        ...turns,
      ],
      temperature: 0.4,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cloudflare AI Gateway request failed with status ${response.status}`);
  }
  const data: unknown = await response.json();
  const choice =
    data && typeof data === "object" && Array.isArray((data as { choices?: unknown }).choices)
      ? (data as { choices: Array<{ message?: { content?: unknown } }> }).choices[0]
      : undefined;
  const text = typeof choice?.message?.content === "string" ? choice.message.content.trim() : "";
  return text ? { provider: "gemini", model: GEMINI_MODEL, text } : null;
}

export function getLlmStatus(): { provider: string; configured: boolean; model: string; gateway: string } {
  let configured = false;
  try {
    configured = gatewayConfig() !== null;
  } catch {
    configured = false;
  }
  return { provider: "gemini", configured, model: GEMINI_MODEL, gateway: "cloudflare-ai-gateway" };
}

// `_user` is retained as a compatibility parameter for callers/tests, but is
// intentionally never serialized or sent to the model provider.
export async function generateLlmResponse(
  messages: ChatMessage[],
  _user?: SessionData,
): Promise<LlmResult> {
  const output = await callGemini(messages);
  if (output) return output;
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content;
  return {
    provider: "local-fallback",
    model: "quesar-safe-scaffold",
    text: `Gemini is not configured through Cloudflare AI Gateway yet. Received request: ${
      lastUserMessage || "No prompt provided."
    }\n\nConfigure the authenticated gateway and its stored Google AI Studio provider key before enabling production generation.`,
  };
}
