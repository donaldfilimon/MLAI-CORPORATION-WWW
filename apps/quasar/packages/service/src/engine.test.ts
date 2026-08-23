import { test, expect } from "bun:test";
import Anthropic from "@anthropic-ai/sdk";
import { runGeneration, createSiteTools, mapEngineError, type EngineClient, type EngineStream } from "./engine";
import type { GenerationEvent } from "@quasar/shared";

type RunnableTool = { name: string; run: (args: unknown) => Promise<unknown> };

// With `stream: true`, the real tool runner yields one stream handle per
// turn (see BetaToolRunner's `Symbol.asyncIterator`), not one message per
// turn — each handle resolves its `finalMessage()` to `{content: [...]}`.
// The fake mirrors that shape so these tests exercise the same loop shape
// runGeneration actually drives against the SDK.
function fakeRunner(messages: Array<{ content: unknown[] }>) {
  return {
    async *[Symbol.asyncIterator](): AsyncIterator<EngineStream> {
      for (const m of messages) yield { finalMessage: async () => m };
    },
    async done() { return messages[messages.length - 1]; },
  };
}

test("emits text events per assistant message, then done", async () => {
  const events: GenerationEvent[] = [];
  const client = { beta: { messages: { toolRunner: (_p: Record<string, unknown>) =>
    fakeRunner([{ content: [{ type: "text", text: "Building your site" }] }]) } } };
  await runGeneration({ client, siteDir: "/tmp/x", prompt: "make a site", onEvent: (e) => events.push(e) });
  expect(events).toEqual([{ type: "text", text: "Building your site" }, { type: "done" }]);
});

test("maps a throwing runner to a single error event", async () => {
  const events: GenerationEvent[] = [];
  const client = { beta: { messages: { toolRunner: () => { throw new Error("rate limited"); } } } };
  await runGeneration({ client, siteDir: "/tmp/x", prompt: "p", onEvent: (e) => events.push(e) });
  expect(events).toEqual([{ type: "error", message: "rate limited" }]);
});

test("passes model, prompt, and stream:true through to the runner", async () => {
  let seen: Record<string, unknown> = {};
  const client = { beta: { messages: { toolRunner: (p: Record<string, unknown>) => { seen = p; return fakeRunner([]); } } } };
  await runGeneration({ client, siteDir: "/tmp/x", prompt: "hello", onEvent: () => {} });
  expect(seen.model).toBe("claude-opus-5");
  expect(seen.max_tokens).toBe(64000);
  expect((seen.thinking as { type: string }).type).toBe("adaptive");
  // Regression guard: at max_tokens 64000 the SDK throws client-side before
  // any request leaves the process unless this is set (see the streaming
  // regression test below for the end-to-end version of this assertion).
  expect(seen.stream).toBe(true);
  expect(JSON.stringify(seen.messages)).toContain("hello");
  expect((seen.tools as unknown[]).length).toBe(3);
  expect(seen.system as string).toContain("Next.js 15");
});

test("a throwing onEvent on the terminal event does not escape and does not double-emit", async () => {
  const events: GenerationEvent[] = [];
  const client = { beta: { messages: { toolRunner: (_p: Record<string, unknown>) => fakeRunner([]) } } };
  let calls = 0;
  await runGeneration({
    client,
    siteDir: "/tmp/x",
    prompt: "p",
    onEvent: (e) => {
      calls += 1;
      events.push(e);
      throw new Error("consumer blew up handling done");
    },
  });
  expect(calls).toBe(1);
  expect(events).toEqual([{ type: "done" }]);
});

