import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStoredSession, readEpisode, readReceipt, readVector } from "@mlai/store";
import { renderWorkspace } from "../lib/workspace.ts";
import { probeSidecar } from "../lib/sidecars.ts";
import { buildCsp } from "../src/lib/csp.ts";
import { buildResearchExport } from "../lib/research-export.ts";
import { Providers } from "../app/providers.tsx";
import Page from "../app/page.tsx";
import QuasarHome from "../app/quasar/page.tsx";
import QuasarNew from "../app/quasar/new/page.tsx";
import QuasarSettingsPage from "../app/quasar/settings/page.tsx";
import QuasarSitePage from "../app/quasar/site/[id]/page.tsx";

const databaseUrl = process.env.DATABASE_URL ?? "postgres://donaldfilimon@127.0.0.1:5432/mlai";

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

  test("Quasar screens render their primary labels", () => {
    expect(renderToStaticMarkup(createElement(QuasarHome))).toContain("No sites yet");
    expect(renderToStaticMarkup(createElement(QuasarNew))).toContain("Name");
    expect(renderToStaticMarkup(createElement(QuasarNew))).toContain("Prompt");
    expect(renderToStaticMarkup(createElement(QuasarSettingsPage))).toContain("Server base URL");
    expect(renderToStaticMarkup(createElement(QuasarSitePage))).toContain("Feed");
    expect(renderToStaticMarkup(createElement(QuasarSitePage))).toContain("Preview");
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
