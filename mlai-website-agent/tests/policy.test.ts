import assert from "node:assert/strict";
import test from "node:test";

import agent from "../agent/agent.ts";

test("the standalone scaffold exposes no optional default tools", () => {
  assert.equal(agent.defaultTools, false);
});

test("standalone model selection refuses before provider access", async () => {
  const configuredModel: unknown = agent.model;
  assert.ok(configuredModel && typeof configuredModel === "object");

  const dynamicModel = configuredModel as {
    kind?: string;
    events?: {
      "step.started"?: (event: unknown, context: unknown) => unknown;
    };
  };
  assert.equal(dynamicModel.kind, "eve:dynamic");
  assert.equal(typeof dynamicModel.events?.["step.started"], "function");

  let providerRequests = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    providerRequests += 1;
    throw new Error("provider access was attempted");
  }) as typeof fetch;

  try {
    await assert.rejects(
      async () => dynamicModel.events?.["step.started"]?.({}, {}),
      /Standalone MLAI agent model access is disabled/,
    );
    assert.equal(providerRequests, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
