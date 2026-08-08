import { describe, expect, it } from "vitest";
import { parseContentDate, toIsoDate } from "@/lib/dates";

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
});
