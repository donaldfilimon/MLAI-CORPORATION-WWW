import { describe, it, expect, vi, afterEach } from "vitest";
import { createCheckout, getLlmStatus, getMfaStatus, getTelemetrySummary, sendLlmMessage } from "../lib/api";

afterEach(() => vi.unstubAllGlobals());

function mockFetch(impl: (input: string, init?: RequestInit) => Promise<Response>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("api — apiJson error/JSON contract (via wrappers)", () => {
  it("resolves the parsed JSON body on a 2xx response", async () => {
    mockFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await expect(getLlmStatus()).resolves.toEqual({ ok: true });
  });

  it("throws the response body text on a non-ok response", async () => {
    mockFetch(async () => new Response("upstream exploded", { status: 500 }));
    await expect(getLlmStatus()).rejects.toThrow("upstream exploded");
  });

  it("falls back to 'Request failed: <status>' when the error body is empty", async () => {
    mockFetch(async () => new Response("", { status: 503 }));
    await expect(getLlmStatus()).rejects.toThrow("Request failed: 503");
  });

  it("sendLlmMessage POSTs the messages with a JSON content-type", async () => {
    const fn = mockFetch(
      async () =>
        new Response(JSON.stringify({ ok: true, provider: "x", model: "y", text: "z" }), {
          status: 200,
        }),
    );
    await sendLlmMessage([{ role: "user", content: "hi" }]);
    expect(fn).toHaveBeenCalledWith(
      "/api/llm/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] }),
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });
});

/**
 * POST /api/billing/checkout returns its two structured, user-facing outcomes at
 * 400 and 503. These pin that they RESOLVE (so Profile can render the nextStep
 * copy) while a genuine fault still rejects — the distinction that was lost when
 * this call went through `apiJson`, which throws on any non-2xx.
 */
describe("api — createCheckout renders expected non-2xx outcomes", () => {
  const jsonRes = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  it("POSTs the plan id and resolves the payment url on a 200", async () => {
    const fn = mockFetch(async () => jsonRes({ ok: true, url: "https://pay.example/x" }, 200));
    await expect(createCheckout("pilot")).resolves.toEqual({
      ok: true,
      url: "https://pay.example/x",
    });
    expect(fn).toHaveBeenCalledWith(
      "/api/billing/checkout",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ planId: "pilot" }) }),
    );
  });

  it("returns the structured body on a 400 (plan priced individually)", async () => {
    mockFetch(async () =>
      jsonRes(
        {
          ok: false,
          error: "This plan is priced individually and has no self-serve checkout.",
          nextStep: "Contact sales to scope a Platform engagement.",
        },
        400,
      ),
    );
    await expect(createCheckout("platform")).resolves.toEqual({
      ok: false,
      error: "This plan is priced individually and has no self-serve checkout.",
      nextStep: "Contact sales to scope a Platform engagement.",
    });
  });

  it("returns the structured body on a 503 (STRIPE_PAYMENT_LINK unset)", async () => {
    mockFetch(async () =>
      jsonRes(
        {
          ok: false,
          error: "Billing checkout is not configured yet.",
          nextStep: "Set STRIPE_PAYMENT_LINK or replace this endpoint with Stripe Checkout.",
        },
        503,
      ),
    );
    const result = await createCheckout("pilot");
    expect(result).toMatchObject({ ok: false, error: "Billing checkout is not configured yet." });
    expect(result.ok === false && result.nextStep).toMatch(/STRIPE_PAYMENT_LINK/);
  });

  it("omits nextStep when the handler does not supply one (400 unknown plan)", async () => {
    mockFetch(async () => jsonRes({ error: "Unknown plan", validPlans: ["pilot"] }, 400));
    await expect(createCheckout("bogus")).resolves.toEqual({ ok: false, error: "Unknown plan" });
  });

  it("still throws on a genuine 500 rather than dressing it up as a business outcome", async () => {
    mockFetch(async () => jsonRes({ error: "boom" }, 500));
    await expect(createCheckout("pilot")).rejects.toThrow("boom");
  });

  it("still throws on a 401, which is not an expected checkout outcome", async () => {
    mockFetch(async () => jsonRes({ error: "Unauthorized" }, 401));
    await expect(createCheckout("pilot")).rejects.toThrow("Unauthorized");
  });

  it("throws on an infrastructure 503 whose body is not the handler's structured JSON", async () => {
    // A Cloud Run cold-start / load-balancer 503 returns HTML. Resolving it
    // would print "Request failed: 503" to the user as if it were product copy.
    mockFetch(async () => new Response("<html>Service Unavailable</html>", { status: 503 }));
    await expect(createCheckout("pilot")).rejects.toThrow("Request failed: 503");
  });

  it("still rejects when the network itself fails", async () => {
    mockFetch(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(createCheckout("pilot")).rejects.toThrow("Failed to fetch");
  });

  it("throws on a 200 that carries no payment url (broken handler, not an outcome)", async () => {
    mockFetch(async () => jsonRes({ ok: true }, 200));
    await expect(createCheckout("pilot")).rejects.toThrow(/payment URL/);
  });

  /**
   * `createCheckout` reaches apiJsonGated through two new *optional* arguments.
   * These pin that the admin readers, which pass neither, keep the original
   * resolve-on-any-non-ok behavior — the MFA/allowlist gate is a state the
   * console renders, and it must not start throwing because billing needed a
   * stricter contract.
   */
  it("leaves the ungated admin readers resolving a 403 rather than throwing", async () => {
    mockFetch(async () => jsonRes({ error: "Admin MFA required" }, 403));
    await expect(getTelemetrySummary()).resolves.toEqual({
      ok: false,
      status: 403,
      error: "Admin MFA required",
      body: { error: "Admin MFA required" },
    });
  });

  it("leaves the ungated admin readers resolving a non-JSON 401 with the status message", async () => {
    mockFetch(async () => new Response("<html>nope</html>", { status: 401 }));
    await expect(getMfaStatus()).resolves.toMatchObject({
      ok: false,
      status: 401,
      error: "Request failed: 401",
    });
  });
});
