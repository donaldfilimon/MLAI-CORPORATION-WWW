import { describe, it, expect } from "vitest";
import { tagColor, tagColors, DEFAULT_TAG_COLOR } from "../lib/tag-colors";

describe("tagColor", () => {
  it("returns the mapped class for a known tag", () => {
    expect(tagColor("SCALABILITY")).toBe(tagColors["SCALABILITY"]);
    expect(tagColor("CORE ARCHITECTURE")).toContain("cyan");
  });

  it("falls back to the default color for an unknown tag", () => {
    expect(tagColor("NOT A REAL TAG")).toBe(DEFAULT_TAG_COLOR);
    expect(tagColor("")).toBe(DEFAULT_TAG_COLOR);
  });
});
