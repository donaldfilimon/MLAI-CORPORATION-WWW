import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
test("real local chat, source inspector, streaming cancellation and conversation controls", async ({
  baseURL,
  page,
}, testInfo) => {
  test.skip(
    !process.env.MLAI_E2E_MODEL_URL,
    "Set MLAI_E2E_MODEL_URL to an explicitly selected local model endpoint.",
  );
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1440, height: 960 });
  const base = baseURL!;
  const response = await page.request.post(`${base}/api/auth/sign-up/email`, {
    headers: { Origin: base },
    data: {
      name: "Local chat fixture",
      email: `chat-${Date.now()}@example.test`,
      password: randomBytes(24).toString("base64url"),
    },
  });
  expect(response.ok()).toBe(true);
  await page.goto("/app/documents");
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles({
    name: "architecture.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "# Review notes\n\nMorgan owns the architecture review. The deadline is Friday. Every workspace keeps its documents private.",
    ),
  });
  await expect(page.locator(".document-paper")).toContainText("Friday", {
    timeout: 90000,
  });
  await page
    .getByRole("link", { name: /Ask Abbey about this document/ })
    .click();
  await page
    .locator("textarea")
    .fill(
      "When is the architecture review deadline? Cite the provided source number.",
    );
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.locator(".chat-message.assistant .message-body"),
  ).toContainText("Friday", { timeout: 60000 });
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).not.toBeVisible({ timeout: 60000 });
  await page.locator(".citations button").first().click();
  await expect(page.locator(".source-inspector")).toContainText("Friday");
  await page.screenshot({
    path: testInfo.outputPath("abbey-grounded-1440.png"),
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 960 });
    await expect(page.locator(".source-inspector")).toContainText("Friday");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`abbey-grounded-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.getByRole("link", { name: "Open document" }).click();
  await expect(page.locator(".focused-source")).toContainText("Friday");
  await page.goto("/app/abbey");
  await page
    .locator("textarea")
    .fill("Write a long detailed comparison of thirty graph algorithms.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).not.toBeVisible();
});
