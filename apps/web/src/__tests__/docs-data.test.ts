import { describe, expect, it } from "vitest";
import { docs } from "@/data/categories/docs";
import { DocsSchema } from "@/data/schemas";

const EXPECTED_SLUGS = [
  "getting-started",
  "architecture",
  "identity",
  "gama",
  "evidence",
] as const;

describe("docs corpus", () => {
  it("validates against DocsSchema", () => {
    expect(() => DocsSchema.parse(docs)).not.toThrow();
  });

  it("contains exactly the five ported subjects", () => {
    expect(docs.map((d) => d.slug).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("does not port runtime or wdbx, which /docs already covers", () => {
    const slugs = docs.map((d) => d.slug);
    expect(slugs).not.toContain("runtime");
    expect(slugs).not.toContain("wdbx");
  });

  it("carries no review-site self-reference", () => {
    const prose = docs
      .flatMap((d) => [d.title, d.description, ...d.body.flatMap((s) => [s.heading ?? "", ...s.paragraphs, s.note ?? ""])])
      .join(" ");
    expect(prose).not.toMatch(/this review|review site|this website|evidence ledger/i);
  });

  it("gives every section a heading and at least one paragraph", () => {
    for (const doc of docs) {
      for (const section of doc.body) {
        expect(section.heading, `${doc.slug} section heading`).toBeTruthy();
        expect(section.paragraphs.length, `${doc.slug} paragraphs`).toBeGreaterThan(0);
      }
    }
  });
});
