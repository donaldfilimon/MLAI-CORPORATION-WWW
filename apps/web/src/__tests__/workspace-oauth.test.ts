/**
 * The workspace OAuth flow handles a user's Drive credentials, so the cases
 * that matter are the ones that keep someone else from using it: the CSRF
 * nonce, the provider binding on that nonce, PKCE, and the scope set.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  WORKSPACE_PROVIDERS,
  buildAuthorizeUrl,
  clearWorkspaceStateCookie,
  createPkceVerifier,
  decodePendingFlow,
  decodeWorkspaceState,
  encodePendingFlow,
  encodeWorkspaceState,
  exchangeAuthorizationCode,
  isWorkspaceProvider,
  pkceChallenge,
  providerConfig,
  providerCredentials,
  readPendingFlow,
  refreshAccessToken,
  revokeGrant,
  timingSafeEqualString,
  workspaceRedirectUri,
  workspaceStateCookie,
  WORKSPACE_STATE_COOKIE,
} from "../lib/server/workspace-oauth";

const ENV_KEYS = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "MICROSOFT_OAUTH_CLIENT_ID",
  "MICROSOFT_OAUTH_CLIENT_SECRET",
  "MICROSOFT_OAUTH_TENANT",
] as const;

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
  vi.unstubAllEnvs();
});

describe("provider identity", () => {
  it("only recognises the two known providers", () => {
    expect(WORKSPACE_PROVIDERS).toEqual(["google", "microsoft"]);
    expect(isWorkspaceProvider("google")).toBe(true);
    expect(isWorkspaceProvider("microsoft")).toBe(true);
    // The provider arrives as a URL path segment, so this is the guard that
    // stops an attacker-chosen string from indexing the config map.
    expect(isWorkspaceProvider("dropbox")).toBe(false);
    expect(isWorkspaceProvider("__proto__")).toBe(false);
    expect(isWorkspaceProvider("constructor")).toBe(false);
    expect(isWorkspaceProvider(null)).toBe(false);
    expect(isWorkspaceProvider(1)).toBe(false);
  });

  /* If this test has to change, someone is widening what the console can do to
     a user's account. That should be argued for in review, not slipped in. */
  it("requests read-only scopes and nothing else", () => {
    expect(providerConfig("google").scopes).toEqual([
      "https://www.googleapis.com/auth/drive.readonly",
      "openid",
      "email",
    ]);
    expect(providerConfig("microsoft").scopes).toEqual([
      "Files.Read.All",
      "User.Read",
      "offline_access",
    ]);
    const all = [...providerConfig("google").scopes, ...providerConfig("microsoft").scopes].join(" ");
    for (const forbidden of ["write", "readwrite", "ReadWrite", "full_control", "Mail.Send"]) {
      expect(all).not.toContain(forbidden);
    }
  });

  it("reports no credentials rather than throwing when a provider is unset", () => {
    expect(providerCredentials("google")).toBeNull();
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "id-123");
    // Half-configured is still unconfigured — an id with no secret cannot
    // complete a code exchange.
    expect(providerCredentials("google")).toBeNull();
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_SECRET", "secret-123");
    expect(providerCredentials("google")).toEqual({
      clientId: "id-123",
      clientSecret: "secret-123",
    });
  });

  it("resolves the Microsoft tenant at call time, defaulting to common", () => {
    expect(providerConfig("microsoft").authorizeUrl).toContain("/common/");
    vi.stubEnv("MICROSOFT_OAUTH_TENANT", "contoso.onmicrosoft.com");
    expect(providerConfig("microsoft").authorizeUrl).toContain("/contoso.onmicrosoft.com/");
    expect(providerConfig("microsoft").tokenUrl).toContain("/contoso.onmicrosoft.com/");
  });
});

