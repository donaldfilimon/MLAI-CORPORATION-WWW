import { provenanceMeta, products, productOrder, heroStats } from "@/lib/brand";
import { color, accentColor } from "@/lib/theme";

describe("provenance metadata", () => {
  it("defines glyph + label for each provenance kind", () => {
    expect(provenanceMeta.measured).toMatchObject({ glyph: "●", label: "measured" });
    expect(provenanceMeta.target).toMatchObject({ glyph: "○", label: "target" });
    expect(provenanceMeta.reported).toMatchObject({ glyph: "◆", label: "reported" });
  });

  it("resolves every provenance color to a real theme hex", () => {
    const resolve = (c: string) => (c === "warn" ? color.warn : (accentColor as Record<string, string>)[c]);
    for (const p of ["measured", "target", "reported"] as const) {
      expect(resolve(provenanceMeta[p].color)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe("catalog integrity", () => {
  it("productOrder matches the product keys", () => {
    expect([...productOrder].sort()).toEqual(Object.keys(products).sort());
  });

  it("every product stat and hero stat carries a known provenance", () => {
    const valid = new Set(["measured", "target", "reported"]);
    for (const slug of productOrder) {
      for (const s of products[slug].stats) expect(valid.has(s.provenance)).toBe(true);
    }
    for (const s of heroStats) expect(valid.has(s.provenance)).toBe(true);
  });
});
