import { describe, expect, it } from "vitest";
import { projects } from "@/data/categories/projects";
import { docs } from "@/data/categories/docs";
import { flattenDocNav } from "@/data/categories/docs-nav";
import { ProjectsSchema } from "@/data/schemas";
import { projectMeta, routeMetadata, NOT_FOUND_META } from "@/lib/route-meta";

describe("projects corpus", () => {
  it("validates against ProjectsSchema", () => {
    expect(() => ProjectsSchema.parse(projects)).not.toThrow();
  });

  it("contains the four ported projects", () => {
    expect(projects.map((p) => p.slug).sort()).toEqual(["abbey", "abi", "gama", "wdbx"]);
  });

  it("states a limit for every project", () => {
    for (const p of projects) expect(p.limit, p.slug).toBeTruthy();
  });

  it("gives every project route metadata", () => {
    for (const p of projects) expect(projectMeta(p.slug).title, p.slug).toBeTruthy();
  });

  // Ruling A: /docs/runtime and /docs/wdbx were deliberately never ported
  // (the existing /docs page already covers both subjects), so abi/wdbx
  // must link to the /docs page's own anchors, not a dead /docs/<slug>
  // route. abbey/gama did port cleanly and should link to their real routes.
  it("resolves abi/wdbx docs links to the /docs anchors, not a dead /docs/<slug> route", () => {
    const abi = projects.find((p) => p.slug === "abi");
    const wdbx = projects.find((p) => p.slug === "wdbx");
    expect(abi?.docsHref).toBe("/docs#runtime");
    expect(wdbx?.docsHref).toBe("/docs#wdbx");
    // Guard against a regression back to the vendored bare-slug form.
    expect(abi?.docsHref).not.toBe("/docs/runtime");
    expect(wdbx?.docsHref).not.toBe("/docs/wdbx");
  });

  it("resolves abbey/gama docs links to their real ported doc routes", () => {
    const abbey = projects.find((p) => p.slug === "abbey");
    const gama = projects.find((p) => p.slug === "gama");
    expect(abbey?.docsHref).toBe("/docs/identity");
    expect(gama?.docsHref).toBe("/docs/gama");
  });

  // A format check (asserting the literal string) can't catch a renamed
  // docNav id or a dropped doc slug out from under a project's docsHref. This
  // resolves every docsHref against the actual targets so it fails as a real
  // dead link, not just a string mismatch.
  it("every docsHref resolves to a real /docs anchor or a real /docs/:slug route", () => {
    const anchorIds = new Set(flattenDocNav().map((item) => item.id));
    const docSlugs = new Set(docs.map((d) => d.slug));

    for (const p of projects) {
      const anchorMatch = p.docsHref.match(/^\/docs#(.+)$/);
      const routeMatch = p.docsHref.match(/^\/docs\/(.+)$/);

      if (anchorMatch) {
        const id = anchorMatch[1] ?? "";
        expect(anchorIds.has(id), `${p.slug} -> ${p.docsHref}`).toBe(true);
      } else if (routeMatch) {
        const slug = routeMatch[1] ?? "";
        expect(docSlugs.has(slug), `${p.slug} -> ${p.docsHref}`).toBe(true);
      } else {
        throw new Error(`${p.slug} has an unrecognized docsHref shape: ${p.docsHref}`);
      }
    }
  });

  it("gives every project a resolved, non-empty source title and URL", () => {
    for (const p of projects) {
      expect(p.source.title, p.slug).toBeTruthy();
      expect(p.source.url, p.slug).toMatch(/^https:\/\/github\.com\//);
    }
  });

  // Ruling C: the vendored wdbx.limit read "This website is not a connected
  // database and shows no live retrieval results" — true of the vendored
  // review site, false published on MLAI's own site.
  it("carries no review-site self-reference in any project's prose", () => {
    const prose = projects
      .flatMap((p) => [p.tagline, p.description, ...p.scope, p.limit])
      .join(" ");
    expect(prose).not.toMatch(/this review|review site|this website|evidence ledger/i);
  });

  it("returns the not-found meta for an unknown slug", () => {
    expect(projectMeta("no-such-project")).toEqual(NOT_FOUND_META);
  });

  it("registers the static /projects route", () => {
    expect(routeMetadata["/projects"]).toBeTruthy();
  });
});
