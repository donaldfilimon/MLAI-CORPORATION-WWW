import { test, expect, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AgentRunDetail } from "../../src/lib/agent-contracts";

// This fixture replaces only the configured model endpoint. Every application
// request, approval, persisted result and worker operation uses the real backend.
const fixtureUrl = "http://127.0.0.1:3112/v1";
const responses: unknown[] = [];
let provider: Server | undefined;

test.beforeAll(async () => {
  if (process.env.MLAI_E2E_MODEL_URL !== fixtureUrl) return;
  provider = createServer(async (req, res) => {
    if (req.url === "/v1/models") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ data: [{ id: "agent-browser-fixture" }] }));
      return;
    }
    for await (const _chunk of req) {
      // Consume the request without recording prompts or document content.
    }
    const next = responses.shift();
    if (!next) {
      res.writeHead(503).end("No fixture response is queued.");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.end(
      `data: ${JSON.stringify({ choices: [{ delta: { content: JSON.stringify(next) } }] })}\n\ndata: [DONE]\n\n`,
    );
  });
  await new Promise<void>((resolve, reject) => {
    provider!.once("error", reject);
    provider!.listen(3112, "127.0.0.1", resolve);
  });
});

test.afterAll(async () => {
  if (provider)
    await new Promise<void>((resolve, reject) =>
      provider!.close((error) => (error ? reject(error) : resolve())),
    );
});

async function start(page: Page, objective: string) {
  await page.getByLabel("Agent objective").fill(objective);
  await page.getByRole("button", { name: "Start agent run" }).click();
  await expect(page.getByRole("heading", { name: objective })).toBeVisible();
}

test("persistent reviewed agent actions, source focus and queued interpretation", async ({ page }, testInfo) => {
  test.skip(
    process.env.MLAI_E2E_MODEL_URL !== fixtureUrl,
    "Start the coordinated 3101 server with MLAI_E2E_MODEL_URL=http://127.0.0.1:3112/v1 and MLAI_E2E_MODEL_ID=agent-browser-fixture.",
  );
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  const base = "http://127.0.0.1:3101";
  const account = await page.request.post(`${base}/api/auth/sign-up/email`, {
    headers: { Origin: base },
    data: {
      name: "Agent browser fixture",
      email: `agent-${Date.now()}@example.test`,
      password: randomBytes(24).toString("base64url"),
    },
  });
  expect(account.ok()).toBe(true);
  await page.goto("/app/documents");
  await page.getByLabel("Upload documents", { exact: true }).setInputFiles({
    name: "agent-review.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Architecture review\n\nMorgan owns the architecture review. The deadline is Friday."),
  });
  await expect(page.locator(".document-paper")).toContainText("Friday", { timeout: 90000 });
  const documentId = new URL(page.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();
  await page.getByRole("link", { name: /Ask Abbey about this document/ }).click();
  await expect(page.getByRole("button", { name: "Ask", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Agent", exact: true }).click();
  const projectName = `Reviewed architecture ${Date.now()}`;
  responses.push(
    { kind: "tool", tool: "search_documents", input: { query: "architecture review" } },
    { kind: "tool", tool: "create_project", input: { name: projectName, description: "Review the Friday architecture deadline." } },
    { kind: "answer", content: "The review deadline is Friday [1]. The approved project was created." },
  );
  await start(page, "Investigate the architecture review and propose a project.");
  const card = page.getByRole("article", { name: "Review Create project" });
  await expect(card).toContainText(projectName, { timeout: 60000 });
  await expect(card.getByRole("button", { name: "Confirm" })).toBeVisible();
  let projects = await (await page.request.get(`${base}/api/v1/projects`)).json();
  expect(projects.filter((p: { name: string }) => p.name === projectName)).toHaveLength(0);
  const runUrl = page.url();
  expect(new URL(runUrl).searchParams.get("run")).toBeTruthy();
  await page.reload();
  await expect(card).toContainText(projectName);
  const citation = page.getByRole("button", { name: /agent-review.md/ }).first();
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await citation.click();
    const inspector = page.getByLabel("Agent source inspector", { exact: true });
    await expect(inspector).toContainText("Friday");
    if (width <= 1000) {
      await expect(inspector).toHaveAttribute("role", "dialog");
      await expect(page.getByRole("button", { name: "Close agent source inspector" })).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(inspector.getByRole("link", { name: "Open document" })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Close agent source inspector" })).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`agent-source-${width}.png`), animations: "disabled" });
    if (width <= 1000) {
      await page.keyboard.press("Escape");
      await expect(citation).toBeFocused();
    } else {
      await page.getByRole("button", { name: "Close agent source inspector" }).click();
    }
    await page.screenshot({ path: testInfo.outputPath(`agent-review-${width}.png`), animations: "disabled" });
  }
  await card.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByText("The review deadline is Friday [1]. The approved project was created.", { exact: true })).toBeVisible({ timeout: 60000 });
  await page.reload();
  projects = await (await page.request.get(`${base}/api/v1/projects`)).json();
  expect(projects.filter((p: { name: string }) => p.name === projectName)).toHaveLength(1);
  await expect(card.getByRole("button", { name: "Confirm" })).toHaveCount(0);

  const rejectedName = `Rejected architecture ${Date.now()}`;
  responses.push({ kind: "tool", tool: "create_project", input: { name: rejectedName, description: "This proposal will be rejected." } });
  await start(page, "Propose another architecture project for review.");
  await expect(card).toContainText(rejectedName, { timeout: 60000 });
  await card.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(card).toContainText("Rejected");
  await page.reload();
  await expect(card).toContainText("Rejected");
  projects = await (await page.request.get(`${base}/api/v1/projects`)).json();
  expect(projects.filter((p: { name: string }) => p.name === rejectedName)).toHaveLength(0);

  responses.push(
    { kind: "tool", tool: "interpret_documents", input: { document_id: documentId, kind: "summary" } },
    { kind: "answer", content: "The approved interpretation has been queued for processing." },
  );
  await start(page, "Propose a summary of the architecture review source.");
  const interpretation = page.getByRole("article", { name: "Review Interpret documents" });
  await expect(interpretation).toContainText("summary", { timeout: 60000 });
  await interpretation.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByText(/Interpretation job/).first()).toBeVisible({ timeout: 60000 });
  const runId = new URL(page.url()).searchParams.get("run");
  const run = (await (await page.request.get(`${base}/api/v1/agent/runs/${runId}`)).json()) as AgentRunDetail;
  const job = run.results.find((r) => r.kind === "write" && r.resource_id);
  expect(job?.resource_id).toBeTruthy();
  await expect(page.getByText(job!.resource_id!, { exact: false }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
