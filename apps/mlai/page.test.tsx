import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Page from "./app/page.tsx";

const banned = [
  "customer",
  "customers",
  "testimonial",
  "benchmark",
  "partnership",
  "partner logo",
  "unhackable",
  "military-grade",
  "completely secure",
];

function rendered() {
  return renderToStaticMarkup(createElement(Page)).toLowerCase();
}

describe("apps/mlai home", () => {
  test("renders the shipped page without invented claims", () => {
    const markup = renderToStaticMarkup(createElement(Page));
    expect(markup.length).toBeGreaterThan(0);
    expect(markup).toContain("MLAI");
    const lower = markup.toLowerCase();
    for (const phrase of banned) {
      expect(lower).not.toContain(phrase);
    }
  });

  test("rendered markup rejects customer", () => {
    expect(rendered()).not.toContain("customer");
  });

  test("rendered markup rejects customers", () => {
    expect(rendered()).not.toContain("customers");
  });
});
