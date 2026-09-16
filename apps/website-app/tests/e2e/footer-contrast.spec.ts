import { test, expect } from "@playwright/test";

test("public footer supporting copy meets normal text contrast", async ({
  page,
}) => {
  await page.goto("/research");
  const results = await page
    .locator(
      ".public-footer-label, .public-footer-meta p, .public-footer-prov .prov-legend.inline",
    )
    .evaluateAll((elements) => {
      const luminance = (rgb: number[]) =>
        rgb
          .map((v) => {
            const c = v / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          })
          .reduce((value, c, i) => value + c * [0.2126, 0.7152, 0.0722][i], 0);
      const color = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      return elements.map((element) => {
        let background = element;
        while (
          getComputedStyle(background).backgroundColor === "rgba(0, 0, 0, 0)" &&
          background.parentElement
        )
          background = background.parentElement;
        const foreground = luminance(
          color(getComputedStyle(element).color).slice(0, 3),
        );
        const backdrop = luminance(
          color(getComputedStyle(background).backgroundColor).slice(0, 3),
        );
        return (
          (Math.max(foreground, backdrop) + 0.05) /
          (Math.min(foreground, backdrop) + 0.05)
        );
      });
    });
  expect(results.length).toBeGreaterThan(0);
  for (const ratio of results) expect(ratio).toBeGreaterThanOrEqual(4.5);
});
