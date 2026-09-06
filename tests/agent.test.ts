import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const generated = vi.hoisted(() => ({ outputs: [] as string[], calls: 0, pause: undefined as (() => Promise<void>) | undefined }));
vi.mock("../src/lib/server/models", async (original) => ({
  ...await original<typeof import("../src/lib/server/models")>(),
  generate: async function* () {
    generated.calls++;
    if (generated.pause) await generated.pause();
    yield { text: generated.outputs.shift() || '{"kind":"answer","content":"Done."}' };
  },
}));
const dir = mkdtempSync(join(tmpdir(), "mlai-agent-"));
process.env.MLAI_DATA_DIR = dir;
process.env.APP_URL = "http://127.0.0.1:3100";
process.env.MLAI_LOCAL_MODEL_ID = "fixture-local";
const { auth } = await import("../src/lib/server/auth");
const { dispatch } = await import("../src/lib/server/api");
const { sqlite, one, run } = await import("../src/lib/server/db");
const { acquireAgentRun, processAgentRun } = await import("../src/lib/server/agent-runtime");
type Account = { cookie: string; id: string; workspace: string };
async function register(email: string): Promise<Account> {
  const r = await auth.handler(new Request(`${process.env.APP_URL}/api/auth/sign-up/email`, { method: "POST", headers: { "Content-Type": "application/json", Origin: process.env.APP_URL! }, body: JSON.stringify({ email, password: "Local-only-password!42", name: email.split("@")[0] }) }));
  const data = await r.json();
  expect(r.status).toBe(200);
  return { cookie: r.headers.getSetCookie().map(c => c.split(";")[0]).join("; "), id: data.user.id, workspace: one<{workspace_id:string}>("SELECT workspace_id FROM memberships WHERE user_id=?", data.user.id)!.workspace_id };
}
async function call(account: Account, path: string, method = "GET", data?: unknown, token?: string) {
  const response = await dispatch(new Request(`${process.env.APP_URL}/api/v1/${path}`, { method, headers: { Origin: process.env.APP_URL!, Cookie: account.cookie, "X-Workspace-ID": account.workspace, ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: data === undefined ? undefined : JSON.stringify(data) }), path.split("?")[0].split("/"));
  return { status: response.status, data: await response.json() };
}
let alice: Account, bob: Account, conversation: string;
beforeAll(async () => {
  alice = await register("agent-alice@example.test"); bob = await register("agent-bob@example.test");
  conversation = (await call(alice, "conversations", "POST", { title: "Agent tests" })).data.id;
});
afterAll(() => { sqlite.close(); rmSync(dir, {recursive:true,force:true}); });
async function start(account = alice, objective = "Investigate", document_ids?: string[]) {
  const r = await call(account, "agent/runs", "POST", { conversation_id: conversation, objective, ...(document_ids ? {document_ids} : {}) });
  expect(r.status, JSON.stringify(r.data)).toBe(201); return r.data.id as string;
}
async function work(output?: unknown, worker = "fixture") {
  if (output) generated.outputs.push(typeof output === "string" ? output : JSON.stringify(output));
  const acquired = acquireAgentRun(worker); expect(acquired).toBeTruthy();
  await processAgentRun(acquired!, worker, new AbortController().signal);
}
async function proposal(tool = "create_project", input: unknown = { name: "Proposed" }) {
  const id = await start(); await work({kind:"tool",tool,input});
  const detail = (await call(alice, `agent/runs/${id}`)).data;
  expect(detail.status).toBe("awaiting_approval"); return {id, action: detail.actions[0]};
}
const projectCount = () => one<{n:number}>("SELECT count(*) n FROM projects WHERE workspace_id=?", alice.workspace)!.n;
describe("durable session-only agent", () => {
  it("rejects foreign conversations and all bearer authority", async () => {
    expect((await call(bob,"agent/runs","POST",{conversation_id:conversation,objective:"no"})).status).toBe(404);
    expect((await call(alice,"agent/runs","POST",{conversation_id:conversation,objective:"no"},"invalid")).status).toBe(403);
  });
  it("proposes without writes; duplicate confirmation and expired lease replay write once", async () => {
    const before = projectCount(), p = await proposal(); expect(projectCount()).toBe(before);
    expect((await call(alice,`agent/actions/${p.action.id}/confirm`,"POST",{})).status).toBe(200);
    expect((await call(alice,`agent/actions/${p.action.id}/confirm`,"POST",{})).status).toBe(200);
    const abandoned = acquireAgentRun("abandoned"); expect(abandoned).toBeTruthy();
    run("UPDATE agent_runs SET lease_until=0 WHERE id=?", p.id);
    await work(); expect(projectCount()).toBe(before+1);
    await processAgentRun(abandoned!,"abandoned",new AbortController().signal);
    expect(projectCount()).toBe(before+1);
  });
  it("rejects immutable input replacement and another member's confirmation", async () => {
    const p=await proposal();
    run("INSERT INTO memberships(workspace_id,user_id,role) VALUES(?,?,'owner')",alice.workspace,bob.id);
    expect((await call({...bob,workspace:alice.workspace},`agent/actions/${p.action.id}/confirm`,"POST",{})).status).toBe(403);
    expect((await call(alice,`agent/actions/${p.action.id}/confirm`,"POST",{input:{name:"replacement"}})).status).toBe(400);
    await call(alice,`agent/actions/${p.action.id}/reject`,"POST",{});
  });
  it("marks changed resource revisions stale and rejection writes nothing", async () => {
    const pid=(await call(alice,"projects","POST",{name:"Before"})).data.id;
    const p=await proposal("update_project",{project_id:pid,name:"Agent"});
    await call(alice,`projects/${pid}`,"PATCH",{name:"Manual"});
    expect((await call(alice,`agent/actions/${p.action.id}/confirm`,"POST",{})).status).toBe(409);
    expect((await call(alice,`agent/runs/${p.id}`)).data.actions[0].status).toBe("stale");
    const before=projectCount(), rejected=await proposal();
    await call(alice,`agent/actions/${rejected.action.id}/reject`,"POST",{}); expect(projectCount()).toBe(before);
  });
  it("allows viewer investigation through dispatch but forbids write proposals", async () => {
    run("UPDATE memberships SET role='viewer' WHERE workspace_id=? AND user_id=?",alice.workspace,bob.id);
    const viewer={...bob,workspace:alice.workspace}; const id=await start(viewer);
    await work({kind:"answer",content:"Read-only answer"});
    expect((await call(viewer,`agent/runs/${id}`)).data.status).toBe("completed");
    const denied=await start(viewer); await work({kind:"tool",tool:"create_project",input:{name:"No"}});
    expect((await call(viewer,`agent/runs/${denied}`)).data.status).toBe("failed");
  });
  it("unknown tools and malformed JSON execute nothing", async () => {
    const before=projectCount();
    for(const output of ['{"kind":"tool","tool":"shell","input":{}}','not json']) {
      const id=await start(); await work(output); expect((await call(alice,`agent/runs/${id}`)).data.status).toBe("failed");
    }
    expect(projectCount()).toBe(before);
  });
  it("removed membership prevents model use", async () => {
    const id=await start({...bob,workspace:alice.workspace}); const calls=generated.calls;
    run("DELETE FROM memberships WHERE workspace_id=? AND user_id=?",alice.workspace,bob.id);
    await work(); expect(generated.calls).toBe(calls);
    expect(one<{status:string}>("SELECT status FROM agent_runs WHERE id=?",id)!.status).toBe("failed");
  });
  it("stopping during generation prevents publication", async () => {
    const id=await start(); const acquired=acquireAgentRun("stopper")!;
    generated.pause=async()=>{ await call(alice,`agent/runs/${id}/cancel`,"POST",{}); };
    await processAgentRun(acquired,"stopper",new AbortController().signal); generated.pause=undefined;
    const detail=(await call(alice,`agent/runs/${id}`)).data; expect(detail.status).toBe("cancelled"); expect(detail.results).toHaveLength(0);
  });
});
