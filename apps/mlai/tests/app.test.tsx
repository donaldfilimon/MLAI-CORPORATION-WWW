import { execFileSync } from "node:child_process";
import { createServer, type IncomingMessage } from "node:http";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { Window } from "happy-dom";
import { DEFAULT_ORIGIN } from "@quasar/shared";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStoredSession, readEpisode, readReceipt, readVector, sharedAuth, sharedPoolsCreated } from "@mlai/store";
import { renderWorkspace } from "../lib/workspace.ts";
import { probeSidecar } from "../lib/sidecars.ts";
import { buildCsp } from "../src/lib/csp.ts";
import { buildResearchExport } from "../lib/research-export.ts";
import { Providers } from "../app/providers.tsx";
import { GET } from "../app/app/[[...slug]]/route.ts";
import Page from "../app/page.tsx";
import SettingsPage from "../app/quasar/settings/page.tsx";
import { QuasarSettings } from "../lib/quasar-screens.tsx";
import {
  beginColdLoad,
  createSite,
  editSite,
  getBaseUrl,
  getEvents,
  listSites,
  previewStart,
  previewStop,
  setBaseUrl,
  storedOrigin,
} from "../lib/quasar-api.ts";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://donaldfilimon@127.0.0.1:5432/mlai";

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function childCount() {
  try {
    const out = execFileSync("pgrep", ["-P", String(process.pid)], { encoding: "utf8" }).trim();
    return out ? out.split("\n").length : 0;
  } catch {
    return 0;
  }
}

