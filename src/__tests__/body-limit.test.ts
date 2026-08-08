import { describe, expect, it } from "vitest";
import { payloadTooLarge, readBodyLimited } from "../lib/server/body-limit";

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
});

describe("payloadTooLarge", () => {
  it("is a 413 with a JSON error body", async () => {
    const res = payloadTooLarge();
    expect(res.status).toBe(413);
    await expect(res.json()).resolves.toEqual({ error: "Payload too large" });
  });
});
