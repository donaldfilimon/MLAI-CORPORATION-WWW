import { test, expect } from "@playwright/test";
import { signUpFixture } from "./support/account";

// Deterministic failure fixtures exercise UI recovery. Live model evidence is a separate gate.
test("new account derives progress and keeps a question through provider failure and retry", async ({
  page,
  baseURL,
}) => {
  await signUpFixture(page.request, baseURL!, {
    name: "Journey reviewer",
    email: `journey-${crypto.randomUUID()}@example.test`,
    password: "Local-test-password!2026",
  });
  let probes = 0;
  await page.route("**/api/v1/connections/*/probe?*", async (route) => {
    probes++;
    await route.fulfill({
      json: { connected: false, reason: "Fixture provider offline" },
    });
  });
  await page.goto("/app");
  await expect(page.getByText("0 of 4 steps complete")).toBeVisible();
  await page.goto("/app/projects");
  await page.getByLabel("Project name").fill("Evidence journey");
  await page
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Evidence journey" }),
  ).toBeVisible();
  await page.goto("/app/settings");
  expect(probes).toBe(0);
  const provider = page.getByRole("combobox", {
    name: "Model provider",
    exact: true,
  });
  await expect(provider.locator("option").nth(1)).toBeAttached();
  const localId = await provider.locator("option").nth(1).getAttribute("value");
  await provider.selectOption(localId!);
  await page.getByRole("button", { name: "Save workspace settings" }).click();
  await expect(page.getByText("Changes saved.")).toBeVisible();
  expect(probes).toBe(0);
  await page.getByRole("button", { name: "Test selected provider" }).click();
  await expect(
    page.getByText(/Last test at.*Fixture provider offline/),
  ).toBeVisible();
  expect(probes).toBe(1);
  await page.goto("/app");
  await expect(page.getByText("2 of 4 steps complete")).toBeVisible();
  await page.goto("/app/abbey");
  let attempts = 0;
  await page.route("**/api/v1/chat/*?*", async (route) => {
    attempts++;
    if (attempts === 1) {
      await route.fulfill({
        status: 503,
        json: { error: { message: "Fixture provider offline" } },
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: 'event: error\ndata: {"code":"model_unavailable","message":"Fixture provider offline"}\n\n',
    });
  });
  const question = "Who owns the architecture review?";
  await page.getByRole("textbox", { name: "Message Abbey" }).fill(question);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".composer-wrap").getByRole("alert")).toContainText(
    "Fixture provider offline",
  );
  await expect(
    page.getByRole("textbox", { name: "Message Abbey" }),
  ).toHaveValue(question);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect.poll(() => attempts).toBe(2);
  await expect(
    page.getByRole("textbox", { name: "Message Abbey" }),
  ).toHaveValue(question);
  await page.goto("/app");
  await expect(page.getByText("2 of 4 steps complete")).toBeVisible();
});

