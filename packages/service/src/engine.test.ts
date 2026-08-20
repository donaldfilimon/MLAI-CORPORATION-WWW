import { test, expect } from "bun:test";
import { runGeneration, createSiteTools } from "./engine";
import type { GenerationEvent } from "@quasar/shared";

type RunnableTool = { name: string; run: (args: unknown) => Promise<unknown> };

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

test("write_file tool rejects a traversal path and emits no tool event", async () => {
  const events: GenerationEvent[] = [];
  const tools = createSiteTools("/tmp/x", (e) => events.push(e)) as RunnableTool[];
  const writeFile = tools.find((t) => t.name === "write_file");
  expect(writeFile).toBeDefined();
  await expect(writeFile!.run({ path: "../escape", content: "oops" })).rejects.toThrow();
  expect(events).toEqual([]);
});
