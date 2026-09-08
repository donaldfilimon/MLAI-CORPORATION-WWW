import { describe, expect, it } from "vitest";
import { docs } from "@/data/categories/docs";
import { docMeta, routeMetadata, NOT_FOUND_META } from "@/lib/route-meta";

describe("doc routes", () => {
  it("gives every doc a title and description", () => {
    for (const doc of docs) {
      const meta = docMeta(doc.slug);
      expect(meta.title, doc.slug).toBeTruthy();
      expect(meta.description, doc.slug).toBeTruthy();
    }
  });

  it("returns the not-found meta for an unknown slug", () => {
    expect(docMeta("no-such-doc")).toEqual(NOT_FOUND_META);
  });

  it("leaves the static /docs route registered", () => {
    expect(routeMetadata["/docs"]).toBeTruthy();
  });
});
