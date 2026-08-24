import { describe, it, expect, vi, afterEach } from "vitest";
import { generateLlmResponse, type ChatMessage } from "../lib/server/llm";
import type { SessionData } from "../lib/server/session";

const user: SessionData = { userId: "u1", email: "user@example.com", accessToken: "t" };

// Keep the no-key path hermetic regardless of the machine's shell env: blank
// every provider key + the selector so we never resolve a provider or hit the
// network when a real GEMINI_API_KEY / ANTHROPIC_API_KEY happens to be exported.
function clearProviderEnv() {
  vi.stubEnv("GEMINI_API_KEY", "");
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  vi.stubEnv("LLM_PROVIDER", "");
  vi.stubEnv("CLOUDFLARE_AI_GATEWAY_URL", "");
  vi.stubEnv("CLOUDFLARE_AI_GATEWAY_TOKEN", "");
  vi.stubEnv("CLOUDFLARE_AI_GATEWAY_ID", "");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("generateLlmResponse — safe fallback (no provider key)", () => {
  it("returns the local scaffold echoing the latest user message", async () => {
    clearProviderEnv(); // unconfigured → never hits the network
    const messages: ChatMessage[] = [
      { role: "system", content: "system preamble" },
      { role: "user", content: "first question" },
      { role: "assistant", content: "an earlier answer" },
      { role: "user", content: "the latest question" },
    ];
    const res = await generateLlmResponse(messages, user);
    expect(res.provider).toBe("local-fallback");
    expect(res.model).toBe("quesar-safe-scaffold");
    expect(res.text).toContain("the latest question"); // last user msg, not the first
    expect(res.text).not.toContain("first question");
  });

  it("degrades cleanly on an empty message list", async () => {
    clearProviderEnv();
    const res = await generateLlmResponse([], user);
    expect(res.provider).toBe("local-fallback");
    expect(res.text).toContain("No prompt provided.");
  });
});

describe("generateLlmResponse — Cloudflare AI Gateway endpoint", () => {
  it("uses Cloudflare's authenticated AI REST chat-completions endpoint", async () => {
    vi.stubEnv(
      "CLOUDFLARE_AI_GATEWAY_URL",
      "https://api.cloudflare.com/client/v4/accounts/account/ai/v1/chat/completions",
    );
    vi.stubEnv("CLOUDFLARE_AI_GATEWAY_TOKEN", "gateway-token");
    vi.stubEnv("CLOUDFLARE_AI_GATEWAY_ID", "quesar");
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      choices: [{ message: { content: "protected response" } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateLlmResponse([{ role: "user", content: "hello" }], user);

    expect(result.text).toBe("protected response");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account/ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer gateway-token",
          "cf-aig-gateway-id": "quesar",
          "cf-aig-collect-log-payload": "false",
        }),
      }),
    );
  });
});
