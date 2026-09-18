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
  // `docs.ts` already runs DocsSchema.parse at module load, so re-parsing the
  // parsed value cannot fail and asserts nothing. Assert the schema's
  // discriminating power instead: a malformed record must be rejected.
  it("rejects a record with a malformed slug", () => {
    expect(() => DocsSchema.parse([{ ...docs[0], slug: 42 }])).toThrow();
  });

  it("rejects a source that is a bare string rather than a resolved object", () => {
    expect(() => DocsSchema.parse([{ ...docs[0], sources: ["abi"] }])).toThrow();
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
