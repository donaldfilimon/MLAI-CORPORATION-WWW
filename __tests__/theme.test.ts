import { tint, accentColor } from "@/lib/theme";

describe("tint", () => {
  it("appends an 8-bit alpha suffix to a 6-digit hex", () => {
    expect(tint("#22D3EE", 1)).toBe("#22D3EEff");
    expect(tint("#22D3EE", 0)).toBe("#22D3EE00");
  });

  it("defaults to ~12% alpha (0.12 * 255 -> 0x1f)", () => {
    expect(tint("#000000")).toBe("#0000001f");
  });

  it("always yields a parseable 8-digit hex", () => {
    expect(tint("#A855F7", 0.3)).toMatch(/^#[0-9A-Fa-f]{8}$/);
  });
});

describe("accent palette", () => {
  it("exposes a valid 6-digit hex for each product accent", () => {
    for (const c of [accentColor.wdbx, accentColor.abi, accentColor.abbey]) {
      expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
