import { describe, it, expect, vi, afterEach } from "vitest";
import { getLlmStatus, sendLlmMessage } from "../lib/api";

afterEach(() => vi.unstubAllGlobals());

function mockFetch(impl: (input: string, init?: RequestInit) => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("api — apiJson error/JSON contract (via wrappers)", () => {
  it("resolves the parsed JSON body on a 2xx response", async () => {
    mockFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(getLlmStatus()).resolves.toEqual({ ok: true });
  });

  it("throws the response body text on a non-ok response", async () => {
    mockFetch(async () => new Response("upstream exploded", { status: 500 }));
    await expect(getLlmStatus()).rejects.toThrow("upstream exploded");
  });

  it("falls back to 'Request failed: <status>' when the error body is empty", async () => {
    mockFetch(async () => new Response("", { status: 503 }));
    await expect(getLlmStatus()).rejects.toThrow("Request failed: 503");
  });

  it("sendLlmMessage POSTs the messages with a JSON content-type", async () => {
    const fn = mockFetch(
      async () =>
        new Response(JSON.stringify({ ok: true, provider: "x", model: "y", text: "z" }), {
          status: 200,
        }),
    );
    await sendLlmMessage([{ role: "user", content: "hi" }]);
    expect(fn).toHaveBeenCalledWith(
      "/api/llm/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });
});
