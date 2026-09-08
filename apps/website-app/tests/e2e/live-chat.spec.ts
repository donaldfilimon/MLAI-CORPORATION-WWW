import { test, expect } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { signUpFixture } from "./support/account";
test("real local chat, source inspector, streaming cancellation and conversation controls", async ({
  baseURL,
  page,
}, testInfo) => {
  test.skip(
    !process.env.MLAI_E2E_MODEL_URL,
    "Set MLAI_E2E_MODEL_URL to an explicitly selected local model endpoint.",
  );
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1440, height: 960 });
  const base = baseURL!;
  await signUpFixture(page.request, base, {
    name: "Local chat fixture",
    email: `chat-${Date.now()}@example.test`,
    password: randomBytes(24).toString("base64url"),
  });
  await page.goto("/app");
  await expect(page.getByText("0 of 4 steps complete")).toBeVisible();
  await page.goto("/app/projects");
  await page.getByLabel("Project name").fill("Grounded source journey");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Grounded source journey" }),
  ).toBeVisible();
  await page.goto("/app/settings");
  const provider = page.getByRole("combobox", {
    name: "Model provider",
    exact: true,
  });
  await expect(provider.locator("option").nth(1)).toBeAttached();
  await provider.selectOption(
    (await provider.locator("option").nth(1).getAttribute("value"))!,
  );
  await page.getByRole("button", { name: "Save workspace settings" }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();
  await page.getByRole("button", { name: "Test selected provider" }).click();
  await expect(
    page.getByText(/Last test at.*Connection reachable/),
  ).toBeVisible({ timeout: 30000 });
  await page.goto("/app");
  await expect(page.getByText("2 of 4 steps complete")).toBeVisible();
  await page.goto("/app/documents");
  const projects = page.getByRole("combobox", {
    name: "Filter documents by project",
  });
  await projects.selectOption({ label: "Grounded source journey" });
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
  await expect(page.getByText(/Question scoped to/)).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Conversation project" }),
  ).not.toHaveValue("");
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
  const downloadPromise = page.waitForEvent("download");
  await page
    .locator(".source-inspector")
    .getByRole("link", { name: "Download original", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("architecture.md");
  expect(await readFile((await download.path())!, "utf8")).toContain(
    "The deadline is Friday.",
  );
  await expect(page.locator(".source-inspector")).toContainText("Friday");
  await expect(page.locator(".citation[aria-pressed=true]")).toHaveCount(1);
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
  await page.goto("/app");
  await expect(page.getByText("4 of 4 steps complete")).toBeVisible();
  await page.reload();
  await expect(page.getByText("4 of 4 steps complete")).toBeVisible();
  await page.goto("/app/abbey");
  let cancellationRequests = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname.startsWith("/api/v1/chat/")
    )
      cancellationRequests++;
  });
  const generationRequest = page.waitForRequest(
    (request) =>
      request.method() === "POST" &&
      new URL(request.url()).pathname.startsWith("/api/v1/chat/"),
  );
  await page
    .locator("textarea")
    .fill("Write a long detailed comparison of thirty graph algorithms.");
  await page.getByRole("button", { name: "Send message" }).click();
  await generationRequest;
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Stop generation" }).click();
  await expect(
    page.getByRole("button", { name: "Stop generation" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Message Abbey" }),
  ).toHaveValue("Write a long detailed comparison of thirty graph algorithms.");
  expect(cancellationRequests).toBe(1);
});
