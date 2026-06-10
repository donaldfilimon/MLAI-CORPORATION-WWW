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
