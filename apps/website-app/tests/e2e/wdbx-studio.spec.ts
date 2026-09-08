import { test, expect, type Cookie } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { signUpFixture } from "./support/account";

const studioUrl = "https://wdbx-specimen-studio.underswitch.chatgpt.site/";

// The account is a fixture, not the subject: the boundary assertion is
// identical at every width. Creating it once and replaying its cookies keeps
// three sign-ups off a credential endpoint that allows three per ten seconds.
let fixtureCookies: Cookie[] = [];

test.beforeAll(async ({ playwright, baseURL }) => {
  const api = await playwright.request.newContext({ baseURL });
  await signUpFixture(api, baseURL!, {
    name: "Studio boundary fixture",
    email: `studio-${randomBytes(12).toString("hex")}@example.test`,
    password: randomBytes(24).toString("base64url"),
  });
  fixtureCookies = (await api.storageState()).cookies;
  await api.dispose();
});

for (const width of [390, 768, 1440]) {
  test(`Studio handoff preserves the console boundary at ${width}px`, async ({
    page,
    context,
    baseURL,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 500) errors.push(`HTTP ${response.status()}`);
    });
    await page.setViewportSize({ width, height: 960 });
    // Only synthetic accounts in the configured e2e installation. No provider
    // selection, binding, probes, or playground operations are performed.
    await context.addCookies(fixtureCookies);

    const outbound: {
      url: string;
      method: string;
      body: string | null;
      headers: Record<string, string>;
    }[] = [];
    // Intercept at context scope so the popup's first request is intercepted.
    // This tests the handoff, not the published Studio's functionality.
    await context.route(
      "https://wdbx-specimen-studio.underswitch.chatgpt.site/**",
      async (route) => {
        const request = route.request();
        outbound.push({
          url: request.url(),
          method: request.method(),
          body: request.postData(),
          headers: await request.allHeaders(),
        });
        await route.fulfill({
          contentType: "text/html",
          body: "<!doctype html><title>Studio handoff fixture</title><p>External destination intercepted</p>",
        });
      },
    );
    await page.goto("/app/console");
    await expect(page).toHaveURL(/\/app\/console$/);
    await expect(page).toHaveTitle(/Workspace/);
    await expect(
      page.getByRole("heading", { name: "Developer console", exact: true }),
    ).toBeVisible();
    const panel = page.getByRole("region", {
      name: "Explore an inspectable specimen.",
    });
    const link = panel.getByRole("link", {
      name: "Open Specimen Studio Opens in a new tab",
      exact: true,
    });
    const mutations: string[] = [];
    page.on("request", (request) => {
      if (
        new URL(request.url()).pathname.startsWith("/api/") &&
        request.method() !== "GET"
      )
        mutations.push(request.method());
    });
    await page.evaluate(() => {
      localStorage.setItem(
        "studio-private-fixture",
        "local-only-workspace-data",
      );
      sessionStorage.setItem(
        "studio-private-fixture",
        "local-only-session-data",
      );
    });
    const sourceUrl = page.url();

    for (const tab of ["Connections", "Playground"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      await expect(panel).toHaveCount(1);
      await expect(panel).toBeVisible();
      await expect(panel).toContainText(
        "Storage is specific to that browser and site origin.",
      );
      await expect(panel).toContainText(
        "Your workspace data, credentials, and bound gateway connections stay in this console",
      );
      await expect(panel).toContainText(
        "opening Studio does not connect it to your gateway.",
      );
      await expect(link).toHaveAttribute("href", studioUrl.slice(0, -1));
      await expect(link).toHaveAttribute("target", "_blank");
      expect((await link.getAttribute("rel"))?.split(/\s+/)).toEqual(
        expect.arrayContaining(["noopener", "noreferrer"]),
      );
      await page.evaluate(() => document.fonts.ready);
      // Reach the action through the actual tab order, not programmatic focus.
      await page.getByRole("tab", { name: "Traces", exact: true }).focus();
      await page.keyboard.press("Tab");
      await expect(link).toBeFocused();
      expect(
        await link.evaluate((element) => {
          const style = getComputedStyle(element);
          return (
            element.matches(":focus-visible") &&
            style.outlineStyle !== "none" &&
            parseFloat(style.outlineWidth) >= 2
          );
        }),
      ).toBe(true);
      const geometry = await panel.evaluate((element) => {
        const action = element.querySelector("a")!;
        const description = element.firstElementChild!;
        const p = element.getBoundingClientRect(),
          a = action.getBoundingClientRect(),
          d = description.getBoundingClientRect();
        return {
          fits:
            p.left >= 0 &&
            p.right <= innerWidth + 1 &&
            a.left >= p.left &&
            a.right <= p.right &&
            a.bottom <= p.bottom,
          noClipping: [element, action, description].every(
            (node) =>
              node.scrollWidth <= node.clientWidth + 1 &&
              node.scrollHeight <= node.clientHeight + 1,
          ),
          stacked: a.top >= d.bottom,
          sideBySide: a.left >= d.right,
          actionHeight: a.height,
          fullWidth: Math.abs(a.width - d.width) <= 1,
        };
      });
      expect(geometry.fits).toBe(true);
      expect(geometry.noClipping).toBe(true);
      expect(geometry.actionHeight).toBeGreaterThanOrEqual(48);
      expect(width <= 1000 ? geometry.stacked : geometry.sideBySide).toBe(true);
      if (width === 390) expect(geometry.fullWidth).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`studio-${tab.toLowerCase()}-${width}.png`),
        animations: "disabled",
      });

      const popupPromise = page.waitForEvent("popup");
      await page.keyboard.press("Enter");
      const popup = await popupPromise;
      await popup.waitForLoadState("domcontentloaded");
      await expect(popup).toHaveURL(studioUrl);
      expect(
        await popup.evaluate(() => ({
          opener: window.opener === null,
          referrer: document.referrer,
          local: localStorage.getItem("studio-private-fixture"),
          session: sessionStorage.getItem("studio-private-fixture"),
        })),
      ).toEqual({ opener: true, referrer: "", local: null, session: null });
      await popup.close();
      await expect(page).toHaveURL(sourceUrl);
      expect(
        await page.evaluate(() => [
          localStorage.getItem("studio-private-fixture"),
          sessionStorage.getItem("studio-private-fixture"),
        ]),
      ).toEqual(["local-only-workspace-data", "local-only-session-data"]);
    }
    expect(outbound).toHaveLength(2);
    for (const request of outbound) {
      expect(request.url).toBe(studioUrl);
      expect(request.method).toBe("GET");
      expect(request.body).toBeNull();
      for (const header of ["referer", "authorization", "cookie"])
        expect(request.headers[header]).toBeUndefined();
    }
    for (const tab of ["Api keys", "Usage", "Traces"]) {
      await page.getByRole("tab", { name: tab, exact: true }).click();
      await expect(panel).toHaveCount(0);
    }
    expect(mutations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
