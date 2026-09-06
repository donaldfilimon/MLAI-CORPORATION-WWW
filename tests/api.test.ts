import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
const dir = mkdtempSync(join(tmpdir(), "mlai-api-"));
process.env.MLAI_DATA_DIR = dir;
process.env.APP_URL = "http://127.0.0.1:3100";
const { auth } = await import("../src/lib/server/auth");
const { dispatch } = await import("../src/lib/server/api");
const { sqlite, one, run } = await import("../src/lib/server/db");
type Account = { cookie: string; id: string; workspace: string };
async function register(email: string): Promise<Account> {
  const response = await auth.handler(
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
  const data = await response.json();
  expect(response.status, JSON.stringify(data)).toBe(200);
  return {
    cookie: response.headers
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
  options: { workspace?: string; token?: string; raw?: boolean } = {},
) {
  const headers: Record<string, string> = {
    Origin: process.env.APP_URL!,
    Cookie: account.cookie,
    "X-Workspace-ID": options.workspace || account.workspace,
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (data !== undefined) headers["Content-Type"] = "application/json";
  const response = await dispatch(
    new Request(`${process.env.APP_URL}/api/v1/${path}`, {
      method,
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
    }),
    path.split("?")[0].split("/"),
  );
  return {
    status: response.status,
    data: options.raw ? await response.text() : await response.json(),
  };
}
let alice: Account,
  bob: Account,
  staff: Account,
  project: string,
  conversation: string;
beforeAll(async () => {
  alice = await register("alice@example.test");
  bob = await register("bob@example.test");
  staff = await register("staff@example.test");
});
afterAll(() => {
  sqlite.close();
  rmSync(dir, { recursive: true, force: true });
});
describe("local account and workspace boundaries", () => {
  it("creates unverified local accounts and persistent personal workspaces", async () => {
    const r = await call(alice, "bootstrap");
    expect(r.status).toBe(200);
    expect(r.data.workspace.id).toBe(alice.workspace);
    expect(
      one<{ emailVerified: number }>(
        "SELECT emailVerified FROM user WHERE id=?",
        alice.id,
      )!.emailVerified,
    ).toBe(0);
    expect(r.data.staff).toBe(false);
  });
  it("enforces session, CSRF and workspace membership", async () => {
    expect((await call({ ...alice, cookie: "" }, "projects")).status).toBe(401);
    expect(
      (
        await call(alice, "projects", "GET", undefined, {
          workspace: bob.workspace,
        })
      ).status,
    ).toBe(403);
    const r = await dispatch(
      new Request(`${process.env.APP_URL}/api/v1/projects`, {
        method: "POST",
        headers: { cookie: alice.cookie, origin: "https://untrusted.test" },
        body: '{"name":"bad"}',
      }),
      ["projects"],
    );
    expect(r.status).toBe(403);
  });
  it("creates projects and denies cross-workspace read/write associations", async () => {
    project = (
      await call(alice, "projects", "POST", { name: "Private project" })
    ).data.id;
    expect(project).toBeTruthy();
    expect((await call(bob, `projects/${project}`, "DELETE")).status).toBe(404);
    expect(
      (await call(bob, "conversations", "POST", { project_id: project }))
        .status,
    ).toBe(404);
    conversation = (
      await call(alice, "conversations", "POST", { project_id: project })
    ).data.id;
    expect((await call(bob, `conversations/${conversation}`)).status).toBe(404);
    expect(
      (
        await call(alice, `conversations/${conversation}`, "PATCH", {
          project_id: null,
        })
      ).status,
    ).toBe(200);
    expect(
      (await call(alice, `conversations/${conversation}`)).data.project_id,
    ).toBeNull();
    await call(alice, `conversations/${conversation}`, "PATCH", {
      project_id: project,
    });
  });
  it("enforces viewer read-only and revokes access when membership is removed", async () => {
    expect(
      (
        await call(alice, "workspaces/members", "POST", {
          email: "bob@example.test",
          role: "viewer",
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call(
          bob,
          "projects",
          "POST",
          { name: "forbidden" },
          { workspace: alice.workspace },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await call(bob, "projects", "GET", undefined, {
          workspace: alice.workspace,
        })
      ).status,
    ).toBe(200);
    await call(alice, `workspaces/members/${bob.id}`, "DELETE");
    expect(
      (
        await call(bob, "projects", "GET", undefined, {
          workspace: alice.workspace,
        })
      ).status,
    ).toBe(403);
  });
  it("stores API key hashes, checks scopes, binds to workspace, and revokes", async () => {
    const k = await call(alice, "api-keys", "POST", {
      name: "Read only",
      scopes: ["read"],
    });
    expect(k.status).toBe(201);
    const secret = k.data.secret;
    expect(
      one<{ hash: string }>("SELECT hash FROM api_keys WHERE id=?", k.data.id)!
        .hash,
    ).toBe(createHash("sha256").update(secret).digest("hex"));
    expect(
      (
        await call(
          alice,
          "projects",
          "POST",
          { name: "bad" },
          { token: secret },
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await call(bob, "projects", "GET", undefined, {
          token: secret,
          workspace: bob.workspace,
        })
      ).data[0].id,
    ).toBe(project);
    expect(
      (await call(alice, "api-keys", "GET", undefined, { token: secret }))
        .status,
    ).toBe(403);
    await call(alice, `api-keys/${k.data.id}`, "DELETE");
    expect(
      (await call(alice, "projects", "GET", undefined, { token: secret }))
        .status,
    ).toBe(401);
  });
  it("preserves citations without retaining deleted source excerpts", async () => {
    const doc = "source-doc",
      chunk = "source-chunk";
    run(
      "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,?,'txt',20,'ready',1,1)",
      doc,
      alice.workspace,
      "source.txt",
    );
    run(
      "INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES(?,?,?,0,?,?)",
      chunk,
      doc,
      alice.workspace,
      "Private zebra evidence",
      '{"page":2}',
    );
    run(
      "INSERT INTO messages(id,conversation_id,role,content,citations,created_at) VALUES('citation-message',?,'assistant','Zebra [1]',?,1)",
      conversation,
      JSON.stringify([
        {
          number: 1,
          id: chunk,
          documentId: doc,
          name: "source.txt",
          location: { page: 2 },
        },
      ]),
    );
    expect((await call(bob, `documents/${doc}/download`)).status).toBe(404);
    expect((await call(bob, "search?q=zebra")).data.results).toEqual([]);
    expect(
      (await call(alice, `conversations/${conversation}`)).data.messages[0]
        .citations[0].content,
    ).toContain("zebra");
    await call(alice, `documents/${doc}`, "DELETE");
    expect(
      one("SELECT id FROM chunks WHERE document_id=?", doc),
    ).toBeUndefined();
    expect(
      one("SELECT * FROM chunks_fts WHERE chunks_fts MATCH 'zebra'"),
    ).toBeUndefined();
    const c = (await call(alice, `conversations/${conversation}`)).data
      .messages[0].citations[0];
    expect(c.removed).toBe(true);
    expect(c.content).toBe("");
    expect(existsSync(join(dir, "documents", doc))).toBe(false);
  });
});
describe("customer-to-staff version review", () => {
  let engagement: string, deliverable: string;
  it("assigns staff only through operator data and keeps private projects inaccessible", async () => {
    expect((await call(alice, "staff/inquiries")).status).toBe(403);
    run("INSERT INTO staff(user_id) VALUES(?)", staff.id);
    expect(
      (
        await call(staff, "projects", "GET", undefined, {
          workspace: alice.workspace,
        })
      ).status,
    ).toBe(403);
    engagement = (
      await call(alice, "engagements", "POST", {
        title: "Architecture review",
        description: "Review our local integration.",
      })
    ).data.id;
    expect((await call(bob, `engagements/${engagement}`)).status).toBe(404);
    expect((await call(staff, `engagements/${engagement}`)).status).toBe(404);
    expect(
      (await call(staff, `engagements/${engagement}/claim`, "POST", {})).status,
    ).toBe(200);
    expect(
      (await call(staff, `engagements/${engagement}`)).data.canManage,
    ).toBe(true);
  });
  it("restricts milestones and staff status while saving customer onboarding and comments", async () => {
    expect(
      (
        await call(alice, `engagements/${engagement}`, "PATCH", {
          status: "completed",
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await call(alice, `engagements/${engagement}`, "PATCH", {
          onboarding: { goal: "Local deployment" },
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call(staff, `engagements/${engagement}/milestones`, "POST", {
          title: "Review",
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await call(alice, `engagements/${engagement}/comments`, "POST", {
          content: "Ready to review",
        })
      ).status,
    ).toBe(201);
    expect((await call(staff, "notifications")).data.length).toBeGreaterThan(0);
  });
  it("requires a new review on replacement and protects downloads", async () => {
    async function upload() {
      const r = await dispatch(
        new Request(
          `${process.env.APP_URL}/api/v1/engagements/${engagement}/deliverables`,
          {
            method: "POST",
            headers: {
              Origin: process.env.APP_URL!,
              Cookie: staff.cookie,
              "X-Workspace-ID": staff.workspace,
              "X-File-Name": "report.txt",
            },
            body: "Reviewed architecture",
          },
        ),
        ["engagements", engagement, "deliverables"],
      );
      expect(r.status).toBe(201);
      return (await r.json()).id;
    }
    deliverable = await upload();
    expect(
      (await call(bob, `engagements/${engagement}/deliverables/${deliverable}`))
        .status,
    ).toBe(404);
    expect(
      (
        await call(
          alice,
          `engagements/${engagement}/deliverables/${deliverable}`,
          "POST",
          { decision: "approved" },
        )
      ).status,
    ).toBe(200);
    const replacement = await upload();
    expect(
      (
        await call(
          alice,
          `engagements/${engagement}/deliverables/${deliverable}`,
          "POST",
          { decision: "approved" },
        )
      ).status,
    ).toBe(409);
    const details = (await call(alice, `engagements/${engagement}`)).data;
    expect(
      details.deliverables.find((d: { id: string }) => d.id === replacement)
        .decision,
    ).toBeNull();
    expect(details.reviews).toHaveLength(1);
    expect(
      (
        await call(
          alice,
          `engagements/${engagement}/deliverables/${replacement}`,
          "POST",
          { decision: "changes_requested", comment: "Add a diagram" },
        )
      ).status,
    ).toBe(200);
  });
});

it("backs up consistent records and restores into an independent installation", () => {
  const backup = join(dir, "snapshot"),
    restored = join(dir, "restored");
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/backup.ts", backup],
    { env: process.env },
  );
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/restore.ts", backup, restored],
    { env: process.env },
  );
  const copy = new Database(join(restored, "mlai.sqlite"));
  try {
    expect(
      copy.prepare("SELECT name FROM projects WHERE id=?").get(project),
    ).toEqual({ name: "Private project" });
    expect(copy.prepare("SELECT count(*) n FROM reviews").get()).toEqual({
      n: 2,
    });
    expect(copy.pragma("integrity_check", { simple: true })).toBe("ok");
  } finally {
    copy.close();
  }
  expect(() =>
    execFileSync(
      process.execPath,
      ["--import", "tsx", "scripts/restore.ts", backup, restored],
      { stdio: "pipe" },
    ),
  ).toThrow();
});
