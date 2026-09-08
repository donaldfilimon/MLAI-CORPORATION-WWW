import { test, expect } from "@playwright/test";

test("mobile auth preserves readable headings and linked signup requirements", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sign-up");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Intelligence, with a place to work.",
  );
  await expect(
    page.getByLabel("Email", { exact: true }),
  ).toHaveAccessibleDescription(
    "Email is a local account identifier and is not automatically verified.",
  );
  await expect(
    page.getByLabel("Password", { exact: true }),
  ).toHaveAccessibleDescription("Use at least 12 characters.");
  await expect(
    page.getByRole("form", { name: "Create your workspace" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.goto("/sign-in");
  await expect(page.getByRole("form", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
});
