import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import { NotFound, recoveryForPathname } from "@/views/NotFound";

const sections = [
  { pathname: "/docs/missing", heading: "Document not found", href: "/docs" },
  { pathname: "/blog/missing", heading: "Note not found", href: "/blog" },
  { pathname: "/research/missing", heading: "Paper not found", href: "/research" },
  { pathname: "/products/missing", heading: "Product not found", href: "/products" },
  { pathname: "/projects/missing", heading: "Project not found", href: "/projects" },
  { pathname: "/team/missing", heading: "Profile not found", href: "/team" },
] as const;

describe("global not-found recovery", () => {
  it.each(sections)(
    "offers section-specific recovery for $pathname",
    ({ pathname: route, heading, href }) => {
      const recovery = recoveryForPathname(route);

      expect(recovery.eyebrow).toContain(heading);
      expect(recovery.backTo).toBe(href);
    },
  );

  it("keeps the initial server render generic so hydration can match", () => {
    const html = renderToStaticMarkup(<NotFound />);

    expect(html).toContain("Page not found");
    expect(html).not.toContain("Document not found");
  });

  it("keeps the generic recovery experience for an unrelated path", () => {
    const html = renderToStaticMarkup(<NotFound />);

    expect(html).toContain("Page not found");
    expect(html).toContain('href="/"');
  });
});