describe("PKCE", () => {
  /* RFC 7636 Appendix B. Getting the S256 transform subtly wrong would still
     "work" against a lenient server and silently drop the protection. */
  it("matches the RFC 7636 S256 test vector", () => {
    expect(pkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")).toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  it("mints verifiers that are URL-safe and unique", () => {
    const a = createPkceVerifier();
    const b = createPkceVerifier();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
});

describe("state and the pending-flow cookie", () => {
  it("round-trips, and rejects anything malformed instead of throwing", () => {
    const flow = { nonce: "n1", verifier: "v1", provider: "google" as const };
    expect(decodePendingFlow(encodePendingFlow(flow))).toEqual(flow);
    expect(decodeWorkspaceState(encodeWorkspaceState("n1", "google"))).toEqual({
      nonce: "n1",
      provider: "google",
    });

    for (const bad of [null, "", "not-base64url!!", Buffer.from("{}").toString("base64url")]) {
      expect(decodePendingFlow(bad)).toBeNull();
      expect(decodeWorkspaceState(bad)).toBeNull();
    }
    // A flow naming a provider we do not serve is not a flow.
    const forged = Buffer.from(
      JSON.stringify({ nonce: "n", verifier: "v", provider: "dropbox" }),
    ).toString("base64url");
    expect(decodePendingFlow(forged)).toBeNull();
  });

  it("reads the cookie out of a request and ignores other cookies", () => {
    const value = encodePendingFlow({ nonce: "n2", verifier: "v2", provider: "microsoft" });
    const req = new Request("https://example.test/api/workspace/callback/microsoft", {
      headers: { cookie: `mlai_session=abc; ${WORKSPACE_STATE_COOKIE}=${value}; other=1` },
    });
    expect(readPendingFlow(req)?.nonce).toBe("n2");
    expect(readPendingFlow(new Request("https://example.test/"))).toBeNull();
  });

  it("scopes the cookie HttpOnly + Lax, and Secure only in production", () => {
    const dev = workspaceStateCookie("v");
    expect(dev).toContain("HttpOnly");
    // Lax, not Strict: the callback is a top-level cross-site GET, which
    // Strict would drop — the flow would break for every user.
    expect(dev).toContain("SameSite=Lax");
    expect(dev).not.toContain("Secure");

    vi.stubEnv("NODE_ENV", "production");
    expect(workspaceStateCookie("v")).toContain("Secure");
    expect(clearWorkspaceStateCookie()).toContain("Max-Age=0");
  });

  it("compares nonces without leaking length or content by timing", () => {
    expect(timingSafeEqualString("abc", "abc")).toBe(true);
    expect(timingSafeEqualString("abc", "abd")).toBe(false);
    expect(timingSafeEqualString("abc", "abcd")).toBe(false);
    expect(timingSafeEqualString("", "")).toBe(true);
  });
});

describe("authorize URL", () => {
  it("carries PKCE, state, the read-only scopes, and our exact redirect", () => {
    const url = new URL(
      buildAuthorizeUrl(
        "google",
        { clientId: "id-123", clientSecret: "secret-123" },
        "state-abc",
        "challenge-abc",
      ),
    );
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("id-123");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("state-abc");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-abc");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("redirect_uri")).toBe(workspaceRedirectUri("google"));
    expect(url.searchParams.get("scope")).toContain("drive.readonly");
    // The client secret is a server-side value; it must never ride along on a
    // URL the browser is about to follow.
    expect(url.toString()).not.toContain("secret-123");
  });

  it("asks Google for offline access, or the connection dies in an hour", () => {
    const url = new URL(
      buildAuthorizeUrl("google", { clientId: "i", clientSecret: "s" }, "st", "ch"),
    );
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
  });
});

describe("revokeGrant", () => {
  const credentials = { clientId: "id-1", clientSecret: "secret-1" };

  it("posts the refresh token to Google's revocation endpoint", async () => {
    let url = "";
    let body = "";
    const fetchImpl = (async (target: string, init: RequestInit) => {
      url = target;
      body = String(init.body);
      return { ok: true, status: 200 };
    }) as unknown as typeof fetch;

    await expect(revokeGrant("google", credentials, "rt-1", fetchImpl)).resolves.toBe(true);
    expect(url).toBe("https://oauth2.googleapis.com/revoke");
    expect(new URLSearchParams(body).get("token")).toBe("rt-1");
  });

  /* Microsoft has no delegated revocation endpoint — a user clears the grant
     through My Apps. Reporting false is the honest answer; inventing a call
     would make Disconnect claim something it did not do. */
  it("reports false for Microsoft rather than pretending to revoke", async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return { ok: true, status: 200 };
    }) as unknown as typeof fetch;
    await expect(revokeGrant("microsoft", credentials, "rt-1", fetchImpl)).resolves.toBe(false);
    expect(called).toBe(false);
  });

  it("reports false, never throws, when the provider is unreachable", async () => {
    const rejecting = (async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    // The caller deletes the local record regardless; a thrown error here would
    // leave the user still connected after pressing Disconnect.
    await expect(revokeGrant("google", credentials, "rt-1", rejecting)).resolves.toBe(false);

    const refusing = (async () => ({ ok: false, status: 400 })) as unknown as typeof fetch;
    await expect(revokeGrant("google", credentials, "rt-1", refusing)).resolves.toBe(false);
  });
});

describe("token endpoint", () => {
  const credentials = { clientId: "id-1", clientSecret: "secret-1" };

  it("posts the code with the PKCE verifier and parses the grant", async () => {
    let sentBody = "";
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      sentBody = String(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          access_token: "at-1",
          refresh_token: "rt-1",
          expires_in: 3600,
          scope: "drive.readonly",
        }),
      };
    }) as unknown as typeof fetch;

    const tokens = await exchangeAuthorizationCode(
      "google",
      credentials,
      "code-1",
      "verifier-1",
      fetchImpl,
    );
    const sent = new URLSearchParams(sentBody);
    expect(sent.get("grant_type")).toBe("authorization_code");
    expect(sent.get("code")).toBe("code-1");
    expect(sent.get("code_verifier")).toBe("verifier-1");
    expect(sent.get("redirect_uri")).toBe(workspaceRedirectUri("google"));
    expect(tokens.accessToken).toBe("at-1");
    expect(tokens.refreshToken).toBe("rt-1");
    // Expiry is stored with skew subtracted, so a token is refreshed slightly
    // early rather than used a moment after it dies.
    expect(tokens.expiresAt).toBeLessThan(Date.now() + 3600 * 1000);
    expect(tokens.expiresAt).toBeGreaterThan(Date.now());
  });

  it("summarises a token-endpoint failure without echoing the body", async () => {
    const fetchImpl = (async () => ({
      ok: false,
      status: 400,
      json: async () => ({ error: "invalid_grant", client_secret: "secret-1" }),
    })) as unknown as typeof fetch;

    await expect(
      refreshAccessToken("google", credentials, "rt-1", fetchImpl),
    ).rejects.toThrow(/google token endpoint responded 400/);

    // The thrown message reaches logs; the provider's body can contain the
    // credential we just sent, so it must not be part of it.
    await refreshAccessToken("google", credentials, "rt-1", fetchImpl).catch((error: Error) => {
      expect(error.message).not.toContain("secret-1");
      expect(error.message).not.toContain("invalid_grant");
    });
  });

  it("rejects a 200 that carries no access token", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ refresh_token: "rt-only" }),
    })) as unknown as typeof fetch;
    await expect(refreshAccessToken("google", credentials, "rt", fetchImpl)).rejects.toThrow(
      /no access token/,
    );
  });

  it("treats a refresh with no new refresh token as non-rotating, not broken", async () => {
    const fetchImpl = (async () => ({
      ok: true,
      status: 200,
      json: async () => ({ access_token: "at-2", expires_in: 3600 }),
    })) as unknown as typeof fetch;
    const tokens = await refreshAccessToken("google", credentials, "rt", fetchImpl);
    expect(tokens.accessToken).toBe("at-2");
    expect(tokens.refreshToken).toBeNull();
  });
});
