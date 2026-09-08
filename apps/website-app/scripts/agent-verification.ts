import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import {
  agentRunDetailSchema,
  type AgentRunDetail,
} from "../src/lib/agent-contracts";

export interface FixtureAccount {
  cookie: string;
  workspace: string;
  userId: string;
}
export async function fixtureApi(
  account: FixtureAccount,
  path: string,
  method = "GET",
  data?: unknown,
  raw?: string,
) {
  const { dispatch } = await import("../src/lib/server/api");
  return dispatch(
    new Request(`${process.env.APP_URL}/api/v1/${path}`, {
      method,
      headers: {
        Cookie: account.cookie,
        Origin: process.env.APP_URL!,
        "X-Workspace-ID": account.workspace,
        "Content-Type":
          raw === undefined ? "application/json" : "application/octet-stream",
        ...(raw === undefined ? {} : { "X-File-Name": "agent-review.md" }),
      },
      body:
        raw === undefined
          ? data === undefined
            ? undefined
            : JSON.stringify(data)
          : raw,
    }),
    path.split("?")[0].split("/"),
  );
}
export async function fixtureJson(
  account: FixtureAccount,
  path: string,
  method = "GET",
  data?: unknown,
) {
  const response = await fixtureApi(account, path, method, data);
  assert.ok(
    response.ok,
    `Fixture API ${method} ${path} returned ${response.status}`,
  );
  return response.json() as Promise<unknown>;
}
export async function fixtureAccount(label: string): Promise<FixtureAccount> {
  const { auth } = await import("../src/lib/server/auth");
  const response = await auth.handler(
    new Request(`${process.env.APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        Origin: process.env.APP_URL!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Agent verification",
        email: `${label}-${randomBytes(8).toString("hex")}@example.test`,
        password: randomBytes(24).toString("base64url"),
      }),
    }),
  );
  assert.equal(response.status, 200, "Fixture registration failed");
  const user = z
    .object({ user: z.object({ id: z.string() }) })
    .parse(await response.json()).user;
  const cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const { one } = await import("../src/lib/server/db");
  const workspace = one<{ workspace_id: string }>(
    "SELECT workspace_id FROM memberships WHERE user_id=?",
    user.id,
  )!.workspace_id;
  return { cookie, workspace, userId: user.id };
}
export async function waitFor<T>(
  read: () => Promise<T>,
  matches: (value: T) => boolean,
  label: string,
  timeoutMs = 300_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await read();
    if (matches(value)) return value;
    if (Date.now() > deadline)
      throw new Error(`Timed out waiting for ${label}`);
    await new Promise((r) => setTimeout(r, 250));
  }
}
export async function runDetail(account: FixtureAccount, id: string) {
  return agentRunDetailSchema.parse(
    await fixtureJson(account, `agent/runs/${id}`),
  );
}
export async function startFixtureRun(
  account: FixtureAccount,
  objective: string,
  documentIds?: string[],
) {
  const conversation = z
    .object({ id: z.string() })
    .parse(await fixtureJson(account, "conversations", "POST", {}));
  return agentRunDetailSchema.parse(
    await fixtureJson(account, "agent/runs", "POST", {
      conversation_id: conversation.id,
      objective,
      ...(documentIds ? { document_ids: documentIds } : {}),
    }),
  );
}
export async function waitRun(
  account: FixtureAccount,
  id: string,
  status: AgentRunDetail["status"],
) {
  const detail = await waitFor(
    () => runDetail(account, id),
    (r) => [status, "failed", "cancelled"].includes(r.status),
    status,
  );
  assert.equal(
    detail.status,
    status,
    `Agent ${id}: ${detail.error || detail.status}; steps=${detail.steps.map((step) => step.tool).join(",") || "none"}; actions=${detail.actions.map((action) => `${action.tool}:${action.status}`).join(",") || "none"}; results=${detail.results.map((result) => `${result.kind}:${result.status}`).join(",") || "none"}`,
  );
  return detail;
}
export function startFixtureWorker() {
  const child = spawn(
    process.execPath,
    ["--import", "tsx", "scripts/worker.ts"],
    {
      env: process.env,
      stdio: ["ignore", "ignore", "inherit"],
      detached: process.platform !== "win32",
    },
  );
  child.on("error", () => {});
  return child;
}
export async function stopFixtureWorker(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  const timer = setTimeout(() => {
    try {
      if (process.platform !== "win32" && child.pid)
        process.kill(-child.pid, "SIGKILL");
      else child.kill("SIGKILL");
    } catch {}
  }, 15_000);
  try {
    await exited;
  } finally {
    clearTimeout(timer);
  }
}
