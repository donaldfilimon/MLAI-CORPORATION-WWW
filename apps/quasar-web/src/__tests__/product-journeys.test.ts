import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { productJourneys, primaryNavigation, startJourneys } from "@/data/categories/product-journeys";
import { products } from "@/data/categories/products";
import { research } from "@/data/categories/research";
import { ProductsSchema } from "@/data/schemas";
import { productMeta, routeMetadata } from "@/lib/route-meta";
const root = resolve(__dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("public product journeys", () => {
  it("gives four products equal, schema-valid route entries with explicit scope", () => {
    expect(products.map((product) => product.slug)).toEqual(["abi", "abbey", "wdbx", "quasar"]);
    expect(ProductsSchema.safeParse(products).success).toBe(true);
    for (const product of productJourneys) {
      expect(product.availability.length).toBeGreaterThan(8);
      expect(product.prerequisites.length).toBeGreaterThan(30);
      expect(product.limitation.length).toBeGreaterThan(30);
      expect(productMeta(product.slug).title).toContain(product.name);
      expect(product.researchSlugs.length).toBeGreaterThan(0);
      for (const slug of product.researchSlugs) expect(research.publications.some((paper) => paper.slug === slug)).toBe(true);
    }
  });
  it("preserves illustrative narratives while correcting contradicted implementation claims", () => {
    const abi = products.find((product) => product.slug === "abi")!;
    expect(abi.sections.some((section) => section.demo === "persona-router")).toBe(true);
    expect(abi.sections.some((section) => section.equations?.length)).toBe(true);
    expect(JSON.stringify(abi)).toContain("deterministic rules");
    expect(JSON.stringify(abi)).toContain("CUDA and Vulkan dispatch are not linked");
    expect(JSON.stringify(abi)).not.toContain("production router uses a learned classifier");
    expect(productJourneys.find((product) => product.slug === "abbey")?.setupHref).toContain("apps/website-app/README.md");
    expect(productJourneys.find((product) => product.slug === "wdbx")?.researchSlugs).toContain("wdbx-weighted-backtrace-memory-store");
  });
  it("routes public navigation consistently on desktop and mobile", () => {
    expect(primaryNavigation).toEqual([{ to: "/products", label: "Products" }, { to: "/research", label: "Research" }, { to: "/docs", label: "Docs" }, { to: "/about", label: "Company" }]);
    const navbar = read("src/components/Navbar.tsx");
    expect(navbar.match(/navItems.map/g)).toHaveLength(2);
    expect(navbar.match(/to="\/get-started"/g)).toHaveLength(2);
    for (const route of ["products", "get-started"]) {
      expect(existsSync(resolve(root, `app/${route}/page.tsx`))).toBe(true);
      expect(routeMetadata[`/${route}`]).toBeDefined();
      expect(read("scripts/generate-sitemap.ts")).toContain(`path: "/${route}"`);
    }
  });
  it("offers intent paths without pretending to launch a hosted product", () => {
    expect(startJourneys.map((journey) => journey.id)).toEqual(["research", "abbey", "mobile", "quasar"]);
    for (const journey of [...productJourneys.map((product) => ({ href: product.setupHref })), ...startJourneys]) {
      expect(journey.href).not.toMatch(/localhost|127\.0\.0\.1|\/login|\/console/);
      expect(journey.href.startsWith("/docs/") || journey.href === "/research" || journey.href.startsWith("https://github.com/")).toBe(true);
    }
    expect(startJourneys.find((journey) => journey.id === "mobile")?.description).toContain("signed-device acceptance");
    expect(productJourneys.find((product) => product.slug === "quasar")?.limitation).toContain("without authentication");
  });
  it("keeps static Pages usable without a Next deployment", () => {
    const html = read("site/index.html");
    for (const id of ["products", "research", "docs", "company", "get-started", ...products.map((product) => product.slug)]) expect(html).toContain(`id="${id}"`);
    for (const match of html.matchAll(/href="#([^"]+)"/g)) expect(html).toContain(`id="${match[1]}"`);
    expect(html).not.toMatch(/href="https:\/\/quesar\.cloud\/(products|research|docs|login|security|architecture)/);
    expect(html).not.toContain("localhost");
    expect(html).toContain("Read mobile setup");
    expect(html).toContain("Read Quasar setup");
  });
});
