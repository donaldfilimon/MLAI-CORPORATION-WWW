import { test, expect, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { createServer, type Server } from "node:http";
import type { AgentRunDetail } from "../../src/lib/agent-contracts";
import type { Conversation } from "../../src/lib/types";

// This fixture replaces only the configured model endpoint. Every application
// request, approval, persisted result and worker operation uses the real backend.
const fixtureUrl = "http://127.0.0.1:3112/v1";
const responses: unknown[] = [];
let provider: Server | undefined;
let releaseInterpretation: (() => void) | undefined;

test.beforeAll(async () => {
  if (process.env.MLAI_E2E_MODEL_URL !== fixtureUrl) return;
  provider = createServer(async (req, res) => {
    if (req.url === "/v1/models") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ data: [{ id: "agent-browser-fixture" }] }));
      return;
    }
    let body = "";
    for await (const chunk of req) body += chunk.toString();
    const input = JSON.parse(body) as {
      messages: { role: string; content: string }[];
    };
    // Route the actual worker's two model operations without logging their input.
    const isAgent = input.messages.some(
      (message) =>
        message.role === "system" &&
        message.content.includes("Return exactly one JSON object"),
    );
    if (!isAgent)
      await new Promise<void>((resolve) => {
        releaseInterpretation = resolve;
      });
    const next = isAgent
      ? responses.shift()
      : "The architecture review deadline is Friday [1].";
    if (!next) {
      res.writeHead(503).end("No fixture response is queued.");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.end(
      `data: ${JSON.stringify({ choices: [{ delta: { content: typeof next === "string" ? next : JSON.stringify(next) } }] })}\n\ndata: [DONE]\n\n`,
    );
  });
  await new Promise<void>((resolve, reject) => {
    provider!.once("error", reject);
    provider!.listen(3112, "127.0.0.1", resolve);
  });
});