describe("apps/mlai shipped behavior", () => {
  test("creates a Better Auth session through @mlai/store and reads it back", async () => {
    const email = `member-${Date.now()}@mlai.local`;
    const { token, session, pool } = await createStoredSession(databaseUrl, email, "correct-horse-battery");
    expect(token.length).toBeGreaterThan(10);
    expect(session.user.email).toBe(email);
    await pool.end();
  });

  test("refuses an unsigned workspace route and renders it when the session is present", async () => {
    const email = `workspace-${Date.now()}@mlai.local`;
    const { auth, token, pool } = await createStoredSession(databaseUrl, email, "correct-horse-battery");
    const refused = await renderWorkspace(auth, null);
    expect(refused.status).toBe(401);
    expect(refused.body).toBe("Sign in required.");
    expect(refused.body).not.toContain("Workspace");
    const allowed = await renderWorkspace(auth, token);
    expect(allowed.status).toBe(200);
    expect(allowed.body).toContain("Workspace");
    expect(allowed.body).toContain(email);
    process.env.DATABASE_URL = databaseUrl;
    const beforePools = sharedPoolsCreated();
    const unsigned = new Request("http://127.0.0.1/app/workspace");
    const first = await GET(unsigned);
    const second = await GET(unsigned);
    expect(first.status).toBe(401);
    expect(await first.text()).toBe("Sign in required.");
    expect(second.status).toBe(401);
    expect(sharedPoolsCreated() - beforePools).toBe(1);
    const held = sharedAuth(databaseUrl);
    expect(sharedAuth(databaseUrl).pool).toBe(held.pool);
    expect(held.pool.ended).toBe(false);
    const signed = await GET(
      new Request("http://127.0.0.1/app/workspace", {
        headers: { cookie: `better-auth.session_token=${token}` },
      }),
    );
    expect(signed.status).toBe(200);
    expect(await signed.text()).toContain(email);
    expect(sharedPoolsCreated() - beforePools).toBe(1);
    await pool.end();
  });

  test("episode access fails closed when the gateway is absent", async () => {
    const missing = await readEpisode(undefined, "episode-1");
    expect(missing).toEqual({ ok: false, reason: "gateway-absent" });
    const closed = await readEpisode("http://127.0.0.1:9", "episode-1");
    expect(closed.ok).toBe(false);
    if (!closed.ok) expect(closed.reason).toBe("gateway-absent");
    const receipt = await readReceipt(undefined, "receipt-1");
    const vector = await readVector("http://127.0.0.1:9", "vector-1");
    expect(receipt).toEqual({ ok: false, reason: "gateway-absent" });
    expect(vector.ok).toBe(false);
  });

  test("public markup names MLAI and rejects invented claims", () => {
    const markup = renderToStaticMarkup(createElement(Providers, null, createElement(Page)));
    expect(markup.length).toBeGreaterThan(0);
    expect(markup).toContain("MLAI");
    expect(markup).toContain("Private generation with an audit trail you control.");
    expect(markup).not.toContain("Authentication, the store, and workspace routes are not connected yet.");
    const lower = markup.toLowerCase();
    for (const phrase of [
      "testimonial",
      "partnership",
      "unhackable",
      "military-grade",
      "our customers",
      "customers include",
      "customer logo",
      "partner logo",
    ]) {
      expect(lower).not.toContain(phrase);
    }
    expect(lower).toContain("not benchmark claims");
  });

  test("sidecar health follows the URL and does not spawn a child process", async () => {
    const before = childCount();
    const down = await probeSidecar("http://127.0.0.1:9/health");
    expect(down).toBe("unavailable");
    const server = createServer((_req, res) => {
      res.writeHead(200);
      res.end("ok");
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("listener has no port");
    const up = await probeSidecar(`http://127.0.0.1:${address.port}/health`);
    server.close();
    expect(up).toBe("available");
    expect(childCount()).toBe(before);
  });

  test("Quasar screens list, create, configure, and drive feed preview and edit by URL", async () => {
    const seen: string[] = [];
    const sites: { id: string; name: string; slug: string; createdAt: string; status: "idle"; previewPort: null; promptHistory: { prompt: string; at: string }[] }[] = [];
    const server = createServer((req, res) => {
      void (async () => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      seen.push(`${req.method} ${url.pathname}${url.search}`);
      const send = (status: number, body?: unknown) => {
        res.writeHead(status, body === undefined ? undefined : { "content-type": "application/json" });
        res.end(body === undefined ? undefined : JSON.stringify(body));
      };
      if (req.method === "GET" && url.pathname === "/api/sites") return send(200, sites);
      if (req.method === "POST" && url.pathname === "/api/sites") {
        const body = JSON.parse(await readBody(req)) as { name: string; prompt: string };
        const site = {
          id: "site-1",
          name: body.name,
          slug: body.name.toLowerCase(),
          createdAt: new Date().toISOString(),
          status: "idle" as const,
          previewPort: null,
          promptHistory: [{ prompt: body.prompt, at: new Date().toISOString() }],
        };
        sites.push(site);
        return send(200, site);
      }
      if (req.method === "GET" && url.pathname === "/api/sites/site-1") return send(200, sites[0]);
      if (req.method === "POST" && url.pathname === "/api/sites/site-1/edit") {
        const body = JSON.parse(await readBody(req)) as { prompt: string };
        sites[0]?.promptHistory.push({ prompt: body.prompt, at: new Date().toISOString() });
        return send(200, sites[0]);
      }
      if (req.method === "GET" && url.pathname === "/api/sites/site-1/events") {
        return send(200, { events: [{ type: "text", text: "generated" }], next: 1 });
      }
      if (req.method === "GET" && url.pathname === "/api/sites/site-1/preview") {
        return send(200, { state: "stopped", port: null, url: null, logTail: [] });
      }
      if (req.method === "POST" && url.pathname === "/api/sites/site-1/preview/start") {
        return send(200, { state: "running", port: 4710, url: "http://127.0.0.1:4710", logTail: [] });
      }
      if (req.method === "POST" && url.pathname === "/api/sites/site-1/preview/stop") {
        return send(200, { state: "stopped", port: null, url: null, logTail: [] });
      }
      send(404, { error: "missing" });
      })().catch((err: unknown) => {
        res.writeHead(500);
        res.end(err instanceof Error ? err.message : String(err));
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("listener has no port");
    const before = childCount();
    try {
      await setBaseUrl(`http://127.0.0.1:${address.port}`);
      expect(await listSites()).toEqual([]);
      const created = await createSite({ name: "Harbor", prompt: "A quiet landing page" });
      expect(created.name).toBe("Harbor");
      expect(created.promptHistory[0]?.prompt).toBe("A quiet landing page");
      expect((await listSites()).map((site) => site.name)).toEqual(["Harbor"]);
      const feed = await getEvents(created.id, 0);
      expect(feed.events).toEqual([{ type: "text", text: "generated" }]);
      const started = await previewStart(created.id);
      expect(started.state).toBe("running");
      const edited = await editSite(created.id, "Add a colophon");
      expect(edited.promptHistory.map((entry) => entry.prompt)).toContain("Add a colophon");
      const stopped = await previewStop(created.id);
      expect(stopped.state).toBe("stopped");
      await expect(setBaseUrl("http://127.0.0.1:9").then(() => listSites())).rejects.toThrow();
      expect(seen.some((line) => line.startsWith("POST /api/sites"))).toBe(true);
      expect(seen.some((line) => line.includes("/preview/start"))).toBe(true);
      expect(childCount()).toBe(before);

      const remembered = `http://127.0.0.1:${address.port}`;
      await setBaseUrl(remembered);
      beginColdLoad();
      expect(getBaseUrl()).toBe(DEFAULT_ORIGIN);
      const firstPaint = renderToStaticMarkup(createElement(SettingsPage));
      expect(firstPaint).not.toContain(DEFAULT_ORIGIN);
      expect(firstPaint).not.toContain(remembered);
      expect(firstPaint).toContain("disabled");
      const previousDocument = globalThis.document;
      const previousWindow = globalThis.window;
      const previousHtml = globalThis.HTMLElement;
      const win = new Window();
      const previousAct = (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT;
      Object.assign(globalThis, {
        window: win,
        document: win.document,
        HTMLElement: win.HTMLElement,
        IS_REACT_ACT_ENVIRONMENT: true,
      });
      const host = win.document.createElement("div");
      win.document.body.appendChild(host);
      const root = createRoot(host);
      try {
        await act(async () => {
          root.render(createElement(QuasarSettings));
          await new Promise((resolve) => setTimeout(resolve, 30));
        });
        const input = host.querySelector("input");
        const save = [...host.querySelectorAll("button")].find((button) => button.textContent === "Save");
        expect(input?.value).toBe(remembered);
        expect(input?.value).not.toBe(DEFAULT_ORIGIN);
        expect(save?.hasAttribute("disabled")).toBe(false);
        await act(async () => {
          save?.click();
          await new Promise((resolve) => setTimeout(resolve, 30));
        });
        expect(host.textContent).toContain("Saved on this device.");
        expect(await storedOrigin()).toBe(remembered);
        expect(getBaseUrl()).toBe(remembered);
      } finally {
        await act(async () => {
          root.unmount();
        });
        Object.assign(globalThis, {
          window: previousWindow,
          document: previousDocument,
          HTMLElement: previousHtml,
          IS_REACT_ACT_ENVIRONMENT: previousAct,
        });
      }
    } finally {
      server.close();
    }
  });

  test("research export matches the manifest inventory and hashes", async () => {
    const source = new URL("../research/public", import.meta.url).pathname;
    const out = await mkdtemp(join(tmpdir(), "mlai-research-"));
    try {
      const result = await buildResearchExport(source, out);
      expect(result.files).toBeGreaterThan(0);
      expect(result.sourceRevision).toMatch(/^[a-f0-9]{40}$/);
    } finally {
      await rm(out, { recursive: true, force: true });
    }
  });

  test("production CSP is present and does not allow unsafe-eval", () => {
    const policy = buildCsp({ dev: false });
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("wasm-unsafe-eval");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(buildCsp({ dev: true })).toContain("'unsafe-eval'");
  });
});
