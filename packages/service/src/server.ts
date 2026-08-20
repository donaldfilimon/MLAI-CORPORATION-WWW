import path from "node:path";
import crypto from "node:crypto";
import { rm } from "node:fs/promises";
import { CreateSiteBody, EditSiteBody, slugify, type Site, type GenerationEvent } from "@quasar/shared";
import { readRegistry, writeRegistry } from "./registry";
import { allocatePort } from "./ports";
import { EventBus } from "./events";
import { scaffoldSite } from "./scaffold";
import { runGeneration, type EngineClient } from "./engine";
import { PreviewManager } from "./preview";

export interface ServerDeps {
  home: string; // QUASAR_HOME
  templateDir: string;
  engine: typeof runGeneration; // injectable for tests
  makeClient: () => EngineClient; // default: () => new Anthropic() as unknown as EngineClient
  preview: PreviewManager;
  scaffoldInstall: boolean; // false in tests
  port: number;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
};

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

function noContent(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function notFound(): Response {
  return json({ error: "not found" }, { status: 404 });
}

async function readJsonBody(req: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  try {
    return { ok: true, body: await req.json() };
  } catch {
    return { ok: false, response: json({ error: "invalid json" }, { status: 400 }) };
  }
}

// Serializes every read-modify-write against the registry file within this
// process. `readRegistry`/`writeRegistry` alone aren't safe under concurrent
// callers: two overlapping HTTP requests (or a request racing a background
// job's completion write) can each read the same snapshot and one write
// silently clobbers the other's update. A plain "re-read right before write"
// narrows that window but doesn't close it. This mutex closes it: every
// mutation below runs to completion before the next one starts.
function makeMutex(): <T>(fn: () => Promise<T>) => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve();
  return function withLock<T>(fn: () => Promise<T>): Promise<T> {
    const result = tail.then(fn, fn);
    tail = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  };
}

