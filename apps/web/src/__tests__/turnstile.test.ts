import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstile } from "../lib/server/turnstile";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function request() {
  return new Request("https://quesar.cloud/api/inquiries", {
    headers: { "cf-connecting-ip": "203.0.113.7" },
  });
}

describe("verifyTurnstile", () => {
  it("fails closed when the secret or hostname allowlist is absent", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "");
    vi.stubEnv("TURNSTILE_HOSTNAMES", "");
    expect(await verifyTurnstile(request(), "token-long-enough", "inquiry")).toBe(false);
  });

  it("accepts only a successful response with the expected action and hostname", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "secret");
    vi.stubEnv("TURNSTILE_HOSTNAMES", "quesar.cloud,www.quesar.cloud");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ success: true, action: "inquiry", hostname: "quesar.cloud" }),
    );

    expect(await verifyTurnstile(request(), "token-long-enough", "inquiry")).toBe(true);
    const init = fetchMock.mock.calls[0]?.[1];
    expect(String(init?.body)).toContain("remoteip=203.0.113.7");
  });

  it("rejects action and hostname mismatches", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "secret");
    vi.stubEnv("TURNSTILE_HOSTNAMES", "quesar.cloud");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ success: true, action: "login", hostname: "attacker.example" }),
    );
    expect(await verifyTurnstile(request(), "token-long-enough", "inquiry")).toBe(false);
  });
});
