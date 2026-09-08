import { expect, test } from "bun:test";
import { Connection, DEFAULT_ORIGIN, normalizeOrigin, applyEventPage } from "./connection";
const storage = (value: string | null = null) => ({ getItem: async () => value, setItem: async (_: string, next: string) => { value = next; } });
const stub = (fn: (...args: Parameters<typeof fetch>) => Promise<Response>) => fn as typeof fetch;
test("strict normalized origins", () => {
  expect(normalizeOrigin(" http://localhost:4700/ ")).toBe(DEFAULT_ORIGIN);
  for (const v of ["bad", "http:host", "ftp://host", "http://user:pass@host", "http://@host", "http://host/path", "http://host/foo/..", "http://host?", "http://host#", "http://host\\path"]) expect(() => normalizeOrigin(v)).toThrow();
});
test("hydration precedes requests and persistence survives recreation", async () => {
  let release!: (value: string) => void;
  const calls: string[] = [];
  const saved = storage();
  const client = new Connection({ ...saved, getItem: () => new Promise(resolve => { release = resolve; }) }, stub(async url => { calls.push(String(url)); return Response.json([]); }));
  const pending = client.request("/api/sites");
  expect(calls).toEqual([]);
  release("http://lan:4700/");
  await pending;
  expect(calls).toEqual(["http://lan:4700/api/sites"]);
  await client.save("https://other.test/");
  const reopened = new Connection(saved);
  await reopened.hydrate();
  expect(reopened.origin).toBe("https://other.test");
});
test("storage failure preserves current origin", async () => {
  const client = new Connection({ getItem: async () => null, setItem: async () => { throw Error("disk"); } });
  await expect(client.save("http://other")).rejects.toThrow("disk");
  expect(client.origin).toBe(DEFAULT_ORIGIN);
});
test("timeouts and cancellation bound an uncooperative transport", async () => {
  const client = new Connection(storage(), stub(async () => new Promise(() => {})));
  await expect(client.request("/api/sites", {}, 5)).rejects.toThrow("timed out");
  const controller = new AbortController();
  const cancelled = client.request("/api/sites", { signal: controller.signal });
  controller.abort();
  await expect(cancelled).rejects.toThrow("cancelled");
  const old = client.request("/api/sites");
  await client.save("http://new:4700");
  await expect(old).rejects.toThrow("cancelled");
});
test("synchronous double-action guard and explicit recovery after uncertain outcome", async () => {
  let calls = 0;
  let fail!: (error: Error) => void;
  const client = new Connection(storage());
  await client.hydrate();
  const first = client.mutate("site", () => { calls++; return new Promise((_, reject) => { fail = reject; }); });
  await expect(client.mutate("site", async () => { calls++; })).rejects.toThrow("pending");
  fail(Error("disconnected"));
  await expect(first).rejects.toThrow("disconnected");
  await expect(client.mutate("site", async () => { calls++; })).rejects.toThrow("uncertain");
  await expect(client.recover(async () => { throw Error("offline"); })).rejects.toThrow("offline");
  await expect(client.mutate("site", async () => { calls++; })).rejects.toThrow("uncertain");
  await client.recover(async id => { expect(id).toBe("site"); });
  await client.mutate("site", async () => { calls++; });
  expect(calls).toBe(2);
});
test("cursor catchup excludes duplicate pages and handles a restarted buffer", () => {
  const page = { events: ["a", "b"], next: 2 };
  const first = applyEventPage({ events: [] as string[], next: 0 }, 0, page);
  expect(applyEventPage(first, 0, page)).toBe(first);
  expect(applyEventPage(first, 2, { events: ["done"], next: 3 }).events).toEqual(["a", "b", "done"]);
  expect(applyEventPage(first, 2, { events: [], next: 0 })).toEqual({ events: [], next: 0 });
});
test("exclusive retries cannot clear uncertainty from a later failed mutation", async () => {
  const client = new Connection(storage());
  await expect(client.mutate("old", async () => { throw Error("first disconnect"); })).rejects.toThrow("disconnect");
  let finish!: () => void;
  const read = new Promise<void>(resolve => { finish = resolve; });
  const firstRetry = client.recover(async id => { expect(id).toBe("old"); await read; });
  await expect(client.recover(async () => {})).rejects.toThrow("pending");
  await expect(client.mutate("new", async () => {})).rejects.toThrow("pending");
  finish();
  await firstRetry;
  await expect(client.mutate("new", async () => { throw Error("second disconnect"); })).rejects.toThrow("disconnect");
  await expect(client.mutate("new", async () => {})).rejects.toThrow("uncertain");
  await expect(client.recover(async () => { throw Error("read failed"); })).rejects.toThrow("read failed");
  await client.recover(async id => { expect(id).toBe("new"); });
  await client.mutate("new", async () => {});
});
test("read-only recovery excludes mutations and releases on origin change", async () => {
  const client = new Connection(storage());
  let finish!: () => void;
  const read = new Promise<void>(resolve => { finish = resolve; });
  const retry = client.recover(async () => { await read; });
  await expect(client.mutate("site", async () => {})).rejects.toThrow("pending");
  await client.save("http://changed:4700");
  finish();
  await expect(retry).rejects.toThrow("Server changed");
  await client.mutate("site", async () => {});
});
test("fetch receives its browser global receiver rather than the Connection instance", async () => {
  const nativeLikeFetch = function (this: unknown, input: RequestInfo | URL): Promise<Response> {
    expect(this).toBe(globalThis);
    expect(String(input)).toBe(`${DEFAULT_ORIGIN}/api/sites`);
    return Promise.resolve(Response.json([]));
  } as typeof fetch;
  const client = new Connection(storage(), nativeLikeFetch);
  expect(await client.request<unknown[]>("/api/sites")).toEqual([]);
});
