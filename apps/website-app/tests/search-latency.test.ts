import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Source } from "../src/lib/server/search";
import type { Context } from "../src/lib/server/http";
const { semanticSearch } = vi.hoisted(() => ({ semanticSearch: vi.fn() }));
vi.mock("../src/lib/server/embeddings", () => ({ semanticSearch }));
const dir = mkdtempSync(join(tmpdir(), "mlai-search-latency-"));
process.env.MLAI_DATA_DIR = dir;
process.env.APP_URL = "http://127.0.0.1:3100";
const { auth } = await import("../src/lib/server/auth");
const { dispatch } = await import("../src/lib/server/api");
const { documentRoutes } = await import("../src/lib/server/documents");
const { retrieve } = await import("../src/lib/server/search");
const { sqlite, one, run } = await import("../src/lib/server/db");
let cookie: string;
let ctx: Context;
const semantic: Source = {
  id: "related",
  documentId: "owned-doc",
  name: "review.md",
  content: "Related evidence",
  location: {},
};
beforeAll(async () => {
  const response = await auth.handler(
    new Request(`${process.env.APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: process.env.APP_URL!,
      },
      body: JSON.stringify({
        email: "search@example.test",
        password: "Local-only-password!42",
        name: "Search",
      }),
    }),
  );
  expect(response.status).toBe(200);
  const { user } = await response.json();
  cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const workspaceId = one<{ workspace_id: string }>(
    "SELECT workspace_id FROM memberships WHERE user_id=?",
    user.id,
  )!.workspace_id;
  ctx = {
    userId: user.id,
    workspaceId,
    name: "Search",
    role: "owner",
    staff: false,
    apiKey: false,
  };
  run(
    "INSERT INTO workspaces(id,name,created_at) VALUES('other-workspace','Other',1)",
  );
  for (const [prefix, workspace] of [
    ["owned", workspaceId],
    ["private", "other-workspace"],
  ]) {
    run(
      "INSERT INTO documents(id,workspace_id,name,extension,size,status,created_at,updated_at) VALUES(?,?,'review.md','md',20,'ready',1,1)",
      `${prefix}-doc`,
      workspace,
    );
    run(
      "INSERT INTO chunks(id,document_id,workspace_id,ordinal,content,location) VALUES(?,?,?,0,'Morgan reviewed the evidence','{}')",
      `${prefix}-chunk`,
      `${prefix}-doc`,
      workspace,
    );
  }
});
beforeEach(() => {
  vi.useFakeTimers();
  semanticSearch.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
});
afterAll(() => {
  sqlite.close();
  rmSync(dir, { recursive: true, force: true });
});
function slowSemantic() {
  let ownedSignal: AbortSignal;
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  semanticSearch.mockImplementation(
    (_w, _q, _p, _d, _l, signal: AbortSignal) => {
      ownedSignal = signal;
      started();
      return new Promise<Source[]>((_, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
        signal.throwIfAborted();
      });
    },
  );
  return { ready, signal: () => ownedSignal };
}
function route(signal?: AbortSignal) {
  return documentRoutes(
    new Request(`${process.env.APP_URL}/api/v1/search?q=Morgan`, { signal }),
    ["search"],
    ctx,
  );
}
describe("interactive search semantic latency", () => {
  it("returns fast hybrid matches with workspace and document filters", async () => {
    semanticSearch.mockResolvedValue([semantic]);
    const result = await retrieve(
      ctx.workspaceId,
      "Morgan",
      undefined,
      ["owned-doc"],
      30,
      undefined,
      { semanticTimeoutMs: 10_000 },
    );
    expect(result.mode).toBe("hybrid");
    expect(result.results.map((r) => r.id)).toEqual([
      semantic.id,
      "owned-chunk",
    ]);
    expect(semanticSearch).toHaveBeenCalledWith(
      ctx.workspaceId,
      "Morgan",
      undefined,
      ["owned-doc"],
      30,
      expect.any(AbortSignal),
    );
    expect(vi.getTimerCount()).toBe(0);
  });
  it("returns only authorized keyword matches at the route's ten second budget and aborts semantic work", async () => {
    const slow = slowSemantic();
    const pending = route();
    await slow.ready;
    await vi.advanceTimersByTimeAsync(9_999);
    expect(slow.signal().aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const response = await pending;
    expect(response?.status).toBe(200);
    const result = await response!.json();
    expect(result.mode).toBe("keyword");
    expect(result.results.map((r: Source) => r.id)).toEqual(["owned-chunk"]);
    expect(result.reason).toContain("timed out");
    expect(slow.signal().aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("propagates caller abort without fallback and removes its listener and timer", async () => {
    const slow = slowSemantic();
    const controller = new AbortController();
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    const pending = retrieve(
      ctx.workspaceId,
      "Morgan",
      undefined,
      undefined,
      30,
      controller.signal,
      { semanticTimeoutMs: 10_000 },
    );
    const cancelled = new DOMException("User left search", "AbortError");
    const assertion = expect(pending).rejects.toBe(cancelled);
    await slow.ready;
    controller.abort(cancelled);
    await assertion;
    expect(slow.signal().reason).toBe(cancelled);
    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
  it("passes HTTP request cancellation to semantic retrieval", async () => {
    const slow = slowSemantic();
    const controller = new AbortController();
    const pending = route(controller.signal);
    const assertion = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    await slow.ready;
    controller.abort();
    await assertion;
    expect(slow.signal().aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("preserves retrieval defaults for chat and agent callers", async () => {
    const slow = slowSemantic();
    const controller = new AbortController();
    const pending = retrieve(
      ctx.workspaceId,
      "Morgan",
      undefined,
      undefined,
      8,
      controller.signal,
    );
    const assertion = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    await slow.ready;
    await vi.advanceTimersByTimeAsync(10_001);
    expect(slow.signal().aborted).toBe(false);
    controller.abort();
    await assertion;
  });
  it("keeps unavailable and empty searches distinct from timeout", async () => {
    semanticSearch.mockRejectedValue(new Error("No index"));
    const result = await retrieve(
      ctx.workspaceId,
      "Morgan",
      undefined,
      undefined,
      8,
      undefined,
      { semanticTimeoutMs: 10_000 },
    );
    expect(result.reason).toContain("unavailable");
    expect(result.results.map((r) => r.id)).toEqual(["owned-chunk"]);
    semanticSearch.mockClear();
    expect(await retrieve(ctx.workspaceId, " ")).toEqual({
      mode: "keyword",
      results: [],
      reason: "Enter a search query.",
    });
    expect(semanticSearch).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("retains API session and membership guards before starting search", async () => {
    vi.useRealTimers();
    for (const [headers, status] of [
      [{}, 401],
      [{ Cookie: cookie, "X-Workspace-ID": "other-workspace" }, 403],
    ] as const) {
      const response = await dispatch(
        new Request(`${process.env.APP_URL}/api/v1/search?q=Morgan`, {
          headers,
        }),
        ["search"],
      );
      expect(response.status).toBe(status);
    }
    expect(semanticSearch).not.toHaveBeenCalled();
  });
});
