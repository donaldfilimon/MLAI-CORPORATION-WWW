import { expect, test } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { signUpFixture } from "./support/account";

const modelUrl = process.env.MLAI_E2E_MODEL_URL;
const modelId = process.env.MLAI_E2E_MODEL_ID;
const localModel = (() => {
  if (!modelUrl || !modelId) return false;
  try {
    return ["127.0.0.1", "localhost", "[::1]"].includes(
      new URL(modelUrl).hostname,
    );
  } catch {
    return false;
  }
})();

test("real local Agent investigation, confirmation, recovery and cancellation", async ({
  page,
}, testInfo) => {
  test.skip(
    !localModel,
    "Set MLAI_E2E_MODEL_URL to an explicitly selected loopback model endpoint.",
  );
  test.setTimeout(360_000);
  const base = "http://127.0.0.1:3101";
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 500)
      errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });

  await page.setViewportSize({ width: 1440, height: 960 });
  await signUpFixture(page.request, base, {
    name: "Live Agent acceptance",
    email: `agent-live-${Date.now()}@example.test`,
    password: randomBytes(24).toString("base64url"),
  });
  await page.goto("/app/documents");
  await expect(page).toHaveTitle(/MLAI/);
  await expect(page.locator("body")).toContainText("Documents");
  await expect(page.locator("[data-nextjs-dialog-overlay]")).toHaveCount(0);
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles({
    name: "agent-live-review.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "# Architecture review\n\nMorgan owns the architecture review. The review deadline is Friday.",
    ),
  });
  await expect(page.locator(".document-paper")).toContainText("Friday", {
    timeout: 90_000,
  });
  await page
    .getByRole("link", { name: /Ask Abbey about this document/ })
    .click();
  await expect(page).toHaveURL(/\/app\/abbey\?.*document=/);
  await page.getByRole("button", { name: "Agent", exact: true }).click();

  const investigation =
    "Search the selected source for deadline Friday. Then answer who owns the architecture review and its deadline, citing the source. Use search_documents to obtain evidence before answering.";
  await page.getByLabel("Agent objective").fill(investigation);
  await page.getByRole("button", { name: "Start agent run" }).click();
  await expect(
    page.getByRole("heading", { name: investigation }),
  ).toBeVisible();
  await expect(
    page.getByText(/Morgan.*Friday|Friday.*Morgan/i).first(),
  ).toBeVisible({
    timeout: 120_000,
  });
  const citation = page
    .getByRole("button", { name: /agent-live-review.md/ })
    .first();
  await expect(citation).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await citation.click();
    const inspector = page.getByLabel("Agent source inspector", {
      exact: true,
    });
    await expect(inspector).toContainText("Friday");
    if (width <= 1000) {
      await expect(inspector).toHaveAttribute("role", "dialog");
      await expect(
        page.getByRole("button", { name: "Close agent source inspector" }),
      ).toBeFocused();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`agent-live-source-${width}.png`),
      animations: "disabled",
    });
    if (width <= 1000) {
      await page.keyboard.press("Escape");
      await expect(citation).toBeFocused();
    } else {
      await page
        .getByRole("button", { name: "Close agent source inspector" })
        .click();
    }
  }

  await page.setViewportSize({ width: 1440, height: 960 });
  const projectName = `Live confirmed project ${Date.now()}`;
  const proposal = `Create one project named "${projectName}" with description "Local Agent acceptance". Propose create_project and wait for my confirmation.`;
  await page.getByLabel("Agent objective").fill(proposal);
  await page.getByRole("button", { name: "Start agent run" }).click();
  const card = page.getByRole("article", { name: "Review Create project" });
  await expect(card).toContainText(projectName, { timeout: 120_000 });
  let projects = (await (
    await page.request.get(`${base}/api/v1/projects`)
  ).json()) as { name: string }[];
  expect(
    projects.filter((project) => project.name === projectName),
  ).toHaveLength(0);
  await card.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect
    .poll(
      async () => {
        projects = (await (
          await page.request.get(`${base}/api/v1/projects`)
        ).json()) as { name: string }[];
        return projects.filter((project) => project.name === projectName)
          .length;
      },
      { timeout: 120_000 },
    )
    .toBe(1);
  await expect(card.getByRole("button", { name: "Confirm" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText(projectName).first()).toBeVisible();
  projects = (await (
    await page.request.get(`${base}/api/v1/projects`)
  ).json()) as { name: string }[];
  expect(
    projects.filter((project) => project.name === projectName),
  ).toHaveLength(1);

  const cancelledName = `Cancelled local project ${Date.now()}`;
  const cancelled = `Create one project named "${cancelledName}" and wait for confirmation.`;
  await page.getByLabel("Agent objective").fill(cancelled);
  await page.getByRole("button", { name: "Start agent run" }).click();
  await expect(page.getByRole("heading", { name: cancelled })).toBeVisible();
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  await expect(
    page.getByText("Cancelled", { exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Cancelled", { exact: true }).first(),
  ).toBeVisible();
  projects = (await (
    await page.request.get(`${base}/api/v1/projects`)
  ).json()) as { name: string }[];
  expect(
    projects.filter((project) => project.name === cancelledName),
  ).toHaveLength(0);
  expect(errors).toEqual([]);
});
