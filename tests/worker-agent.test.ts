import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, symlinkSync, existsSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import Database from "better-sqlite3";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import type { Context } from "../src/lib/server/http";

const dir = mkdtempSync(join(tmpdir(), "mlai-worker-agent-"));
process.env.MLAI_DATA_DIR = dir;
const { sqlite, run, one } = await import("../src/lib/server/db");
const { runInterpretation } = await import("../src/lib/server/documents");
const { retrieve } = await import("../src/lib/server/search");
const { embed } = await import("../src/lib/server/embeddings");
const provider = { id: "local", name: "Local", kind: "local", url: "http://127.0.0.1:8080/v1", model: "fixture" };
const ctx: Context = { userId: "actor", workspaceId: "workspace", name: "Actor", role: "owner", apiKey: false, staff: false };
run("INSERT INTO user(id,name,email,createdAt,updatedAt) VALUES('actor','Actor','worker@example.test',1,1)");
run("INSERT INTO workspaces(id,name,created_at,provider_id) VALUES('workspace','Test',1,'local')");
beforeEach(() => {
  vi.restoreAllMocks();
  run("DELETE FROM insights");
  run("DELETE FROM agent_runs");
  run("DELETE FROM documents");
  run("INSERT OR REPLACE INTO memberships(workspace_id,user_id,role) VALUES('workspace','actor','owner')");
  for (const did of ["source", "comparison"]){
    run("INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,'workspace',?,'txt',10,'ready',1,1)", did, did);
    run("INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES(?,?,'workspace',0,'A fixture fact.','{}')", `${did}-chunk`, did);
  }
  writeFileSync(join(dir, "connections.json"), JSON.stringify([provider]));
});
async function until(condition: () => boolean, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (!condition()) {
    if (Date.now() >= deadline) throw new Error("Fixture state did not settle.");
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
function extractionWorker(seconds: number) {
  const fixture = mkdtempSync(join(dir, "worker-runtime-"));
  mkdirSync(join(fixture, "worker/.venv/bin"), {recursive:true});
  symlinkSync(resolve("drizzle"), join(fixture, "drizzle"), "dir");
  writeFileSync(join(fixture, "worker/.venv/bin/python"), `#!${process.execPath}
const fs = require('node:fs');
if(process.argv[2] === 'worker/extract.py') {
  fs.writeFileSync(process.argv.at(-1), JSON.stringify({chunks:[{content:'fixture extracted',location:{}}],text:'fixture extracted',tables:[],outline:[],warnings:[],parser:'fixture',version:'1'}));
} else {
  process.stdin.resume();
  setTimeout(() => process.stdout.write(JSON.stringify({space:${JSON.stringify("sentence-transformers/all-MiniLM-L6-v2@1110a243fdf4706b3f48f1d95db1a4f5529b4d41:normalized:384:v1")},vectors:[[1]]})), 1800);
}
`, {mode:0o700});
  run("DELETE FROM chunks WHERE document_id='source'");
  run("UPDATE documents SET status='queued' WHERE id='source'");
  mkdirSync(join(dir, "documents/source"), {recursive:true});
  writeFileSync(join(dir, "documents/source/original.txt"), "fixture");
  run("INSERT INTO jobs(id,document_id,created_at) VALUES('extract-job','source',1)");
  const child = spawn(process.execPath, ["--import", import.meta.resolve("tsx"), resolve("scripts/worker.ts")], {cwd:fixture,env:{...process.env,MLAI_DATA_DIR:dir,WORKER_CONCURRENCY:"1",DOCUMENT_TIMEOUT_SECONDS:String(seconds)},stdio:["ignore","ignore","pipe"]});
  let diagnostic = "";
  child.stderr?.on("data", chunk => { diagnostic += String(chunk); });
  return {child, diagnostic:() => diagnostic, closed:new Promise<void>(resolve => child.on("close", () => resolve()))};
}
it("keeps the extraction deadline active through semantic indexing", async () => {
  const {child,closed} = extractionWorker(0.7);
  try {
    await until(() => one<{progress:string}>("SELECT progress FROM documents WHERE id='source'")?.progress === "Building local semantic index");
    await until(() => one<{status:string}>("SELECT status FROM jobs WHERE id='extract-job'")?.status === "failed", 1200);
    expect(one("SELECT id FROM chunks WHERE document_id='source'")).toBeUndefined();
    expect(existsSync(join(dir,"documents/source/result.json"))).toBe(false);
  } finally { child.kill("SIGTERM"); await closed; }
});
it("gracefully stops indexing and truthfully requeues the document", async () => {
  const {child,closed,diagnostic} = extractionWorker(30);
  try {
    await until(() => one<{progress:string}>("SELECT progress FROM documents WHERE id='source'")?.progress === "Building local semantic index");
    child.kill("SIGTERM");
    await closed;
    expect(one("SELECT status,worker_id,lease_until,error FROM jobs WHERE id='extract-job'")).toEqual({status:"queued",worker_id:null,lease_until:null,error:null});
    expect(one<{status:string}>("SELECT status FROM documents WHERE id='source'")?.status).toBe("queued");
    expect(one("SELECT id FROM chunks WHERE document_id='source'")).toBeUndefined();
  } catch(error) { throw new Error(`${String(error)}; state=${JSON.stringify(one("SELECT * FROM jobs WHERE id='extract-job'"))}; ${diagnostic()}`); }
  finally { child.kill("SIGTERM"); await closed; }
});
afterAll(() => {
  vi.restoreAllMocks();
  sqlite.close();
  rmSync(dir, { recursive: true, force: true });
});
function answerAfter(change: () => void) {
  vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
    change();
    return new Response('data: {"choices":[{"delta":{"content":"A fixture fact [1]."}}]}\n\ndata: [DONE]\n\n');
  });
}
it("prevents interpretation publication after actor membership is revoked", async () => {
  answerAfter(() => run("DELETE FROM memberships WHERE user_id='actor'"));
  await expect(runInterpretation(ctx, "source", {kind: "summary"}, new AbortController().signal)).rejects.toMatchObject({ code: "workspace_forbidden" });
  expect(one("SELECT id FROM insights")).toBeUndefined();
});
it("prevents interpretation publication when a comparison source is removed", async () => {
  answerAfter(() => run("DELETE FROM documents WHERE id='comparison'"));
  await expect(runInterpretation(ctx, "source", {kind: "comparison", compare_with:["comparison"]}, new AbortController().signal)).rejects.toMatchObject({ code: "not_found" });
  expect(one("SELECT id FROM insights")).toBeUndefined();
});
it("prevents interpretation publication after the provider configuration changes", async () => {
  answerAfter(() => writeFileSync(join(dir, "connections.json"), JSON.stringify([{...provider, model:"changed"}])));
  await expect(runInterpretation(ctx, "source", {kind: "summary"}, new AbortController().signal)).rejects.toMatchObject({ code: "provider_changed" });
  expect(one("SELECT id FROM insights")).toBeUndefined();
});
it("does not degrade cancellation into a successful keyword retrieval", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(retrieve("workspace", "fixture", undefined, undefined, 8, controller.signal)).rejects.toMatchObject({name:"AbortError"});
});
it("does not start embedding work when already cancelled", async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(embed(["fixture"], controller.signal)).rejects.toMatchObject({name:"AbortError"});
});
it("restores interrupted agents while preserving pending and approved actions", async () => {
  run("INSERT INTO conversations(id,workspace_id,title,created_at,updated_at) VALUES('restore-conversation','workspace','Restore',1,1)");
  run("INSERT INTO agent_runs(id,workspace_id,user_id,conversation_id,objective,document_ids,status,selection,provider,model,active_ms,active_since,lease_until,worker_id,lease_token,created_at,updated_at) VALUES('restore-run','workspace','actor','restore-conversation','Restore','[]','running','{}','Local','fixture',50,100,200,'old-worker','old-token',1,1)");
  for (const status of ['pending','approved'])
    run("INSERT INTO agent_actions(id,run_id,tool,input,target_id,affected,status,created_at) VALUES(?,'restore-run','create_project','{}',?,'[]',?,1)", status, status, status);
  const backup = join(dir, "agent-backup"), restored = join(dir, "agent-restored");
  mkdirSync(backup);
  await sqlite.backup(join(backup, "mlai.sqlite"));
  writeFileSync(join(backup, "auth-secret"), "isolated-restored-secret");
  const files = Object.fromEntries(["mlai.sqlite","auth-secret"].map(name => [name, createHash("sha256").update(readFileSync(join(backup,name))).digest("hex")]));
  writeFileSync(join(backup,"manifest.json"), JSON.stringify({version:1,files}));
  execFileSync(process.execPath, ["--import", "tsx", "scripts/restore.ts", backup, restored]);
  const copy = new Database(join(restored, "mlai.sqlite"));
  try {
    expect(copy.prepare("SELECT status,worker_id,lease_until,lease_token,active_since,active_ms FROM agent_runs WHERE id='restore-run'").get()).toEqual({status:"queued",worker_id:null,lease_until:null,lease_token:null,active_since:null,active_ms:150});
    expect(copy.prepare("SELECT id,status FROM agent_actions ORDER BY id").all()).toEqual([{id:"approved",status:"approved"},{id:"pending",status:"pending"}]);
  } finally { copy.close(); }
});
