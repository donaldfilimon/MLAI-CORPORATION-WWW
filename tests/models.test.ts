import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
const dir = mkdtempSync(join(tmpdir(), "mlai-models-"));
process.env.MLAI_DATA_DIR = dir;
const { sqlite, run } = await import("../src/lib/server/db");
const { generate, selectedModel } = await import("../src/lib/server/models");
const { checkedCitations } = await import("../src/lib/server/chat");
const { embeddingSpace } = await import("../src/lib/server/embeddings");
run("INSERT INTO workspaces(id,name,created_at) VALUES('workspace','Test',1)");
const local = {
  id: "local",
  name: "Local",
  kind: "local",
  url: "http://127.0.0.1:8080/v1",
  model: "test-model",
};
const hosted = {
  id: "hosted",
  name: "Hosted",
  kind: "hosted",
  url: "https://provider.example.test/v1",
  model: "hosted-model",
  keyEnv: "TEST_HOSTED_KEY",
};
beforeEach(() => {
  vi.restoreAllMocks();
  writeFileSync(join(dir, "connections.json"), JSON.stringify([local, hosted]));
  run("UPDATE workspaces SET provider_id='local',hosted_consent=0");
});
afterAll(() => {
  vi.restoreAllMocks();
  sqlite.close();
  rmSync(dir, { recursive: true, force: true });
});
it("never sends hosted traffic when a local connection fails", async () => {
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(new TypeError("disconnected"));
  await expect(async () => {
    for await (const _ of generate("workspace", [
      { role: "user", content: "test" },
    ])) {
    }
  }).rejects.toMatchObject({ code: "provider_unavailable" });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(String(fetch.mock.calls[0][0])).toContain("127.0.0.1");
});
it("requires stored consent before any hosted request", async () => {
  run("UPDATE workspaces SET provider_id='hosted'");
  const fetch = vi.spyOn(globalThis, "fetch");
  await expect(selectedModel("workspace")).rejects.toMatchObject({
    code: "hosted_consent_required",
  });
  expect(fetch).not.toHaveBeenCalled();
});
it("streams the hosted-compatible protocol and preserves reported usage", async () => {
  run("UPDATE workspaces SET provider_id='hosted',hosted_consent=1");
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(
      new Response(
        'data: {"choices":[{"delta":{"content":"Answer"}}]}\n\ndata: {"usage":{"prompt_tokens":11,"completion_tokens":2}}\n\ndata: [DONE]\n\n',
      ),
    );
  const parts = [];
  for await (const p of generate("workspace", [
    { role: "user", content: "test" },
  ]))
    parts.push(p);
  expect(parts).toContainEqual({ text: "Answer" });
  expect(parts).toContainEqual({ usage: { input: 11, output: 2 } });
  expect(String(fetch.mock.calls[0][0])).toContain("provider.example.test");
  expect(fetch.mock.calls[0][1]?.redirect).toBe("error");
});
it("rejects empty model responses and invalid source identifiers", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("data: [DONE]\n\n"),
  );
  await expect(async () => {
    for await (const _ of generate("workspace", [])) {
    }
  }).rejects.toMatchObject({ code: "empty_response" });
  const result = checkedCitations("Fact [1] invented [999]", [
    {
      id: "chunk",
      documentId: "document",
      name: "Source",
      content: "private",
      location: { page: 3 },
    },
  ]);
  expect(result.content).toContain("[unsupported citation]");
  expect(result.citations[0]).not.toHaveProperty("content");
  expect(result.citations[0].location).toEqual({ page: 3 });
  expect(embeddingSpace).toMatch(/@[0-9a-f]{40}:normalized:384:v1$/);
});
