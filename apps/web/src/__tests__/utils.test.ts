import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values and supports conditional objects", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });

  it("resolves conflicting Tailwind utilities (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-white", "text-cyan-400")).toBe("text-cyan-400");
  });
});
