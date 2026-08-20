import { test, expect } from "bun:test";
import { runGeneration } from "./engine";
import type { GenerationEvent } from "@quasar/shared";

function fakeRunner(messages: Array<{ content: unknown[] }>) {
  return {
    async *[Symbol.asyncIterator]() { for (const m of messages) yield m; },
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

test("passes model and prompt through to the runner", async () => {
  let seen: Record<string, unknown> = {};
  const client = { beta: { messages: { toolRunner: (p: Record<string, unknown>) => { seen = p; return fakeRunner([]); } } } };
  await runGeneration({ client, siteDir: "/tmp/x", prompt: "hello", onEvent: () => {} });
  expect(seen.model).toBe("claude-opus-5");
  expect(seen.max_tokens).toBe(64000);
  expect((seen.thinking as { type: string }).type).toBe("adaptive");
  expect(JSON.stringify(seen.messages)).toContain("hello");
});
