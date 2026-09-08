import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { signUpFixture } from "./support/account";
test("profile, password, session revocation and keyboard drawer", async ({
  baseURL,
  browser,
  page,
}) => {
  const base = baseURL!,
    email = `account-${Date.now()}@example.test`,
    password = randomBytes(24).toString("base64url"),
    next = randomBytes(24).toString("base64url");
  await signUpFixture(page.request, base, {
    name: "Account fixture",
    email,
    password,
  });
  const second = await browser.newContext();
  expect(
    (
      await second.request.post(`${base}/api/auth/sign-in/email`, {
        headers: { Origin: base },
        data: { email, password },
      })
    ).ok(),
  ).toBe(true);
  await page.goto("/app/settings");
  await page.getByLabel("Name", { exact: true }).fill("Updated reviewer");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  await expect(page.locator(".sidebar-bottom")).toContainText(
    "Updated reviewer",
  );
  await page.getByLabel("Current password", { exact: true }).fill(password);
  await page.getByLabel("New password", { exact: true }).fill(next);
  await page
    .getByRole("button", { name: "Change password", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Changes saved.");
  expect((await second.request.get(`${base}/api/v1/bootstrap`)).status()).toBe(
    401,
  );
  await second.close();
  await page.getByRole("button", { name: "Show sessions" }).click();
  await expect(
    page.getByRole("button", { name: "Revoke", exact: true }),
  ).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator(".app-sidebar")).toHaveAttribute(
    "aria-modal",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".app-sidebar")).not.toHaveClass(/open/);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(base + "/");
  await page.goto("/app");
  await expect(page).toHaveURL(/sign-in/);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(next);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
});
