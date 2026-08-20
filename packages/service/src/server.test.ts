import { test, expect, afterEach } from "bun:test";
import { mkdtemp, mkdir, writeFile, readFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { GenerationEvent } from "@quasar/shared";
import { createServer, type ServerDeps } from "./server";
import { PreviewManager } from "./preview";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type EngineFn = ServerDeps["engine"];

function stubEngine(events: GenerationEvent[], delayMs: number): EngineFn {
  return async ({ onEvent }) => {
    await sleep(delayMs);
    for (const ev of events) onEvent(ev);
  };
}

const previewCommand = (_siteDir: string, port: number): string[] => [
  "bun",
  "-e",
  `Bun.serve({ port: ${port}, fetch: () => new Response("ok") }); setInterval(() => {}, 1e9);`,
];

interface Harness {
  home: string;
  templateDir: string;
  baseUrl: string;
  server: ReturnType<typeof createServer>;
  preview: PreviewManager;
}

const harnesses: Harness[] = [];

async function makeHarness(engine: EngineFn, opts?: { templateDir?: string }): Promise<Harness> {
  const home = await realpath(await mkdtemp(path.join(tmpdir(), "quasar-home-")));
  let templateDir = opts?.templateDir;
  if (templateDir === undefined) {
    templateDir = await realpath(await mkdtemp(path.join(tmpdir(), "quasar-template-")));
    await writeFile(path.join(templateDir, "marker.txt"), "template-marker");
  }

  const preview = new PreviewManager({ command: previewCommand });
  const server = createServer({
    home,
    templateDir,
    engine,
    makeClient: () => ({} as never),
    preview,
    scaffoldInstall: false,
    port: 0,
  });

  const harness: Harness = { home, templateDir, baseUrl: `http://localhost:${server.port}`, server, preview };
  harnesses.push(harness);
  return harness;
}

afterEach(async () => {
  while (harnesses.length > 0) {
    const h = harnesses.pop()!;
    await h.preview.stopAll();
    h.server.stop(true);
  }
  // give any straggling background job timers a moment to settle before the
  // temp dirs they touch get reaped by the OS at process exit.
  await sleep(50);
});

async function pollUntilIdle(baseUrl: string, id: string, timeoutMs = 3000): Promise<any> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${baseUrl}/api/sites/${id}`);
    const body = await res.json();
    if (body.status !== "generating") return body;
    await sleep(20);
  }
  throw new Error("timed out waiting for idle status");
}

test("POST /api/sites scaffolds the site, runs the job to idle, and replays events", async () => {
  const { baseUrl, home } = await makeHarness(
    stubEngine([{ type: "text", text: "hi" }, { type: "done" }], 10)
  );

  const createRes = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "My Site", prompt: "p" }),
  });
  expect(createRes.status).toBe(202);
  const site = await createRes.json();
  expect(site.slug).toBe("my-site");
  expect(site.status).toBe("generating");

  const markerPath = path.join(home, "sites", "my-site", "marker.txt");
  const marker = await readFile(markerPath, "utf8");
  expect(marker).toBe("template-marker");

  const idleSite = await pollUntilIdle(baseUrl, site.id);
  expect(idleSite.status).toBe("idle");

  const eventsRes = await fetch(`${baseUrl}/api/sites/${site.id}/events?since=0`);
  expect(eventsRes.status).toBe(200);
  const eventsBody = await eventsRes.json();
  expect(eventsBody).toEqual({
    events: [{ type: "text", text: "hi" }, { type: "done" }],
    next: 2,
  });

  const emptyRes = await fetch(`${baseUrl}/api/sites/${site.id}/events?since=2`);
  const emptyBody = await emptyRes.json();
  expect(emptyBody).toEqual({ events: [], next: 2 });
});

test("an error event sets status 'error' and records lastError; a later success clears it", async () => {
  let events: GenerationEvent[] = [{ type: "error", message: "boom" }];
  const engine: EngineFn = async ({ onEvent }) => {
    await sleep(10);
    for (const ev of events) onEvent(ev);
  };
  const { baseUrl } = await makeHarness(engine);

  const createRes = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Boom Site", prompt: "p" }),
  });
  const site = await createRes.json();

  const failed = await pollUntilIdle(baseUrl, site.id);
  expect(failed.status).toBe("error");
  expect(failed.lastError).toBe("boom");

  events = [{ type: "done" }];
  const editRes = await fetch(`${baseUrl}/api/sites/${site.id}/edit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "retry" }),
  });
  expect(editRes.status).toBe(202);

  const recovered = await pollUntilIdle(baseUrl, site.id);
  expect(recovered.status).toBe("idle");
  expect(recovered.lastError).toBeUndefined();
});

test("POST edit while a job is running returns 409, and edit updates promptHistory", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 200));

  const createRes = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Slow Site", prompt: "p1" }),
  });
  const site = await createRes.json();
  await pollUntilIdle(baseUrl, site.id);

  const edit1 = await fetch(`${baseUrl}/api/sites/${site.id}/edit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "p2" }),
  });
  expect(edit1.status).toBe(202);
  const edited = await edit1.json();
  expect(edited.status).toBe("generating");
  expect(edited.promptHistory).toEqual([
    { prompt: "p1", at: edited.promptHistory[0].at },
    { prompt: "p2", at: edited.promptHistory[1].at },
  ]);

  const edit2 = await fetch(`${baseUrl}/api/sites/${site.id}/edit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: "p3" }),
  });
  expect(edit2.status).toBe(409);
  const edit2Body = await edit2.json();
  expect(edit2Body).toEqual({ error: "job running" });

  await pollUntilIdle(baseUrl, site.id);
});