test("processing retry retains source and citation inspector returns focus at every width", async ({
  page,
  baseURL,
}, testInfo) => {
  await signUpFixture(page.request, baseURL!, {
    name: "Source reviewer",
    email: `source-${crypto.randomUUID()}@example.test`,
    password: "Local-test-password!2026",
  });
  const citation = {
    id: "fixture-chunk",
    documentId: "fixture-document",
    number: 7,
    name: "review.md",
    content: "Untrusted model excerpt",
    location: { page: 3 },
  };
  let status = "failed";
  let retries = 0;
  const doc = () => ({
    id: citation.documentId,
    name: citation.name,
    extension: "md",
    size: 120,
    status,
    progress: "Fixture processing failure",
    warnings: [],
    metadata: {},
    insights: [
      {
        id: "insight",
        kind: "comparison",
        content: "Compare this source [7].",
        provider: "Fixture",
        created_at: 1,
        citations: JSON.stringify([
          {
            ...citation,
            documentId: "comparison-document",
            name: "comparison.md",
          },
        ]),
      },
    ],
    project_id: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...(status === "ready"
      ? {
          extraction: {
            text: "Morgan owns the review.",
            chunks: [
              { content: "Morgan owns the review.", location: { page: 3 } },
            ],
            tables: [],
            outline: [],
          },
        }
      : {}),
  });
  await page.route("**/api/v1/documents?*", (route) =>
    route.fulfill({ json: [doc()] }),
  );
  await page.route("**/api/v1/documents/fixture-document?*", (route) =>
    route.fulfill({ json: doc() }),
  );
  await page.route(
    "**/api/v1/documents/fixture-document/reprocess?*",
    async (route) => {
      retries++;
      status = "ready";
      await route.fulfill({ json: { ok: true } });
    },
  );
  await page.goto("/app/documents?document=fixture-document");
  await expect(
    page.getByText(/Your uploaded original is retained/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download original", exact: true }),
  ).toHaveAttribute("href", /documents\/fixture-document\/download/);
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.getByText(/Your source is ready/)).toBeVisible();
  expect(retries).toBe(1);
  await page
    .getByRole("link", { name: "Ask Abbey about this document" })
    .click();
  await expect(page.getByText(/Question scoped to/)).toBeVisible();
  await page.route("**/api/v1/conversations/fixture-conversation?*", (route) =>
    route.fulfill({
      json: {
        id: "fixture-conversation",
        project_id: null,
        title: "Fixture answer",
        messages: [
          {
            id: "assistant",
            role: "assistant",
            content: "Morgan owns the review [7].",
            citations: [citation],
            status: "complete",
            created_at: Date.now(),
          },
        ],
      },
    }),
  );
  await page.route("**/api/v1/documents/fixture-document/source?*", (route) =>
    route.fulfill({
      json: {
        id: citation.id,
        content: "Morgan owns the review.",
        location: { page: 3 },
      },
    }),
  );
  await page.goto("/app/abbey?conversation=fixture-conversation");
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    const trigger = page.getByRole("button", { name: /\[7\] review.md/ });
    await trigger.click();
    const inspector = page.getByLabel("Source inspector", { exact: true });
    await expect(
      inspector.getByText("Morgan owns the review.", { exact: true }),
    ).toBeVisible();
    await expect(inspector).not.toContainText("Untrusted model excerpt");
    await expect(inspector).toContainText("not independent verification");
    await expect(
      inspector.getByRole("link", { name: "Download original" }),
    ).toHaveAttribute(
      "href",
      /documents\/fixture-document\/download\?workspace=/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(`citation-${width}.png`),
      animations: "disabled",
    });
    await inspector
      .getByRole("button", { name: "Close source inspector" })
      .click();
    await expect(trigger).toBeFocused();
  }
  await page.route("**/api/v1/documents/comparison-document?*", (route) =>
    route.fulfill({
      json: { ...doc(), id: "comparison-document", name: "comparison.md" },
    }),
  );
  await page.route(
    "**/api/v1/documents/comparison-document/source?*",
    (route) =>
      route.fulfill({
        json: {
          id: citation.id,
          content: "Comparison source excerpt.",
          location: { page: 3 },
        },
      }),
  );
  await page.goto("/app/documents?document=fixture-document");
  await page.getByRole("tab", { name: "Insights", exact: true }).click();
  await page.getByRole("button", { name: /\[7\] comparison.md/ }).click();
  const inspector = page.getByLabel("Source inspector", { exact: true });
  await expect(inspector).toContainText("Comparison source excerpt.");
  await inspector
    .getByRole("link", { name: "Open document", exact: true })
    .click();
  await expect(inspector).not.toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Preview", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page
      .getByLabel("Document inspector")
      .getByRole("heading", { name: "comparison.md", exact: true })
      .first(),
  ).toBeVisible();
  await expect(page.locator(".focused-source")).toContainText(
    "Comparison source excerpt.",
  );
});
