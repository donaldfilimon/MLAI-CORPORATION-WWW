import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
test("customer request, assigned staff, milestones, replacement and exact-version review", async ({
  browser,
}) => {
  test.setTimeout(90000);
  const customerContext = await browser.newContext(),
    staffContext = await browser.newContext();
  const base = "http://127.0.0.1:3101",
    suffix = Date.now(),
    staffEmail = `staff-${suffix}@example.test`;
  for (const [context, email, name] of [
    [customerContext, `customer-${suffix}@example.test`, "Customer fixture"],
    [staffContext, staffEmail, "Staff fixture"],
  ] as const) {
    const response = await context.request.post(
      `${base}/api/auth/sign-up/email`,
      {
        headers: { Origin: base },
        data: { email, name, password: randomBytes(24).toString("base64url") },
      },
    );
    expect(response.status()).toBe(200);
  }
  execFileSync(
    process.execPath,
    ["--import", "tsx", "scripts/account.ts", "staff", staffEmail],
    { env: { ...process.env, MLAI_DATA_DIR: ".data-e2e", APP_URL: base } },
  );
  const customer = await customerContext.newPage(),
    staff = await staffContext.newPage();
  await customer.goto(`${base}/app/portal`);
  await customer.getByRole("button", { name: "New service request" }).click();
  await customer
    .getByLabel("Title", { exact: true })
    .fill(`Architecture review ${suffix}`);
  await customer
    .getByLabel("Goals and context")
    .fill("Review the local system and provide a diagram.");
  await customer
    .getByRole("button", { name: "Submit request", exact: true })
    .click();
  await expect(
    customer
      .getByText(`Architecture review ${suffix}`, { exact: true })
      .first(),
  ).toBeVisible();
  const request = await (
    await customerContext.request.get(`${base}/api/v1/engagements`)
  ).json();
  const engagement = request.find(
    (e: { title: string }) => e.title === `Architecture review ${suffix}`,
  );
  await staff.goto(`${base}/app/staff`);
  await staff.getByRole("button", { name: "Claim request" }).last().click();
  await staff.goto(`${base}/app/staff?engagement=${engagement.id}`);
  await staff.getByLabel("Milestone title").fill("Architecture delivered");
  await staff.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    staff.getByText("Architecture delivered", { exact: true }),
  ).toBeVisible();
  await staff.getByLabel("Upload deliverable", { exact: true }).setInputFiles({
    name: "architecture.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "# Architecture\nReviewed local interfaces, version one.",
    ),
  });
  await expect(staff.getByText(/Version 1/)).toBeVisible();
  await customer.goto(`${base}/app/portal?engagement=${engagement.id}`);
  await customer.getByRole("button", { name: "Review", exact: true }).click();
  await customer
    .getByLabel("Review comments")
    .fill("Please add the source diagram.");
  await customer
    .getByRole("combobox", { name: "Decision", exact: true })
    .selectOption("changes_requested");
  await customer.getByRole("button", { name: "Record review" }).click();
  await expect(
    customer.locator(".deliverable").getByText(/Version 1.*changes requested/),
  ).toBeVisible();
  await staff.reload();
  await expect(
    staff.getByText("Please add the source diagram.", { exact: true }),
  ).toBeVisible();
  await staff.getByLabel("Upload deliverable", { exact: true }).setInputFiles({
    name: "architecture.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "# Architecture\nReviewed local interfaces with diagram, version two.",
    ),
  });
  await expect(staff.getByText(/Version 2.*Awaiting review/)).toBeVisible();
  await customer.reload();
  await customer
    .getByRole("button", { name: "Review", exact: true })
    .first()
    .click();
  await customer.getByRole("button", { name: "Record review" }).click();
  await expect(
    customer.locator(".deliverable").getByText(/Version 2.*approved/),
  ).toBeVisible();
  await customer
    .getByLabel("Add engagement comment")
    .fill("Thank you. The reviewed version is approved.");
  await customer
    .getByRole("button", { name: "Add comment", exact: true })
    .click();
  await expect(
    customer.getByText("Thank you. The reviewed version is approved.", {
      exact: true,
    }),
  ).toBeVisible();
  mkdirSync("docs/verification/screenshots", { recursive: true });
  await customer.setViewportSize({ width: 1440, height: 960 });
  await customer.screenshot({
    path: "docs/verification/screenshots/customer-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  await staff.reload();
  await expect(
    staff.getByText("Please add the source diagram.", { exact: true }),
  ).toBeVisible();
  await staff.setViewportSize({ width: 1440, height: 960 });
  await staff.screenshot({
    path: "docs/verification/screenshots/staff-1440.png",
    fullPage: true,
    animations: "disabled",
  });
  const notifications = await (
    await staffContext.request.get(`${base}/api/v1/notifications`)
  ).json();
  expect(notifications.length).toBeGreaterThan(0);
  await customerContext.close();
  await staffContext.close();
});
