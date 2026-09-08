import { expect, test } from "@playwright/test";

test("public research keyboard navigation, evidence, and narrow reflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 768, 1440, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/research");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    const search = page.getByRole("searchbox", { name: "Search research" });
    await expect(
      page.getByRole("combobox", { name: /Research area/ }),
    ).toBeVisible();
    await search.focus();
    await page.keyboard.type("memory");
    await expect(search).toHaveValue("memory");
    await page.reload();
    await expect(search).toHaveValue("memory");
    await page
      .getByRole("button", { name: "Clear search", exact: true })
      .click();
    await expect(search).toBeFocused();
    await expect(search).toHaveValue("");
  }
  await page.goto("/research/wdbx-weighted-backtrace-memory-store");
  await expect(
    page.getByRole("heading", { name: "Publication downloads" }),
  ).toBeVisible();
  const download = page.locator("#downloads a").first();
  const url = await download.getAttribute("href");
  expect(url).toMatch(/^\/research\/.*\.pdf$/);
  const response = await page.request.get(url!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/pdf");
  expect(errors).toEqual([]);
});

test("rapid research typing preserves every character and browser history", async ({
  page,
}) => {
  await page.goto("/research?source=keyboard");
  const search = page.getByRole("searchbox", { name: "Search research" });
  await expect(search).toBeEnabled();
  await search.focus();
  const query = "memory graph retrieval";
  await page.keyboard.type(query);
  await expect(search).toHaveValue(query);
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe(query);
  await page
    .getByRole("combobox", { name: "Research area" })
    .selectOption("ai");
  await expect(search).toHaveValue(query);
  await page.getByRole("button", { name: "Clear search", exact: true }).click();
  await expect(search).toHaveValue("");
  await page.goBack();
  await expect(search).toHaveValue(query);
  await expect(
    page.getByRole("combobox", { name: "Research area" }),
  ).toHaveValue("");
  await page.goForward();
  await expect(search).toHaveValue("");
  await expect(
    page.getByRole("combobox", { name: "Research area" }),
  ).toHaveValue("ai");
  await search.focus();
  await page.keyboard.type(query);
  await expect(search).toHaveValue(query);
  await page.reload();
  await expect(search).toHaveValue(query);
  expect(new URL(page.url()).searchParams.get("source")).toBe("keyboard");
});
