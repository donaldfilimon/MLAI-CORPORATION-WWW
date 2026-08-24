import { investorHighlights, provenanceMeta, products, productOrder } from "@/lib/brand";
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

  it("every published investor stat carries a known provenance", () => {
    const valid = new Set(["measured", "target", "reported"]);
    for (const stat of investorHighlights) expect(valid.has(stat.provenance)).toBe(true);
  });

  it("does not publish uncorroborated ABI speedups or Abbey quality scores", () => {
    expect(JSON.stringify(products)).not.toMatch(/5×|84×|295×|13×|empathy score|technical accuracy/);
    expect(products.abi).not.toHaveProperty("stats");
    expect(products.abbey).not.toHaveProperty("stats");
  });

  it("uses the active Rust WDBX graph defaults", () => {
    const hnsw = products.wdbx.features.find((feature) => feature.title === "Layered HNSW");
    expect(hnsw?.desc).toContain("M=16");
    expect(hnsw?.desc).toContain("EF_CONSTRUCTION=40");
    expect(hnsw?.desc).toContain("EF_SEARCH=32");
    expect(products.wdbx.intro.join(" ")).toContain("active Rust substrate");
  });
});
