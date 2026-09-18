import { describe, expect, it } from "vitest";
import { parseContentDate, toIsoDate, toSitemapDate } from "@/lib/dates";

describe("dates", () => {
  it("parseContentDate accepts the content layer's human date formats", () => {
    expect(parseContentDate("June 9, 2026")).not.toBeNull();
    expect(parseContentDate("JUNE 2026")).not.toBeNull();
  });

  it("parseContentDate returns null for unparseable input", () => {
    expect(parseContentDate("not a date")).toBeNull();
    expect(parseContentDate("")).toBeNull();
  });

  it("toIsoDate mirrors parseContentDate but as an ISO string", () => {
    const iso = toIsoDate("June 9, 2026");
    expect(iso).toBeDefined();
    expect(() => new Date(iso as string).toISOString()).not.toThrow();
    expect(toIsoDate("not a date")).toBeUndefined();
  });

  it("toSitemapDate emits the bare YYYY-MM-DD form <lastmod> wants", () => {
    expect(toSitemapDate("June 9, 2026")).toBe("2026-06-09");
    // Research entries are month-precision and uppercase; they pin to the 1st.
    expect(toSitemapDate("JUNE 2026")).toBe("2026-06-01");
    expect(toSitemapDate("DECEMBER 2025")).toBe("2025-12-01");
  });

  it("toSitemapDate returns undefined rather than substituting a date", () => {
    // The generator omits <lastmod> entirely on undefined. Any fallback here —
    // today's date especially — would restamp every URL on every build and tell
    // crawlers the whole site changed daily, which is what this replaced.
    for (const bad of ["not a date", "", "Q1 2026", "coming soon"]) {
      expect(toSitemapDate(bad)).toBeUndefined();
    }
  });
});
