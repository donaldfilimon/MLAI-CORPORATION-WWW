import { describe, expect, it } from "vitest";
import { sectionAnchors, slugify } from "@/lib/doc-anchors";
import { docs } from "@/data/categories/docs";
import type { DocSection } from "@/data/schemas";

function section(heading?: string): DocSection {
  return { heading, paragraphs: ["placeholder"] };
}

describe("sectionAnchors", () => {
  it("gives three distinct anchors for a heading that collides with a disambiguated duplicate (regression: FINDING 1)", () => {
    const body = [section("Deploy"), section("Deploy 2"), section("Deploy")];
    const anchors = sectionAnchors(body);
    expect(new Set(anchors).size).toBe(3);
    expect(anchors).toEqual(["deploy", "deploy-2", "deploy-3"]);
  });

  it("does not produce an empty anchor for an all-punctuation heading", () => {
    const body = [section("—")];
    const anchors = sectionAnchors(body);
    expect(anchors[0]).not.toBe("");
    expect(anchors[0]!.length).toBeGreaterThan(0);
  });

  it("falls back deterministically when a heading is missing", () => {
    const body = [section("Intro"), section(undefined), section("Intro")];
    const anchors = sectionAnchors(body);
    expect(anchors[1]).toBe("section-1");
    expect(new Set(anchors).size).toBe(3);
  });

  it("is stable across repeated calls with the same input", () => {
    const body = [section("Deploy"), section("Deploy 2"), section("Deploy"), section("—")];
    const first = sectionAnchors(body);
    const second = sectionAnchors(body);
    expect(second).toEqual(first);
  });

  it("produces no duplicate anchors for any document in the real corpus", () => {
    for (const doc of docs) {
      const anchors = sectionAnchors(doc.body);
      const unique = new Set(anchors);
      expect(unique.size, `${doc.slug} anchors: ${anchors.join(", ")}`).toBe(anchors.length);
      for (const a of anchors) {
        expect(a.length, `${doc.slug} produced an empty anchor`).toBeGreaterThan(0);
      }
    }
  });
});

describe("slugify", () => {
  it("collapses an all-punctuation string to empty (caller must handle fallback)", () => {
    expect(slugify("—")).toBe("");
  });

  it("collapses punctuation and diacritics into hyphen-joined ascii", () => {
    expect(slugify("Use the project's validation gate")).toBe(
      "use-the-project-s-validation-gate",
    );
  });
});
