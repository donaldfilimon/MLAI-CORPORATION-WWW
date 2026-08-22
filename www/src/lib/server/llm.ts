/**
 * LLM provider call — Gemini and Anthropic, with a safe scaffold fallback.
 *
 * Provider selection (most specific first):
 *   1. `LLM_PROVIDER=gemini|anthropic` — an explicit choice always wins, provided
 *      that provider's API key is present (otherwise we fall through to scaffold,
 *      surfacing the misconfiguration rather than silently using the other one).
 *   2. Otherwise auto-detect by which key is configured (Gemini wins a tie, to
 *      preserve the prior default behaviour).
 *   3. No usable key → the graceful scaffold response (the app builds with no key;
 *      a key is only needed at runtime).
 *
 * Gemini path ported verbatim from the retired Hono server. Anthropic path calls
 * the Messages API directly (raw fetch — no SDK in this surface), defaulting to
 * `claude-opus-4-8` with env overrides.
 */
import type { SessionData } from "./session";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LlmResult = { provider: string; model: string; text: string };
type Provider = "gemini" | "anthropic";

const systemPreamble = (email: string) =>
  `You are MLAI's private AI systems assistant. Be direct, technical, and safety-conscious. The signed-in user is ${email}.`;

function hasKey(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0;
}

function resolveProvider(): Provider | null {
  const explicit = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (explicit === "anthropic") return hasKey("ANTHROPIC_API_KEY") ? "anthropic" : null;
  if (explicit === "gemini") return hasKey("GEMINI_API_KEY") ? "gemini" : null;
  // No explicit setting — auto-detect. Gemini wins a tie (prior default).
  if (hasKey("GEMINI_API_KEY")) return "gemini";
  if (hasKey("ANTHROPIC_API_KEY")) return "anthropic";
  return null;
}

async function callGemini(messages: ChatMessage[], user: SessionData): Promise<LlmResult | null> {
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
            parts: [{ text: `${systemPreamble(user.email)}\n\n${prompt}` }],
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
  return text ? { provider: "gemini", model, text } : null;
}

async function callAnthropic(messages: ChatMessage[], user: SessionData): Promise<LlmResult | null> {
  const model = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
  const maxTokensEnv = Number(process.env.ANTHROPIC_MAX_TOKENS);
  const maxTokens = Number.isFinite(maxTokensEnv) && maxTokensEnv > 0 ? maxTokensEnv : 1024;

  // Anthropic takes the system prompt at the top level; only user/assistant turns
  // belong in `messages`. Fold any inline system turns into the system preamble.
  const systemTurns = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content);
  const turns = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({ role: message.role, content: message.content }));
  if (turns.length === 0) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      // Note: no `temperature` — Opus 4.x rejects sampling params with a 400.
      system: [systemPreamble(user.email), ...systemTurns].join("\n\n"),
      messages: turns,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic request failed: ${res.status} ${detail}`);
  }

  const data = await res.json();
  const text = (Array.isArray(data?.content) ? data.content : [])
    .filter((block: { type?: string }) => block?.type === "text")
    .map((block: { text?: string }) => block.text ?? "")
    .join("")
    .trim();
  return text ? { provider: "anthropic", model, text } : null;
}

/**
 * Public-safe description of the active LLM configuration (no secrets) for the
 * `/api/llm/status` surface. `configured` is true only when the resolved
 * provider has a usable key; otherwise the chat route returns the scaffold.
 */
export function getLlmStatus(): { provider: string; configured: boolean; model: string } {
  const provider = resolveProvider();
  if (provider === "anthropic") {
    return { provider: "anthropic", configured: true, model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8" };
  }
  if (provider === "gemini") {
    return { provider: "gemini", configured: true, model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" };
  }
  // No usable key — report the requested/default provider as unconfigured.
  const requested = process.env.LLM_PROVIDER?.trim().toLowerCase();
  const reported = requested === "anthropic" ? "anthropic" : "gemini";
  return {
    provider: reported,
    configured: false,
    model:
      reported === "anthropic"
        ? process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8"
        : process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
  };
}

export async function generateLlmResponse(messages: ChatMessage[], user: SessionData): Promise<LlmResult> {
  const lastUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

  const provider = resolveProvider();
  if (provider === "anthropic") {
    const out = await callAnthropic(messages, user);
    if (out) return out;
  } else if (provider === "gemini") {
    const out = await callGemini(messages, user);
    if (out) return out;
  }

  return {
    provider: "local-fallback",
    model: "mlai-safe-scaffold",
    text: `LLM provider is not configured yet, so this protected API returned a scaffolded response. Received request: ${lastUserMessage || "No prompt provided."}\n\nNext steps: set GEMINI_API_KEY or ANTHROPIC_API_KEY (with LLM_PROVIDER) server-side, keep calls behind WorkOS sessions, and add workflow-specific policies before enabling production actions.`,
  };
}
