import { describe, expect, it } from "vitest";
import { payloadTooLarge, readBodyLimited, readJsonLimited } from "../lib/server/body-limit";

function stringReq(body: string): Request {
  // Content-Length is set automatically and accurately from the byte length.
  return new Request("https://example.test/api/x", { method: "POST", body });
}

function streamReq(bytes: number): Request {
  // No Content-Length — the ONLY way to reach the streaming counter.
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new Uint8Array(bytes));
      c.close();
    },
  });
  return new Request("https://example.test/api/x", {
    method: "POST",
    body,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
}

describe("readBodyLimited — Content-Length pre-check", () => {
  it("returns the body when under the cap", async () => {
    expect(await readBodyLimited(stringReq("hello"), 1024)).toBe("hello");
  });

  it("returns null when the declared length exceeds the cap", async () => {
    expect(await readBodyLimited(stringReq("x".repeat(5000)), 100)).toBeNull();
  });

  it("measures bytes, not characters — a multibyte body is over the cap", async () => {
    // "€" is 3 bytes in UTF-8; 40 of them is 120 bytes > a 100-byte cap. This
    // still exits at the header check — Content-Length is byte length, so it
    // pins the units, not the streaming path.
    expect(await readBodyLimited(stringReq("€".repeat(40)), 100)).toBeNull();
  });
});

describe("readBodyLimited — streaming counter (no Content-Length)", () => {
  it("returns null once the streamed bytes exceed the cap", async () => {
    expect(await readBodyLimited(streamReq(5000), 100)).toBeNull();
  });

  it("returns the decoded body when the stream stays under the cap", async () => {
    const res = await readBodyLimited(streamReq(50), 100);
    expect(res).not.toBeNull();
    expect(res).toHaveLength(50); // 50 zero bytes decode to 50 NUL chars
  });

  it("returns an empty string for a bodyless request", async () => {
    const req = new Request("https://example.test/api/x", { method: "POST" });
    expect(await readBodyLimited(req, 100)).toBe("");
  });

  it("returns null, not a rejection, when the stream errors mid-read (client abort)", async () => {
    // An aborted upload must map to a 4xx like the old in-try req.json() did,
    // never escape the handler as a 500.
    const body = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(10));
        c.error(new Error("client went away"));
      },
    });
    const req = new Request("https://example.test/api/x", {
      method: "POST",
      body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    await expect(readBodyLimited(req, 1024)).resolves.toBeNull();
  });
});

describe("payloadTooLarge", () => {
  it("is a 413 with a JSON error body", async () => {
    const res = payloadTooLarge();
    expect(res.status).toBe(413);
    await expect(res.json()).resolves.toEqual({ error: "Payload too large" });
  });
});

describe("readJsonLimited — the shared JSON-route contract", () => {
  it("returns the parsed value when the body is valid JSON under the cap", async () => {
    const req = stringReq(JSON.stringify({ event: "inquiry_open" }));
    const body = await readJsonLimited<{ event?: string }>(req, 1024);
    expect(body).not.toBeInstanceOf(Response);
    expect((body as { event?: string }).event).toBe("inquiry_open");
  });

  it("returns a 413 when the body exceeds the cap", async () => {
    const body = await readJsonLimited(stringReq(JSON.stringify({ x: "y".repeat(5000) })), 100);
    expect(body).toBeInstanceOf(Response);
    expect((body as Response).status).toBe(413);
  });

  it("returns a 400 when the body is not JSON", async () => {
    const body = await readJsonLimited(stringReq("not-json-at-all"), 1024);
    expect(body).toBeInstanceOf(Response);
    expect((body as Response).status).toBe(400);
    await expect((body as Response).json()).resolves.toEqual({ error: "Invalid JSON body" });
  });

  it("returns a 400 for an empty body — an aborted read is 413, a bodyless POST is 400", async () => {
    const req = new Request("https://example.test/api/x", { method: "POST" });
    const body = await readJsonLimited(req, 1024);
    expect((body as Response).status).toBe(400);
  });

  // Every caller does `body.someField` straight after the `instanceof Response`
  // narrowing. These bodies are all VALID JSON, so before the shape check they
  // parsed cleanly and then threw on property access — outside the routes'
  // try/catch, i.e. a 500 (publicly, on /api/inquiries and /api/telemetry).
  // The point of each case is as much "does not throw" as "is a 400".
  describe.each([
    ["null", "null"],
    ["a number", "5"],
    ["a string", '"str"'],
    ["a boolean", "true"],
    ["an array", "[]"],
    ["a populated array", '[{"event":"inquiry_open"}]'],
  ])("rejects %s — valid JSON, but not an object", (_label, payload) => {
    it("returns a 400 Response rather than throwing or yielding a parsed value", async () => {
      const body = await readJsonLimited(stringReq(payload), 1024);
      expect(body).toBeInstanceOf(Response);
      expect((body as Response).status).toBe(400);
      // Same error shape as the unparseable branch — no new string to learn.
      await expect((body as Response).json()).resolves.toEqual({ error: "Invalid JSON body" });
    });
  });

  it("still accepts an empty object — the shape check rejects non-objects, not sparse ones", async () => {
    const body = await readJsonLimited<{ event?: string }>(stringReq("{}"), 1024);
    expect(body).not.toBeInstanceOf(Response);
    expect((body as { event?: string }).event).toBeUndefined();
  });

  it("returns a 413 when the stream errors mid-read", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(10));
        c.error(new Error("client went away"));
      },
    });
    const req = new Request("https://example.test/api/x", {
      method: "POST",
      body: stream,
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    expect(((await readJsonLimited(req, 1024)) as Response).status).toBe(413);
  });
});
