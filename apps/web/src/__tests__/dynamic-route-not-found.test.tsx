import { describe, expect, it, vi } from "vitest";

const NEXT_NOT_FOUND = "NEXT_HTTP_ERROR_FALLBACK;404";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error(NEXT_NOT_FOUND);
  },
}));

vi.mock("../../app/docs/[slug]/client", () => ({ DocPage: () => null }));
vi.mock("../../app/blog/[slug]/client", () => ({ BlogPost: () => null }));
vi.mock("../../app/research/[slug]/client", () => ({ ResearchPaper: () => null }));
vi.mock("../../app/products/[slug]/client", () => ({ Product: () => null }));
vi.mock("../../app/projects/[slug]/client", () => ({ ProjectPage: () => null }));
vi.mock("../../app/team/[slug]/client", () => ({ FounderProfile: () => null }));

import DocsPage from "../../app/docs/[slug]/page";
import BlogPage from "../../app/blog/[slug]/page";
import ResearchPage from "../../app/research/[slug]/page";
import ProductPage from "../../app/products/[slug]/page";
import ProjectPage from "../../app/projects/[slug]/page";
import TeamPage from "../../app/team/[slug]/page";
import * as DocsRoute from "../../app/docs/[slug]/page";
import * as BlogRoute from "../../app/blog/[slug]/page";
import * as ResearchRoute from "../../app/research/[slug]/page";
import * as ProductRoute from "../../app/products/[slug]/page";
import * as ProjectRoute from "../../app/projects/[slug]/page";
import * as TeamRoute from "../../app/team/[slug]/page";

type DynamicPage = (props: {
  params: Promise<{ slug: string }>;
}) => Promise<unknown>;

type DynamicRouteModule = {
  dynamicParams?: boolean;
  generateStaticParams?: () => Array<{ slug: string }>;
};

const routes: ReadonlyArray<{
  route: string;
  page: DynamicPage;
  knownSlug: string;
  module: DynamicRouteModule;
}> = [
  { route: "/docs/[slug]", page: DocsPage, knownSlug: "getting-started", module: DocsRoute },
  { route: "/blog/[slug]", page: BlogPage, knownSlug: "wdbx-v2-release", module: BlogRoute },
  { route: "/research/[slug]", page: ResearchPage, knownSlug: "ai-overview", module: ResearchRoute },
  { route: "/products/[slug]", page: ProductPage, knownSlug: "abi", module: ProductRoute },
  { route: "/projects/[slug]", page: ProjectPage, knownSlug: "abi", module: ProjectRoute },
  { route: "/team/[slug]", page: TeamPage, knownSlug: "donald-filimon", module: TeamRoute },
];

describe("dynamic content routes", () => {
  it.each(routes)("$route rejects an unknown slug through Next's 404 boundary", async ({ page }) => {
    await expect(
      page({ params: Promise.resolve({ slug: "definitely-not-a-real-slug-xyz" }) }),
    ).rejects.toThrow(NEXT_NOT_FOUND);
  });

  it.each(routes)("$route still renders a known slug", async ({ page, knownSlug }) => {
    await expect(page({ params: Promise.resolve({ slug: knownSlug }) })).resolves.toBeTruthy();
  });

  it.each(routes)(
    "$route rejects unknown values before a streaming response starts",
    ({ module, knownSlug }) => {
      expect(module.dynamicParams).toBe(false);
      expect(module.generateStaticParams?.()).toContainEqual({ slug: knownSlug });
      expect(module.generateStaticParams?.()).not.toContainEqual({
        slug: "definitely-not-a-real-slug-xyz",
      });
    },
  );
});
