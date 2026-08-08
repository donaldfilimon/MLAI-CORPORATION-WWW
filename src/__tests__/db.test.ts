import { describe, expect, it } from "vitest";
import { resolveDbPath } from "@/lib/server/db";

describe("resolveDbPath", () => {
  it("defaults to inquiries.db when unset, empty, or whitespace", () => {
    expect(resolveDbPath(undefined)).toBe("inquiries.db");
    expect(resolveDbPath("")).toBe("inquiries.db");
    expect(resolveDbPath("   ")).toBe("inquiries.db");
  });

  it("strips a sqlite:// prefix (the form documented in .env.example)", () => {
    expect(resolveDbPath("sqlite://inquiries.db")).toBe("inquiries.db");
    expect(resolveDbPath("sqlite:///app/data/inquiries.db")).toBe("/app/data/inquiries.db");
  });

  it("passes a bare path through unchanged", () => {
    expect(resolveDbPath("/app/data/inquiries.db")).toBe("/app/data/inquiries.db");
    expect(resolveDbPath("custom.db")).toBe("custom.db");
  });
});
