import { afterEach, describe, expect, it, vi } from "vitest";
import type { SessionData } from "../lib/server/session";

const session: SessionData = {
  userId: "user_123",
  email: "donald@mlai-corp.com",
  accessToken: "test-access-token",
};

async function loadWorkos() {
  vi.resetModules();
  return import("../lib/server/workos");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("admin access policy", () => {
  it("fails closed in production when ADMIN_EMAILS is unset", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAILS", "");

    const { checkAdminIdentity } = await loadWorkos();

    expect(checkAdminIdentity(session)).toEqual({
      ok: false,
      error: "Administrative access is not configured",
    });
  });

  it("rejects signed-in users outside the admin allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAILS", "admin@example.com");

    const { checkAdminIdentity } = await loadWorkos();

    expect(checkAdminIdentity(session)).toEqual({
      ok: false,
      error: "Administrative access required",
    });
  });

  it("accepts allowlisted admin emails case-insensitively", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAILS", "ADMIN@example.com, Donald@MLAI-Corp.com ");

    const { checkAdminIdentity } = await loadWorkos();

    expect(checkAdminIdentity(session)).toEqual({ ok: true });
  });
});

describe("getReturnTo — open-redirect guard", () => {
  it("rejects unsafe targets, returning '/'", async () => {
    const { getReturnTo } = await loadWorkos();
    // missing / non-string
    expect(getReturnTo(undefined)).toBe("/");
    expect(getReturnTo(null)).toBe("/");
    expect(getReturnTo("")).toBe("/");
    // absolute / protocol-relative — the classic open-redirect vectors
    expect(getReturnTo("//evil.com")).toBe("/");
    expect(getReturnTo("https://evil.com")).toBe("/");
    expect(getReturnTo("javascript:alert(1)")).toBe("/");
    // internal API paths must not be a post-auth landing target
    expect(getReturnTo("/api/auth/login")).toBe("/");
  });

  it("passes through safe same-origin relative paths unchanged", async () => {
    const { getReturnTo } = await loadWorkos();
    expect(getReturnTo("/")).toBe("/");
    expect(getReturnTo("/blog/post")).toBe("/blog/post");
    expect(getReturnTo("/console")).toBe("/console");
  });
});