test.afterAll(async () => {
  releaseInterpretation?.();
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

test("persistent reviewed agent actions, source focus and queued interpretation", async ({
  page,
  browser,
}, testInfo) => {
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
    buffer: Buffer.from(
      "# Architecture review\n\nMorgan owns the architecture review. The deadline is Friday.",
    ),
  });
  await expect(page.locator(".document-paper")).toContainText("Friday", {
    timeout: 90000,
  });
  await page
    .getByRole("link", { name: /Ask Abbey about this document/ })
    .click();
  const documentId = new URL(page.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Ask", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Agent", exact: true }).click();
  const projectName = `Reviewed architecture ${Date.now()}`;
  responses.push(
    {
      kind: "tool",
      tool: "search_documents",
      input: { query: "architecture review" },
    },
    {
      kind: "tool",
      tool: "create_project",
      input: {
        name: projectName,
        description: "Review the Friday architecture deadline.",
      },
    },
    {
      kind: "answer",
      content:
        "The review deadline is Friday [1]. The approved project was created.",
    },
  );
  await start(
    page,
    "Investigate the architecture review and propose a project.",
  );
  const card = page.getByRole("article", { name: "Review Create project" });
  await expect(card).toContainText(projectName, { timeout: 60000 });
  await expect(card.getByRole("button", { name: "Confirm" })).toBeVisible();
  let projects = await (
    await page.request.get(`${base}/api/v1/projects`)
  ).json();
  expect(
    projects.filter((p: { name: string }) => p.name === projectName),
  ).toHaveLength(0);
  const runUrl = page.url();
  expect(new URL(runUrl).searchParams.get("run")).toBeTruthy();
  const viewer = await browser.newContext();
  const viewerEmail = `agent-viewer-${Date.now()}@example.test`;
  expect(
    (
      await viewer.request.post(`${base}/api/auth/sign-up/email`, {
        headers: { Origin: base },
        data: {
          name: "Agent viewer fixture",
          email: viewerEmail,
          password: randomBytes(24).toString("base64url"),
        },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await page.request.post(`${base}/api/v1/workspaces/members`, {
        headers: { Origin: base },
        data: { email: viewerEmail, role: "viewer" },
      })
    ).ok(),
  ).toBe(true);
  const ownerWorkspace = (
    await (await page.request.get(`${base}/api/v1/bootstrap`)).json()
  ).workspace.id as string;
  await viewer.addInitScript(
    (workspace) => localStorage.setItem("mlai-workspace", workspace),
    ownerWorkspace,
  );
  const viewerPage = await viewer.newPage();
  await viewerPage.goto(runUrl);
  const viewerCard = viewerPage.getByRole("article", {
    name: "Review Create project",
  });
  await expect(viewerCard).toContainText(projectName);
  await expect(viewerCard.getByRole("button", { name: "Confirm" })).toHaveCount(
    0,
  );
  await expect(viewerCard.getByRole("button", { name: "Reject" })).toHaveCount(
    0,
  );
  await expect(viewerCard).toContainText("Only the requesting member");
  await viewer.close();
  await page.reload();
  await expect(card).toContainText(projectName);
  const citation = page
    .getByRole("button", { name: /agent-review.md/ })
    .first();
  await citation.click();
  await page.setViewportSize({ width: 768, height: 960 });
  await expect(
    page.getByLabel("Agent source inspector", { exact: true }),
  ).toHaveAttribute("aria-modal", "true");
  await expect(
    page.getByRole("button", { name: "Close agent source inspector" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(citation).toBeFocused();
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
      await page.keyboard.press("Shift+Tab");
      await expect(
        inspector.getByRole("link", { name: "Open document" }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
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
      path: testInfo.outputPath(`agent-source-${width}.png`),
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
    await page.screenshot({
      path: testInfo.outputPath(`agent-review-${width}.png`),
      animations: "disabled",
    });
  }
  await card.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByText(
      "The review deadline is Friday [1]. The approved project was created.",
      { exact: true },
    ),
  ).toBeVisible({ timeout: 60000 });
  await page.reload();
  projects = await (await page.request.get(`${base}/api/v1/projects`)).json();
  expect(
    projects.filter((p: { name: string }) => p.name === projectName),
  ).toHaveLength(1);
  await expect(card.getByRole("button", { name: "Confirm" })).toHaveCount(0);

  const rejectedName = `Rejected architecture ${Date.now()}`;
  responses.push({
    kind: "tool",
    tool: "create_project",
    input: {
      name: rejectedName,
      description: "This proposal will be rejected.",
    },
  });
  await start(page, "Propose another architecture project for review.");
  await expect(card).toContainText(rejectedName, { timeout: 60000 });
  await card.getByRole("button", { name: "Reject", exact: true }).click();
  await expect(card).toContainText("Rejected");
  await page.reload();
  await expect(card).toContainText("Rejected");
  projects = await (await page.request.get(`${base}/api/v1/projects`)).json();
  expect(
    projects.filter((p: { name: string }) => p.name === rejectedName),
  ).toHaveLength(0);

  responses.push(
    {
      kind: "tool",
      tool: "interpret_documents",
      input: { document_id: documentId, kind: "summary" },
    },
    {
      kind: "answer",
      content: "The approved interpretation has been queued for processing.",
    },
  );
  await start(page, "Propose a summary of the architecture review source.");
  const interpretation = page.getByRole("article", {
    name: "Review Interpret documents",
  });
  await expect(interpretation).toContainText("summary", { timeout: 60000 });
  await interpretation
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await expect(page.getByText(/Interpretation job/).first()).toBeVisible({
    timeout: 60000,
  });
  const runId = new URL(page.url()).searchParams.get("run");
  const run = (await (
    await page.request.get(`${base}/api/v1/agent/runs/${runId}`)
  ).json()) as AgentRunDetail;
  const job = run.results.find((r) => r.kind === "write" && r.resource_id);
  expect(job?.resource_id).toBeTruthy();
  expect(["queued", "running"]).toContain(job?.status);
  await expect(
    page.getByText(job!.resource_id!, { exact: false }).first(),
  ).toBeVisible();
  await expect.poll(() => !!releaseInterpretation).toBe(true);
  releaseInterpretation?.();
  await expect
    .poll(
      async () => {
        const updated = (await (
          await page.request.get(`${base}/api/v1/agent/runs/${runId}`)
        ).json()) as AgentRunDetail;
        return updated.results.find((result) => result.id === job!.id)?.status;
      },
      { timeout: 60000 },
    )
    .toBe("complete");
  responses.push({
    kind: "tool",
    tool: "create_project",
    input: { name: `Cancelled architecture ${Date.now()}` },
  });
  await start(page, "Propose one last project, then wait for review.");
  await expect(card.getByRole("button", { name: "Confirm" })).toBeVisible({
    timeout: 60000,
  });
  await page.getByRole("button", { name: "Cancel run", exact: true }).click();
  await expect(card).toContainText("Cancelled");
  await page.reload();
  await expect(card).toContainText("Cancelled");
  await expect(card.getByRole("button", { name: "Confirm" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("late conversation responses cannot replace the selected run history", async ({
  page,
}) => {
  test.skip(
    process.env.MLAI_E2E_MODEL_URL !== fixtureUrl,
    "Use the coordinated agent browser fixture server.",
  );
  test.setTimeout(90000);
  const base = "http://127.0.0.1:3101";
  expect(
    (
      await page.request.post(`${base}/api/auth/sign-up/email`, {
        headers: { Origin: base },
        data: {
          name: "Agent selection fixture",
          email: `agent-selection-${Date.now()}@example.test`,
          password: randomBytes(24).toString("base64url"),
        },
      })
    ).ok(),
  ).toBe(true);
  const saved: {
    conversation: string;
    run: string;
    title: string;
    objective: string;
  }[] = [];
  for (const label of ["Earlier", "Current"]) {
    const conversation = (await (
      await page.request.post(`${base}/api/v1/conversations`, {
        headers: { Origin: base },
        data: { title: `${label} conversation` },
      })
    ).json()) as Conversation;
    responses.push({
      kind: "answer",
      content: `${label} investigation answer.`,
    });
    const run = (await (
      await page.request.post(`${base}/api/v1/agent/runs`, {
        headers: { Origin: base },
        data: {
          conversation_id: conversation.id,
          objective: `${label} saved objective`,
        },
      })
    ).json()) as AgentRunDetail;
    expect(run.id).toBeTruthy();
    await expect
      .poll(
        async () =>
          (
            await (
              await page.request.get(`${base}/api/v1/agent/runs/${run.id}`)
            ).json()
          ).status,
        { timeout: 60000 },
      )
      .toBe("completed");
    saved.push({
      conversation: conversation.id,
      run: run.id,
      title: `${label} conversation`,
      objective: `${label} saved objective`,
    });
  }
  let received = false;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    `**/api/v1/conversations/${saved[0].conversation}?*`,
    async (route) => {
      const response = await route.fetch();
      received = true;
      await gate;
      await route.fulfill({ response });
    },
  );
  try {
    await page.goto(
      `/app/abbey?mode=agent&conversation=${saved[0].conversation}&run=${saved[0].run}`,
    );
    await expect.poll(() => received).toBe(true);
    await page
      .getByRole("button", { name: saved[1].title, exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: saved[1].objective }),
    ).toBeVisible();
    const delayedResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
        `/api/v1/conversations/${saved[0].conversation}`,
    );
    release!();
    await (await delayedResponse).finished();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(page.getByLabel("Saved agent runs")).toHaveValue(saved[1].run);
    await expect(
      page.getByLabel("Saved agent runs").locator("option"),
    ).toHaveCount(1);
    await expect(page.getByLabel("Saved agent runs")).toContainText(
      saved[1].objective,
    );
    await expect(
      page.getByRole("heading", { name: saved[0].objective }),
    ).toHaveCount(0);
  } finally {
    release?.();
    await page.unrouteAll({ behavior: "wait" });
  }
});