test("preview start reports running and preview stop reports stopped", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const createRes = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Preview Site", prompt: "p" }),
  });
  const site = await createRes.json();
  await pollUntilIdle(baseUrl, site.id);

  const startRes = await fetch(`${baseUrl}/api/sites/${site.id}/preview/start`, { method: "POST" });
  expect(startRes.status).toBe(200);
  const startBody = await startRes.json();
  expect(startBody.state).toBe("running");
  expect(typeof startBody.port).toBe("number");

  const stopRes = await fetch(`${baseUrl}/api/sites/${site.id}/preview/stop`, { method: "POST" });
  expect(stopRes.status).toBe(200);
  const stopBody = await stopRes.json();
  expect(stopBody.state).toBe("stopped");
}, 15000);

test("DELETE removes the site: 204, then GET is 404", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const createRes = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Delete Me", prompt: "p" }),
  });
  const site = await createRes.json();
  await pollUntilIdle(baseUrl, site.id);

  const deleteRes = await fetch(`${baseUrl}/api/sites/${site.id}`, { method: "DELETE" });
  expect(deleteRes.status).toBe(204);

  const getRes = await fetch(`${baseUrl}/api/sites/${site.id}`);
  expect(getRes.status).toBe(404);
  const getBody = await getRes.json();
  expect(getBody).toEqual({ error: "not found" });
});

test("POST /api/sites with an invalid body returns 400", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const res = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "", prompt: "" }),
  });
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.fieldErrors).toBeDefined();
});

test("GET on an unknown site id returns 404", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));
  const res = await fetch(`${baseUrl}/api/sites/does-not-exist`);
  expect(res.status).toBe(404);
  const body = await res.json();
  expect(body).toEqual({ error: "not found" });
});

test("OPTIONS returns 204 with CORS headers, and GET responses carry Access-Control-Allow-Origin", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const optionsRes = await fetch(`${baseUrl}/api/sites`, { method: "OPTIONS" });
  expect(optionsRes.status).toBe(204);
  expect(optionsRes.headers.get("Access-Control-Allow-Origin")).toBe("*");
  expect(optionsRes.headers.get("Access-Control-Allow-Methods")).toBe("GET,POST,DELETE,OPTIONS");
  expect(optionsRes.headers.get("Access-Control-Allow-Headers")).toBe("content-type");

  const getRes = await fetch(`${baseUrl}/api/sites`);
  expect(getRes.headers.get("Access-Control-Allow-Origin")).toBe("*");

  const notFoundRes = await fetch(`${baseUrl}/api/sites/nope`);
  expect(notFoundRes.headers.get("Access-Control-Allow-Origin")).toBe("*");
});

test("GET /api/sites lists all sites in the registry", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const listBefore = await (await fetch(`${baseUrl}/api/sites`)).json();
  expect(listBefore).toEqual([]);

  const createRes = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Listed Site", prompt: "p" }),
  });
  const site = await createRes.json();

  const listAfter = await (await fetch(`${baseUrl}/api/sites`)).json();
  expect(listAfter).toHaveLength(1);
  expect(listAfter[0].id).toBe(site.id);

  await pollUntilIdle(baseUrl, site.id);
});

test("slug collisions append -2, -3, ...", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const post = () =>
    fetch(`${baseUrl}/api/sites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Same Name", prompt: "p" }),
    });

  const first = await (await post()).json();
  const second = await (await post()).json();
  const third = await (await post()).json();

  expect(first.slug).toBe("same-name");
  expect(second.slug).toBe("same-name-2");
  expect(third.slug).toBe("same-name-3");

  await Promise.all([
    pollUntilIdle(baseUrl, first.id),
    pollUntilIdle(baseUrl, second.id),
    pollUntilIdle(baseUrl, third.id),
  ]);
});

test("POST /api/sites when scaffolding fails returns 500 and leaves no orphaned registry entry or site dir", async () => {
  const missingTemplateDir = path.join(tmpdir(), `quasar-template-missing-${Date.now()}`);
  const { baseUrl, home } = await makeHarness(stubEngine([{ type: "done" }], 5), {
    templateDir: missingTemplateDir,
  });

  const res = await fetch(`${baseUrl}/api/sites`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Broken Site", prompt: "p" }),
  });
  expect(res.status).toBe(500);
  const body = await res.json();
  expect(typeof body.error).toBe("string");
  expect(body.error.length).toBeGreaterThan(0);

  const list = await (await fetch(`${baseUrl}/api/sites`)).json();
  expect(list).toEqual([]);

  await expect(
    readFile(path.join(home, "sites", "broken-site", "marker.txt"), "utf8")
  ).rejects.toThrow();
});

test("concurrent creates with the same name do not lose any site to a stale registry write", async () => {
  const { baseUrl } = await makeHarness(stubEngine([{ type: "done" }], 5));

  const post = () =>
    fetch(`${baseUrl}/api/sites`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Same Name", prompt: "p" }),
    });

  const [r1, r2, r3] = await Promise.all([post(), post(), post()]);
  const [s1, s2, s3] = await Promise.all([r1.json(), r2.json(), r3.json()]);

  const ids = new Set([s1.id, s2.id, s3.id]);
  expect(ids.size).toBe(3);

  const slugs = new Set([s1.slug, s2.slug, s3.slug]);
  expect(slugs.size).toBe(3);

  await Promise.all([
    pollUntilIdle(baseUrl, s1.id),
    pollUntilIdle(baseUrl, s2.id),
    pollUntilIdle(baseUrl, s3.id),
  ]);

  const list = await (await fetch(`${baseUrl}/api/sites`)).json();
  expect(list).toHaveLength(3);
  const listIds = new Set(list.map((s: { id: string }) => s.id));
  expect(listIds).toEqual(ids);
});