export function createServer(deps: ServerDeps): ReturnType<typeof Bun.serve> {
  const registryFile = path.join(deps.home, "registry.json");
  const sitesDir = path.join(deps.home, "sites");
  const eventBus = new EventBus();
  const withRegistryLock = makeMutex();

  function siteDirFor(slug: string): string {
    return path.join(sitesDir, slug);
  }

  function uniqueSlug(base: string, sites: Site[]): string {
    const existing = new Set(sites.map((s) => s.slug));
    if (!existing.has(base)) return base;
    let n = 2;
    while (existing.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
  }

  async function finalizeJob(siteId: string, ev: GenerationEvent): Promise<void> {
    if (ev.type !== "done" && ev.type !== "error") return;
    await withRegistryLock(async () => {
      const sites = await readRegistry(registryFile);
      const idx = sites.findIndex((s) => s.id === siteId);
      if (idx === -1) return;
      if (ev.type === "done") {
        // Drop any stale lastError from a prior failed run — a fresh
        // success shouldn't leave the old failure message hanging around.
        const { lastError: _lastError, ...rest } = sites[idx];
        sites[idx] = { ...rest, status: "idle" };
      } else {
        sites[idx] = { ...sites[idx], status: "error", lastError: ev.message };
      }
      await writeRegistry(registryFile, sites);
    });
  }

  function startJob(site: Site, prompt: string): void {
    const siteDir = siteDirFor(site.slug);
    eventBus.reset(site.id);
    const bus = eventBus.get(site.id);
    let terminal = false;
    const onEvent = (ev: GenerationEvent): void => {
      bus.emit(ev);
      if (ev.type === "done" || ev.type === "error") {
        terminal = true;
        void finalizeJob(site.id, ev);
      }
    };

    // A job must always reach a terminal registry state ("idle" or "error"),
    // even if it never gets the chance to emit its own terminal event:
    // `deps.makeClient()` can throw synchronously (e.g. no resolvable
    // credentials), and `deps.engine(...)`'s returned promise can reject
    // instead of routing failure through `onEvent`. Either case, unhandled,
    // leaves the site permanently wedged in "generating" (every future edit
    // then 409s forever) and produces an unhandled rejection. Route both
    // through the same onEvent("error") path used for engine-reported
    // errors, guarded by `terminal` so we never double-report if the engine
    // *did* already emit its own terminal event before rejecting.
    void (async () => {
      try {
        const client = deps.makeClient();
        await deps.engine({ client, siteDir, prompt, onEvent });
      } catch (err) {
        if (terminal) return;
        const message = err instanceof Error ? err.message : String(err);
        onEvent({ type: "error", message });
      }
    })();
  }

  async function listSites(): Promise<Response> {
    const sites = await readRegistry(registryFile);
    return json(sites);
  }

  async function createSite(req: Request): Promise<Response> {
    const parsedBody = await readJsonBody(req);
    if (!parsedBody.ok) return parsedBody.response;

    const parsed = CreateSiteBody.safeParse(parsedBody.body);
    if (!parsed.success) return json(parsed.error.flatten(), { status: 400 });
    const { name, prompt } = parsed.data;

    // Reserve the slug (and the registry row) under the lock *before*
    // scaffolding, which can take seconds with scaffoldInstall:true. This is
    // what makes concurrent creates with the same name get distinct slugs
    // (and distinct site dirs) instead of racing to compute the same
    // "free" slug off a stale read.
    const now = new Date().toISOString();
    const site: Site = await withRegistryLock(async () => {
      const sites = await readRegistry(registryFile);
      const slug = uniqueSlug(slugify(name), sites);
      const reserved: Site = {
        id: crypto.randomUUID(),
        name,
        slug,
        createdAt: now,
        status: "generating",
        previewPort: null,
        promptHistory: [{ prompt, at: now }],
      };
      sites.push(reserved);
      await writeRegistry(registryFile, sites);
      return reserved;
    });

    const siteDir = siteDirFor(site.slug);
    try {
      await scaffoldSite(deps.templateDir, siteDir, { install: deps.scaffoldInstall });
    } catch (err) {
      await rm(siteDir, { recursive: true, force: true }).catch(() => {});
      await withRegistryLock(async () => {
        const sites = await readRegistry(registryFile);
        await writeRegistry(
          registryFile,
          sites.filter((s) => s.id !== site.id)
        );
      });
      const message = err instanceof Error ? err.message : String(err);
      return json({ error: message }, { status: 500 });
    }

    startJob(site, prompt);

    return json(site, { status: 202 });
  }

  async function getSite(id: string): Promise<Response> {
    const sites = await readRegistry(registryFile);
    const site = sites.find((s) => s.id === id);
    if (!site) return notFound();
    return json(site);
  }

  async function editSite(id: string, req: Request): Promise<Response> {
    const sites = await readRegistry(registryFile);
    const idx = sites.findIndex((s) => s.id === id);
    if (idx === -1) return notFound();

    const parsedBody = await readJsonBody(req);
    if (!parsedBody.ok) return parsedBody.response;

    const parsed = EditSiteBody.safeParse(parsedBody.body);
    if (!parsed.success) return json(parsed.error.flatten(), { status: 400 });
    const { prompt } = parsed.data;

    const result = await withRegistryLock(async (): Promise<
      { ok: true; site: Site } | { ok: false; response: Response }
    > => {
      const fresh = await readRegistry(registryFile);
      const idx = fresh.findIndex((s) => s.id === id);
      if (idx === -1) return { ok: false, response: notFound() };
      if (fresh[idx].status === "generating") {
        return { ok: false, response: json({ error: "job running" }, { status: 409 }) };
      }
      const now = new Date().toISOString();
      const updated: Site = {
        ...fresh[idx],
        status: "generating",
        promptHistory: [...fresh[idx].promptHistory, { prompt, at: now }],
      };
      fresh[idx] = updated;
      await writeRegistry(registryFile, fresh);
      return { ok: true, site: updated };
    });

    if (!result.ok) return result.response;

    startJob(result.site, prompt);

    return json(result.site, { status: 202 });
  }

  async function getEvents(id: string, searchParams: URLSearchParams): Promise<Response> {
    const sites = await readRegistry(registryFile);
    if (!sites.some((s) => s.id === id)) return notFound();
    const rawSince = Number(searchParams.get("since") ?? "0");
    const since = Number.isFinite(rawSince) && rawSince >= 0 ? rawSince : 0;
    return json(eventBus.get(id).since(since));
  }

  async function previewStatus(id: string): Promise<Response> {
    const sites = await readRegistry(registryFile);
    if (!sites.some((s) => s.id === id)) return notFound();
    return json(deps.preview.status(id));
  }

  async function previewStart(id: string): Promise<Response> {
    const reserved = await withRegistryLock(async (): Promise<
      { ok: true; slug: string; port: number } | { ok: false; response: Response }
    > => {
      const sites = await readRegistry(registryFile);
      const idx = sites.findIndex((s) => s.id === id);
      if (idx === -1) return { ok: false, response: notFound() };

      const takenPorts = sites.filter((s) => s.id !== id).map((s) => s.previewPort);
      const port = allocatePort(takenPorts);

      sites[idx] = { ...sites[idx], previewPort: port };
      await writeRegistry(registryFile, sites);

      return { ok: true, slug: sites[idx].slug, port };
    });

    if (!reserved.ok) return reserved.response;

    const status = await deps.preview.start(id, siteDirFor(reserved.slug), reserved.port);
    return json(status);
  }

  async function previewStop(id: string): Promise<Response> {
    const sites = await readRegistry(registryFile);
    if (!sites.some((s) => s.id === id)) return notFound();
    await deps.preview.stop(id);
    return json(deps.preview.status(id));
  }

  async function deleteSite(id: string): Promise<Response> {
    const sites = await readRegistry(registryFile);
    const idx = sites.findIndex((s) => s.id === id);
    if (idx === -1) return notFound();

    await deps.preview.stop(id);
    await rm(siteDirFor(sites[idx].slug), { recursive: true, force: true }).catch(() => {});

    // The final read + filter + write runs under the lock so a concurrent
    // create/edit landing during teardown can't be lost.
    await withRegistryLock(async () => {
      const fresh = await readRegistry(registryFile);
      await writeRegistry(
        registryFile,
        fresh.filter((s) => s.id !== id)
      );
    });

    return noContent();
  }

  async function route(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const { pathname, searchParams } = url;
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...CORS_HEADERS,
          "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "content-type",
        },
      });
    }

    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] !== "api" || parts[1] !== "sites") return notFound();

    if (parts.length === 2) {
      if (method === "GET") return listSites();
      if (method === "POST") return createSite(req);
      return notFound();
    }

    const id = decodeURIComponent(parts[2]!);

    if (parts.length === 3) {
      if (method === "GET") return getSite(id);
      if (method === "DELETE") return deleteSite(id);
      return notFound();
    }

    if (parts.length === 4 && parts[3] === "edit" && method === "POST") {
      return editSite(id, req);
    }

    if (parts.length === 4 && parts[3] === "events" && method === "GET") {
      return getEvents(id, searchParams);
    }

    if (parts.length === 4 && parts[3] === "preview" && (method === "GET" || method === "POST")) {
      return previewStatus(id);
    }

    if (parts.length === 5 && parts[3] === "preview" && parts[4] === "start" && (method === "GET" || method === "POST")) {
      return previewStart(id);
    }

    if (parts.length === 5 && parts[3] === "preview" && parts[4] === "stop" && (method === "GET" || method === "POST")) {
      return previewStop(id);
    }

    return notFound();
  }

  return Bun.serve({
    port: deps.port,
    async fetch(req) {
      try {
        return await route(req);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return json({ error: message }, { status: 500 });
      }
    },
  });
}
