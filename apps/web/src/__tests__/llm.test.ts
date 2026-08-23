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
}

afterEach(() => vi.unstubAllEnvs());

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
    expect(res.model).toBe("mlai-safe-scaffold");
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
