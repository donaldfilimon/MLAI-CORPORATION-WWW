import { describe, it, expect, vi, afterEach } from "vitest";
import { generateLlmResponse, type ChatMessage } from "../lib/server/llm";
import type { SessionData } from "../lib/server/session";

const user: SessionData = { userId: "u1", email: "user@example.com", accessToken: "t" };

afterEach(() => vi.unstubAllEnvs());

describe("generateLlmResponse — safe fallback (no provider key)", () => {
  it("returns the local scaffold echoing the latest user message", async () => {
    vi.stubEnv("GEMINI_API_KEY", ""); // unconfigured → never hits the network
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
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await generateLlmResponse([], user);
    expect(res.provider).toBe("local-fallback");
    expect(res.text).toContain("No prompt provided.");
  });
});
