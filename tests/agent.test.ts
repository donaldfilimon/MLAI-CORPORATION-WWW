import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const generated = vi.hoisted(() => ({
  outputs: [] as string[],
  calls: 0,
  pause: undefined as (() => Promise<void>) | undefined,
}));
vi.mock("../src/lib/server/models", async (original) => ({
  ...(await original<typeof import("../src/lib/server/models")>()),
  generate: async function* () {
    generated.calls++;
    if (generated.pause) await generated.pause();
    yield {
      text: generated.outputs.shift() || '{"kind":"answer","content":"Done."}',
    };
  },
}));
const dir = mkdtempSync(join(tmpdir(), "mlai-agent-"));
process.env.MLAI_DATA_DIR = dir;
process.env.APP_URL = "http://127.0.0.1:3100";
process.env.MLAI_LOCAL_MODEL_ID = "fixture-local";
const { auth } = await import("../src/lib/server/auth");
const { dispatch } = await import("../src/lib/server/api");
const { sqlite, one, run } = await import("../src/lib/server/db");
const { processAgentInterpretation } =
  await import("../src/lib/server/agent-jobs");
const { acquireAgentRun, processAgentRun } =
  await import("../src/lib/server/agent-runtime");
type Account = { cookie: string; id: string; workspace: string };
async function register(email: string): Promise<Account> {
  const r = await auth.handler(
    new Request(`${process.env.APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: process.env.APP_URL!,
      },
      body: JSON.stringify({
        email,
        password: "Local-only-password!42",
        name: email.split("@")[0],
      }),
    }),
  );
  const data = await r.json();
  expect(r.status).toBe(200);
  return {
    cookie: r.headers
      .getSetCookie()
      .map((c) => c.split(";")[0])
      .join("; "),
    id: data.user.id,
    workspace: one<{ workspace_id: string }>(
      "SELECT workspace_id FROM memberships WHERE user_id=?",
      data.user.id,
    )!.workspace_id,
  };
}
async function call(
  account: Account,
  path: string,
  method = "GET",
  data?: unknown,
  token?: string,
) {
  const response = await dispatch(
    new Request(`${process.env.APP_URL}/api/v1/${path}`, {
      method,
      headers: {
        Origin: process.env.APP_URL!,
        Cookie: account.cookie,
        "X-Workspace-ID": account.workspace,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
    path.split("?")[0].split("/"),
  );
  return { status: response.status, data: await response.json() };
}
let alice: Account, bob: Account, conversation: string;
beforeAll(async () => {
  alice = await register("agent-alice@example.test");
  bob = await register("agent-bob@example.test");
  conversation = (
    await call(alice, "conversations", "POST", { title: "Agent tests" })
  ).data.id;
});
afterAll(() => {
  sqlite.close();
  rmSync(dir, { recursive: true, force: true });
});
async function start(
  account = alice,
  objective = "Investigate",
  document_ids?: string[],
) {
  const r = await call(account, "agent/runs", "POST", {
    conversation_id: conversation,
    objective,
    ...(document_ids ? { document_ids } : {}),
  });
  expect(r.status, JSON.stringify(r.data)).toBe(201);
  return r.data.id as string;
}
async function work(output?: unknown, worker = "fixture") {
  if (output)
    generated.outputs.push(
      typeof output === "string" ? output : JSON.stringify(output),
    );
  const acquired = acquireAgentRun(worker);
  expect(acquired).toBeTruthy();
  await processAgentRun(acquired!, worker, new AbortController().signal);
}
async function proposal(
  tool = "create_project",
  input: unknown = { name: "Proposed" },
) {
  const id = await start();
  await work({ kind: "tool", tool, input });
  const detail = (await call(alice, `agent/runs/${id}`)).data;
  expect(detail.status).toBe("awaiting_approval");
  return { id, action: detail.actions[0] };
}
const projectCount = () =>
  one<{ n: number }>(
    "SELECT count(*) n FROM projects WHERE workspace_id=?",
    alice.workspace,
  )!.n;
describe("durable session-only agent", () => {
  it("rejects foreign conversations and all bearer authority", async () => {
    expect(
      (
        await call(bob, "agent/runs", "POST", {
          conversation_id: conversation,
          objective: "no",
        })
      ).status,
    ).toBe(404);
    expect(
      (
        await call(
          alice,
          "agent/runs",
          "POST",
          { conversation_id: conversation, objective: "no" },
          "invalid",
        )
      ).status,
    ).toBe(403);
  });
  it("proposes without writes; duplicate confirmation and expired lease replay write once", async () => {
    const before = projectCount(),
      p = await proposal();
    expect(projectCount()).toBe(before);
    expect(
      (await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {}))
        .status,
    ).toBe(200);
    expect(
      (await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {}))
        .status,
    ).toBe(200);
    const abandoned = acquireAgentRun("abandoned");
    expect(abandoned).toBeTruthy();
    run("UPDATE agent_runs SET lease_until=0 WHERE id=?", p.id);
    await work();
    expect(projectCount()).toBe(before + 1);
    await processAgentRun(
      abandoned!,
      "abandoned",
      new AbortController().signal,
    );
    expect(projectCount()).toBe(before + 1);
  });
  it("rejects immutable input replacement and another member's confirmation", async () => {
    const p = await proposal();
    run(
      "INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,'owner')",
      alice.workspace,
      bob.id,
    );
    expect(
      (
        await call(
          { ...bob, workspace: alice.workspace },
          `agent/actions/${p.action.id}/confirm`,
          "POST",
          {},
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {
          input: { name: "replacement" },
        })
      ).status,
    ).toBe(400);
    await call(alice, `agent/actions/${p.action.id}/reject`, "POST", {});
  });
  it("marks changed resource revisions stale and rejection writes nothing", async () => {
    const pid = (await call(alice, "projects", "POST", { name: "Before" })).data
      .id;
    const p = await proposal("update_project", {
      project_id: pid,
      name: "Agent",
    });
    await call(alice, `projects/${pid}`, "PATCH", { name: "Manual" });
    expect(
      (await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {}))
        .status,
    ).toBe(409);
    expect(
      (await call(alice, `agent/runs/${p.id}`)).data.actions[0].status,
    ).toBe("stale");
    const before = projectCount(),
      rejected = await proposal();
    await call(alice, `agent/actions/${rejected.action.id}/reject`, "POST", {});
    expect(projectCount()).toBe(before);
  });
  it("allows viewer investigation through dispatch but forbids write proposals", async () => {
    run(
      "UPDATE memberships SET role='viewer' WHERE workspace_id=? AND user_id=?",
      alice.workspace,
      bob.id,
    );
    const viewer = { ...bob, workspace: alice.workspace };
    const id = await start(viewer);
    await work({ kind: "answer", content: "Read-only answer" });
    expect((await call(viewer, `agent/runs/${id}`)).data.status).toBe(
      "completed",
    );
    const denied = await start(viewer);
    await work({ kind: "tool", tool: "create_project", input: { name: "No" } });
    expect((await call(viewer, `agent/runs/${denied}`)).data.status).toBe(
      "failed",
    );
  });
  it("unknown tools and malformed JSON execute nothing", async () => {
    const before = projectCount();
    for (const output of [
      '{"kind":"tool","tool":"shell","input":{}}',
      "not json",
    ]) {
      const id = await start();
      await work(output);
      expect((await call(alice, `agent/runs/${id}`)).data.status).toBe(
        "failed",
      );
    }
    expect(projectCount()).toBe(before);
  });
  it("removed membership prevents model use", async () => {
    const id = await start({ ...bob, workspace: alice.workspace });
    const calls = generated.calls;
    run(
      "DELETE FROM memberships WHERE workspace_id=? AND user_id=?",
      alice.workspace,
      bob.id,
    );
    await work();
    expect(generated.calls).toBe(calls);
    expect(
      one<{ status: string }>("SELECT status FROM agent_runs WHERE id=?", id)!
        .status,
    ).toBe("failed");
  });
  it("stopping during generation prevents publication", async () => {
    const id = await start();
    const acquired = acquireAgentRun("stopper")!;
    generated.pause = async () => {
      await call(alice, `agent/runs/${id}/cancel`, "POST", {});
    };
    await processAgentRun(acquired, "stopper", new AbortController().signal);
    generated.pause = undefined;
    const detail = (await call(alice, `agent/runs/${id}`)).data;
    expect(detail.status).toBe("cancelled");
    expect(detail.results).toHaveLength(0);
  });
});

it("queues one confirmed interpretation and cancels it without publishing", async () => {
  const did = "job-source";
  run(
    "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,'Fixture','txt',1,'ready',1,1)",
    did,
    alice.workspace,
  );
  run(
    "INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES('job-chunk',?,?,0,'Fixture fact','{}')",
    did,
    alice.workspace,
  );
  const p = await proposal("interpret_documents", {
    document_id: did,
    kind: "summary",
  });
  expect(one("SELECT id FROM jobs WHERE document_id=?", did)).toBeUndefined();
  await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
  await work();
  const job = one<{ id: string }>(
    "SELECT id FROM jobs WHERE document_id=?",
    did,
  )!;
  await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
  expect(
    one<{ n: number }>("SELECT count(*) n FROM jobs WHERE document_id=?", did)!
      .n,
  ).toBe(1);
  run(
    "UPDATE jobs SET status='running',worker_id='job-worker',attempts=1,lease_until=? WHERE id=?",
    Date.now() + 30000,
    job.id,
  );
  generated.pause = async () => {
    await call(alice, `agent/runs/${p.id}/cancel`, "POST", {});
  };
  await expect(
    processAgentInterpretation(
      job.id,
      "job-worker",
      1,
      new AbortController().signal,
    ),
  ).rejects.toBeDefined();
  generated.pause = undefined;
  expect(
    one("SELECT id FROM insights WHERE document_id=?", did),
  ).toBeUndefined();
  expect(
    one<{ status: string }>("SELECT status FROM jobs WHERE id=?", job.id)!
      .status,
  ).toBe("cancelled");
});
it("atomically publishes an interpretation and its job completion only once", async () => {
  const p = await proposal("interpret_documents", {
    document_id: "job-source",
    kind: "summary",
  });
  await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
  await work();
  const job = one<{ id: string }>(
    "SELECT id FROM jobs WHERE document_id='job-source' AND status='queued'",
  )!;
  run(
    "UPDATE jobs SET status='running',worker_id='job-worker',attempts=1,lease_until=? WHERE id=?",
    Date.now() + 30000,
    job.id,
  );
  generated.outputs.push("Fixture fact [1].");
  await processAgentInterpretation(
    job.id,
    "job-worker",
    1,
    new AbortController().signal,
  );
  await expect(
    processAgentInterpretation(
      job.id,
      "job-worker",
      1,
      new AbortController().signal,
    ),
  ).rejects.toBeDefined();
  expect(
    one<{ n: number }>(
      "SELECT count(*) n FROM insights WHERE document_id='job-source'",
    )!.n,
  ).toBe(1);
  expect(
    one<{ status: string }>("SELECT status FROM jobs WHERE id=?", job.id)!
      .status,
  ).toBe("complete");
});

it("fails a provider change before confirmed writes and sends no replacement model call", async () => {
  const before = projectCount(),
    p = await proposal();
  await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
  const calls = generated.calls;
  process.env.MLAI_LOCAL_MODEL_ID = "changed-model";
  await work();
  process.env.MLAI_LOCAL_MODEL_ID = "fixture-local";
  expect(projectCount()).toBe(before);
  expect(generated.calls).toBe(calls);
  expect((await call(alice, `agent/runs/${p.id}`)).data.status).toBe("failed");
});
it("fails revoked hosted consent without executing a confirmed action", async () => {
  writeFileSync(
    join(dir, "connections.json"),
    JSON.stringify([
      {
        id: "hosted",
        kind: "hosted",
        name: "Fixture",
        url: "https://fixture.example.test/v1",
        model: "hosted-fixture",
      },
    ]),
  );
  run(
    "UPDATE workspaces SET provider_id='hosted',hosted_consent=1 WHERE id=?",
    alice.workspace,
  );
  const p = await proposal();
  await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
  run("UPDATE workspaces SET hosted_consent=0 WHERE id=?", alice.workspace);
  const calls = generated.calls,
    before = projectCount();
  await work();
  expect(projectCount()).toBe(before);
  expect(generated.calls).toBe(calls);
  expect((await call(alice, `agent/runs/${p.id}`)).data.status).toBe("failed");
  rmSync(join(dir, "connections.json"));
  run("UPDATE workspaces SET provider_id=NULL WHERE id=?", alice.workspace);
});
it("checks stale resources again after confirmation", async () => {
  const pid = (await call(alice, "projects", "POST", { name: "Before worker" }))
    .data.id;
  const p = await proposal("update_project", {
    project_id: pid,
    name: "Agent value",
  });
  await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
  await call(alice, `projects/${pid}`, "PATCH", {
    name: "Changed before execution",
  });
  await work();
  expect(
    one<{ name: string }>("SELECT name FROM projects WHERE id=?", pid)!.name,
  ).toBe("Changed before execution");
  expect((await call(alice, `agent/runs/${p.id}`)).data.actions[0].status).toBe(
    "stale",
  );
});
it("read tools retain references only, validate citations, and remove historic source links", async () => {
  const id = await start(alice, "Find fixture facts", ["job-source"]);
  generated.outputs.push(
    JSON.stringify({
      kind: "answer",
      content: "Fixture fact [1], unsupported [999].",
    }),
  );
  // work prepends no output: preserve read -> answer ordering explicitly.
  generated.outputs.unshift(
    JSON.stringify({
      kind: "tool",
      tool: "search_documents",
      input: { query: "Fixture" },
    }),
  );
  await work();
  const detail = (await call(alice, `agent/runs/${id}`)).data;
  expect(detail.status).toBe("completed");
  expect(detail.results[0].citations).toHaveLength(1);
  expect(detail.results[0].content).toContain("[unsupported citation]");
  expect(JSON.stringify(detail.steps)).not.toContain("Fixture fact");
  await call(alice, "documents/job-source", "DELETE");
  const removed = (await call(alice, `agent/runs/${id}`)).data;
  expect(removed.results[0].citations[0].removed).toBe(true);
  expect(
    one("SELECT chunk_id FROM agent_sources WHERE run_id=?", id),
  ).toBeUndefined();
});
it("deleted selected sources invalidate pending actions and prevent confirmation", async () => {
  const did = "deleted-selection";
  run(
    "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,'Selected','txt',1,'ready',1,1)",
    did,
    alice.workspace,
  );
  const id = await start(alice, "Create a project", [did]);
  await work({
    kind: "tool",
    tool: "create_project",
    input: { name: "Never" },
  });
  const detail = (await call(alice, `agent/runs/${id}`)).data;
  const before = projectCount();
  await call(alice, `documents/${did}`, "DELETE");
  expect(
    (
      await call(
        alice,
        `agent/actions/${detail.actions[0].id}/confirm`,
        "POST",
        {},
      )
    ).status,
  ).toBe(409);
  expect((await call(alice, `agent/runs/${id}`)).data.actions[0].status).toBe(
    "stale",
  );
  expect(projectCount()).toBe(before);
});
it("enforces output, tool-step, and active-time budgets", async () => {
  let id = await start();
  await work("x".repeat(16001));
  expect((await call(alice, `agent/runs/${id}`)).data.status).toBe("failed");
  id = await start();
  for (let i = 0; i < 9; i++)
    generated.outputs.push(
      JSON.stringify({ kind: "tool", tool: "list_projects", input: {} }),
    );
  await work();
  generated.outputs.length = 0;
  const detail = (await call(alice, `agent/runs/${id}`)).data;
  expect(detail.status).toBe("failed");
  expect(detail.steps).toHaveLength(8);
  id = await start();
  run("UPDATE agent_runs SET active_ms=300000 WHERE id=?", id);
  const calls = generated.calls;
  await work();
  expect((await call(alice, `agent/runs/${id}`)).data.status).toBe("failed");
  expect(generated.calls).toBe(calls);
});
it("shutdown requeues unfinished generation and fences the old lease even for the same worker", async () => {
  const id = await start(),
    controller = new AbortController();
  const old = acquireAgentRun("same-worker")!;
  generated.pause = async () => controller.abort();
  await processAgentRun(old, "same-worker", controller.signal);
  generated.pause = undefined;
  expect((await call(alice, `agent/runs/${id}`)).data.status).toBe("queued");
  const fresh = acquireAgentRun("same-worker")!;
  const calls = generated.calls;
  await processAgentRun(old, "same-worker", new AbortController().signal);
  expect(generated.calls).toBe(calls);
  await processAgentRun(fresh, "same-worker", new AbortController().signal);
  expect((await call(alice, `agent/runs/${id}`)).data.results).toHaveLength(1);
});
it("rejects bearer authority on read, events, cancellation and proposal decisions", async () => {
  const p = await proposal();
  for (const [path, method] of [
    [`agent/runs/${p.id}`, "GET"],
    [`agent/runs/${p.id}/events`, "GET"],
    [`agent/runs/${p.id}/cancel`, "POST"],
    [`agent/actions/${p.action.id}/confirm`, "POST"],
  ])
    expect(
      (
        await call(
          alice,
          path,
          method,
          method === "POST" ? {} : undefined,
          "invalid",
        )
      ).status,
    ).toBe(403);
  await call(alice, `agent/actions/${p.action.id}/reject`, "POST", {});
});

it("replays durable SSE snapshots and stops the stream after membership revocation", async () => {
  const p = await proposal();
  run(
    "INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,'viewer')",
    alice.workspace,
    bob.id,
  );
  const req = new Request(
    `${process.env.APP_URL}/api/v1/agent/runs/${p.id}/events`,
    {
      headers: {
        Cookie: bob.cookie,
        "X-Workspace-ID": alice.workspace,
        "Last-Event-ID": "999999",
      },
    },
  );
  const response = await dispatch(req, ["agent", "runs", p.id, "events"]);
  expect(response.status).toBe(200);
  const reader = response.body!.getReader();
  const snapshot = new TextDecoder().decode((await reader.read()).value);
  expect(snapshot).toContain("event: snapshot");
  expect(snapshot).toContain('"status":"awaiting_approval"');
  expect(snapshot).toMatch(/id: \d+/);
  run(
    "DELETE FROM memberships WHERE workspace_id=? AND user_id=?",
    alice.workspace,
    bob.id,
  );
  expect((await reader.read()).done).toBe(true);
  await call(alice, `agent/actions/${p.action.id}/reject`, "POST", {});
});
it("requires session authority even with a valid API key and restores conversation summaries", async () => {
  const p = await proposal();
  const key = (
    await call(alice, "api-keys", "POST", {
      name: "Fixture",
      scopes: ["read", "write"],
    })
  ).data.secret;
  expect(
    (await call(alice, `agent/runs/${p.id}`, "GET", undefined, key)).status,
  ).toBe(403);
  expect(
    (await call(alice, `conversations/${conversation}`, "GET", undefined, key))
      .data.agentRuns,
  ).toEqual([]);
  expect(
    (await call(alice, `conversations/${conversation}`)).data.agentRuns.some(
      (r: { id: string }) => r.id === p.id,
    ),
  ).toBe(true);
  expect((await call(bob, `agent/runs/${p.id}`)).status).toBe(404);
  await call(alice, `agent/actions/${p.action.id}/reject`, "POST", {});
});
it("deleting an implicitly listed document invalidates the pending investigation", async () => {
  const did = "implicit-source";
  run(
    "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,'Implicit fixture','txt',1,'ready',1,1)",
    did,
    alice.workspace,
  );
  const id = await start();
  generated.outputs.push(
    JSON.stringify({ kind: "tool", tool: "list_documents", input: {} }),
    JSON.stringify({
      kind: "tool",
      tool: "create_project",
      input: { name: "From implicit source" },
    }),
  );
  await work();
  const detail = (await call(alice, `agent/runs/${id}`)).data;
  expect(detail.status).toBe("awaiting_approval");
  await call(alice, `documents/${did}`, "DELETE");
  const after = (await call(alice, `agent/runs/${id}`)).data;
  expect(after.status).toBe("failed");
  expect(after.actions[0].status).toBe("stale");
  expect(
    after.steps.flatMap((s: { resource_ids: string[] }) => s.resource_ids),
  ).not.toContain(did);
});
it("conversation deletion cancels its queued agent-owned interpretation jobs", async () => {
  const did = "conversation-source",
    savedConversation = conversation;
  run(
    "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,'Conversation fixture','txt',1,'ready',1,1)",
    did,
    alice.workspace,
  );
  run(
    "INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES('conversation-chunk',?,?,0,'Fixture','{}')",
    did,
    alice.workspace,
  );
  conversation = (
    await call(alice, "conversations", "POST", { title: "Disposable" })
  ).data.id;
  try {
    const p = await proposal("interpret_documents", {
      document_id: did,
      kind: "summary",
    });
    await call(alice, `agent/actions/${p.action.id}/confirm`, "POST", {});
    await work();
    const job = one<{ id: string }>(
      "SELECT id FROM jobs WHERE document_id=?",
      did,
    )!;
    expect(
      (await call(alice, `conversations/${conversation}`, "DELETE")).status,
    ).toBe(200);
    expect(
      one<{ status: string }>("SELECT status FROM jobs WHERE id=?", job.id)!
        .status,
    ).toBe("cancelled");
    expect(one("SELECT id FROM agent_runs WHERE id=?", p.id)).toBeUndefined();
  } finally {
    conversation = savedConversation;
  }
});
