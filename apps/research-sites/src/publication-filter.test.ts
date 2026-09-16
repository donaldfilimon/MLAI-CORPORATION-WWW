import { describe, expect, test } from "bun:test";
import {
  ALL_TAG,
  matchesPublicationTag,
  statusText,
} from "./publication-filter.ts";

describe("matchesPublicationTag", () => {
  test("All shows every publication tag", () => {
    expect(matchesPublicationTag(ALL_TAG, "OVERVIEW")).toBe(true);
    expect(matchesPublicationTag(ALL_TAG, "SAFETY")).toBe(true);
    expect(matchesPublicationTag(ALL_TAG, null)).toBe(true);
  });

  test("a specific tag matches only that tag", () => {
    expect(matchesPublicationTag("SAFETY", "SAFETY")).toBe(true);
    expect(matchesPublicationTag("SAFETY", "ROUTING")).toBe(false);
    expect(matchesPublicationTag("SAFETY", null)).toBe(false);
  });
});

describe("statusText", () => {
  test("zero matches", () => {
    expect(statusText(0)).toBe("No publications match that tag.");
  });

  test("nonzero matches", () => {
    expect(statusText(1)).toBe("1 publications shown.");
    expect(statusText(21)).toBe("21 publications shown.");
  });
});
