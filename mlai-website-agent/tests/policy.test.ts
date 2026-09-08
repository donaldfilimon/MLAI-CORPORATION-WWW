import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import agent from "../agent/agent.ts";
import * as eveChannelModule from "../agent/channels/eve.ts";
import { routeAuth, type AuthFn } from "eve/channels/auth";

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

test("production route authentication rejects anonymous and bearer callers", async () => {
  assert.ok("standaloneAuth" in eveChannelModule);
  const standaloneAuth = eveChannelModule.standaloneAuth as AuthFn<Request>;
  const previousVercelEnvironment = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";

  try {
    for (const headers of [
      undefined,
      { authorization: "Bearer deployment-service-token" },
    ]) {
      const result = await routeAuth(
        new Request("https://agent.example.test/eve/v1/session", { headers }),
        standaloneAuth,
      );
      assert.ok(result instanceof Response);
      assert.equal(result.status, 401);
      assert.deepEqual(await result.json(), {
        code: "mlai_agent_not_deployable",
        error:
          "Standalone MLAI agent access is disabled until application-owned authorization is integrated.",
        ok: false,
      });
    }
  } finally {
    if (previousVercelEnvironment === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = previousVercelEnvironment;
    }
  }
});

test("every production session and control route fails before dispatch", async () => {
  const channel = eveChannelModule.default as {
    routes: Array<{
      handler: (request: Request, context: unknown) => Promise<Response>;
      method: string;
      path: string;
    }>;
  };
  const protectedRoutes = [
    ["GET", "/eve/v1/info"],
    ["POST", "/eve/v1/session"],
    ["POST", "/eve/v1/session/:sessionId"],
    ["POST", "/eve/v1/session/:sessionId/cancel"],
    ["POST", "/eve/v1/session/:sessionId/compact"],
    ["POST", "/eve/v1/session/:sessionId/clear"],
    ["POST", "/eve/v1/session/:sessionId/reset"],
    ["GET", "/eve/v1/session/:sessionId/stream"],
  ] as const;
  const previousVercelEnvironment = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "production";

  try {
    for (const [method, path] of protectedRoutes) {
      const route = channel.routes.find(
        (candidate) => candidate.method === method && candidate.path === path,
      );
      assert.ok(route, `missing protected route ${method} ${path}`);
    }
    for (const route of channel.routes.filter(
      (route) => route.path !== "/eve/v1/health",
    )) {
      const { method, path } = route;
      for (const headers of [undefined, { authorization: "Bearer fixture" }]) {
        const requestPath = path.replace(":sessionId", "wrun_fixture");
        const response = await route.handler(
          new Request(`https://agent.example.test${requestPath}`, {
            method,
            headers,
          }),
          {},
        );
        assert.equal(
          response.status,
          401,
          `${method} ${path} did not fail closed`,
        );
      }
    }
  } finally {
    if (previousVercelEnvironment === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = previousVercelEnvironment;
    }
  }
});

test("the package deployment command refuses before invoking Eve", () => {
  const result = spawnSync("bun", ["run", "deploy", "--", "--help"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    timeout: 10_000,
  });

  assert.equal(result.signal, null);
  assert.equal(result.status, 1);
  assert.match(
    `${result.stdout}${result.stderr}`,
    /MLAI website agent is not deployable/,
  );
});