test("streaming regression: a real Anthropic client against a local stub actually sends the request and never throws client-side", async () => {
  // This is the exact bug FIX 1 addresses: `toolRunner` without `stream:
  // true` at max_tokens 64000 threw synchronously, client-side, before any
  // network call was made — so `bodies.length` would have stayed 0 forever.
  // A fake runner (the tests above) can't catch that class of bug, because
  // it never goes near the real SDK's request-building code; only a real
  // `Anthropic` client pointed at a stub server can.
  const bodies: unknown[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      bodies.push(await req.json());
      const message = {
        id: "msg_stub",
        type: "message",
        role: "assistant",
        model: "claude-opus-5",
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 0 },
      };
      const sse =
        `event: message_start\ndata: ${JSON.stringify({ type: "message_start", message })}\n\n` +
        `event: message_delta\ndata: ${JSON.stringify({ type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 0 } })}\n\n` +
        `event: message_stop\ndata: ${JSON.stringify({ type: "message_stop" })}\n\n`;
      return new Response(sse, { headers: { "content-type": "text/event-stream" } });
    },
  });

  try {
    const client = new Anthropic({
      apiKey: "test-key",
      baseURL: `http://localhost:${server.port}`,
      timeout: 5000,
      maxRetries: 0,
    }) as unknown as EngineClient;

    const events: GenerationEvent[] = [];
    await runGeneration({ client, siteDir: "/tmp/x", prompt: "make a site", onEvent: (e) => events.push(e) });

    // The request actually left the client (the old bug never got this far).
    expect(bodies.length).toBeGreaterThan(0);
    expect((bodies[0] as { stream?: boolean }).stream).toBe(true);
    // Exactly one terminal event, and runGeneration never throws.
    expect(events.length).toBeGreaterThan(0);
    expect(events.at(-1)).toEqual({ type: "done" });
  } finally {
    server.stop();
  }
});

test("streaming regression: a real Anthropic client against a 429 stub maps to the rate-limit message end to end", async () => {
  // Complements the mapEngineError unit tests below (which construct SDK
  // error instances by hand) by proving the SDK actually throws a
  // `RateLimitError` — that our mapper recognizes — for a real 429 response,
  // the same way the earlier stub test proves `stream: true` actually
  // reaches the wire.
  const server = Bun.serve({
    port: 0,
    fetch() {
      return new Response(
        JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "slow down" } }),
        { status: 429, headers: { "content-type": "application/json" } }
      );
    },
  });

  try {
    const client = new Anthropic({
      apiKey: "test-key",
      baseURL: `http://localhost:${server.port}`,
      timeout: 5000,
      maxRetries: 0,
    }) as unknown as EngineClient;

    const events: GenerationEvent[] = [];
    await runGeneration({ client, siteDir: "/tmp/x", prompt: "make a site", onEvent: (e) => events.push(e) });

    expect(events).toEqual([
      { type: "error", message: "Rate limited by the Anthropic API — try again shortly." },
    ]);
  } finally {
    server.stop();
  }
});

test("mapEngineError maps typed SDK errors to user-readable messages", () => {
  const headers = new Headers();
  expect(mapEngineError(new Anthropic.RateLimitError(429, { message: "slow down" }, "slow down", headers))).toBe(
    "Rate limited by the Anthropic API — try again shortly."
  );
  expect(
    mapEngineError(new Anthropic.AuthenticationError(401, { message: "bad key" }, "bad key", headers))
  ).toBe("Anthropic credentials missing or invalid — set ANTHROPIC_API_KEY or run `ant auth login`.");
  expect(mapEngineError(new Anthropic.APIConnectionError({ message: "econnrefused" }))).toBe(
    "Could not reach the Anthropic API — check your connection."
  );
  const other = mapEngineError(
    new Anthropic.InternalServerError(500, { message: "boom" }, undefined, headers)
  );
  expect(other).toContain("Anthropic API error 500");
  expect(mapEngineError(new Error("plain failure"))).toBe("plain failure");
  expect(mapEngineError("not an error object")).toBe("not an error object");
});

test("write_file tool rejects a traversal path and emits no tool event", async () => {
  const events: GenerationEvent[] = [];
  const tools = createSiteTools("/tmp/x", (e) => events.push(e)) as RunnableTool[];
  const writeFile = tools.find((t) => t.name === "write_file");
  expect(writeFile).toBeDefined();
  await expect(writeFile!.run({ path: "../escape", content: "oops" })).rejects.toThrow();
  expect(events).toEqual([]);
});
