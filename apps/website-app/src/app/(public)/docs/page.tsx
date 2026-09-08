import type { Metadata } from "next";
import { ContentIndex } from "@/components/content-index";
import { docPaths, pages } from "@/content/pages";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Set up the workspace, understand its boundaries, and connect real services.",
};

export default function DocsIndexPage() {
  return (
    <>
      <header className="article-header docs-landing-header">
        <span className="eyeline wdbx">Docs</span>
        <h1>Documentation</h1>
        <p>
          Set up the workspace, understand its boundaries, and connect real
          services. Use ⌘K or Ctrl+K to jump by title.
        </p>
      </header>
      <ContentIndex
        searchLabel="Filter documentation"
        placeholder="Filter articles and guides…"
        items={docPaths.map((path) => ({ href: `/${path}`, ...pages[path] }))}
      />
    </>
  );
}
