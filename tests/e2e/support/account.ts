import { expect, type APIRequestContext } from "@playwright/test";

/**
 * Better Auth applies a built-in rule to `/sign-in`, `/sign-up`,
 * `/change-password` and `/change-email` of three requests per ten seconds per
 * IP and path — stricter than, and independent of, the `rateLimit` window
 * configured in `auth.ts`. Fixture accounts across the suite share that budget,
 * so a whole-suite run trips it and reports a 429 as a broken sign-up flow.
 *
 * Waiting is the correct response here: the limit protects a credential
 * endpoint and must not be raised to make a test run green.
 */
export async function signUpFixture(
  request: APIRequestContext,
  base: string,
  data: { name: string; email: string; password: string },
) {
  for (let attempt = 0; ; attempt++) {
    const response = await request.post(`${base}/api/auth/sign-up/email`, {
      headers: { Origin: base },
      data,
    });
    if (response.status() !== 429 || attempt === 2) {
      expect(
        response.ok(),
        `sign-up failed with ${response.status()}: ${await response.text()}`,
      ).toBe(true);
      return response;
    }
    const retryAfter = Number(response.headers()["retry-after"]);
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        (Number.isFinite(retryAfter) ? retryAfter : 10) * 1000 + 500,
      ),
    );
  }
}
