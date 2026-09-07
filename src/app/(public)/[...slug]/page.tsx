import { findPublication, publicationPaths } from "@/content/research";
import { ResearchLanding, ResearchArticle } from "@/components/research-pages";
import { operations } from "@/lib/openapi";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { pages, docPaths } from "@/content/pages";
import { ContentIndex } from "@/components/content-index";
import { PlatformPage } from "@/components/platform-page";
import { AbbeyPage } from "@/components/abbey-page";
import { AbiPage } from "@/components/abi-page";
import { WdbxPage } from "@/components/wdbx-page";
import { DocsShell } from "@/components/docs-shell";
import { ContactPage } from "@/components/contact-page";
import { CompanyPage } from "@/components/company-page";
type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() {
  return [
    ...Object.keys(pages),
    ...publicationPaths,
    "docs",
    "research",
    "contact",
  ].map((path) => ({
    slug: path.split("/"),
  }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = (await params).slug.join("/");
  const publication = findPublication(key);
  return {
    title:
      publication?.title ||
      pages[key]?.title ||
      (
        {
          docs: "Documentation",
          research: "Research",
          contact: "Contact",
        } as Record<string, string>
      )[key],
    description:
      publication?.abstract ||
      pages[key]?.description ||
      (key === "research"
        ? "Source-reviewed MLAI research, implementation guides, and application notes."
        : undefined),
  };
}
export default async function Page({ params }: Props) {
  const key = (await params).slug.join("/");
  const docsItems = docPaths.map((path) => ({
    href: `/${path}`,
    title: pages[path].title,
    description: pages[path].description,
    category: pages[path].category,
  }));
  const publication = findPublication(key);
  if (publication) return <ResearchArticle publication={publication} />;
  if (key === "research") return <ResearchLanding />;
  if (key === "contact") return <ContactPage />;
  if (key === "docs") {
    return (
      <div className="public-container">
        <DocsShell items={docsItems}>
          <header className="article-header docs-landing-header">
            <span className="eyeline wdbx">Docs</span>
            <h1>Documentation</h1>
            <p>
              Set up the workspace, understand its boundaries, and connect real
              services. Use ⌘K to jump by title.
            </p>
          </header>
          <ContentIndex
            searchLabel="Filter documentation"
            placeholder="Filter articles and guides…"
            items={docPaths.map((path) => ({ href: `/${path}`, ...pages[path] }))}
          />
        </DocsShell>
      </div>
    );
  }
  if (key === "platform") return <PlatformPage />;
  if (key === "abbey") return <AbbeyPage />;
  if (key === "abi") return <AbiPage />;
  if (key === "wdbx") return <WdbxPage />;
  if (key === "company") return <CompanyPage />;
  const article = pages[key];
  if (!article) notFound();
  const articleBody = (
    <div className="article-layout">
      <header className="article-header">
        <span
          className={`eyeline ${["abi", "abbey", "wdbx"].includes(key) ? key : ""}`}
        >
          {article.category}
        </span>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
      </header>
      <div className="article-body">
        <aside aria-label="On this page">
          <strong>On this page</strong>
          {article.sections.map((section, i) => (
            <a href={`#section-${i}`} key={section.title}>
              {section.title}
            </a>
          ))}
          {key.startsWith("research/") && (
            <Link href="/research">
              Research library <ArrowRight size={14} />
            </Link>
          )}
          <Link href="/docs">
            Documentation <ArrowRight size={14} />
          </Link>
        </aside>
        <div>
          {article.sections.map((section, i) => (
            <section id={`section-${i}`} key={section.title}>
              <h2>{section.title}</h2>
              {section.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.code && (
                <pre>
                  <code>{section.code}</code>
                </pre>
              )}
            </section>
          ))}
          {key === "docs/api" && (
            <section>
              <h2>Endpoint reference</h2>
              <p>
                Send a workspace-scoped bearer key, or use the signed-in browser
                session. Error responses include a stable code and a request ID.
              </p>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Path</th>
                      <th>Behavior</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map(([path, method, summary]) => (
                      <tr key={method + path}>
                        <td>
                          <code>{method.toUpperCase()}</code>
                        </td>
                        <td>
                          <code>/api/v1{path}</code>
                        </td>
                        <td>{summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {article.links && (
            <nav className="article-links" aria-label="Related content">
              {article.links.map((link) => (
                <Link className="text-link" href={link.href} key={link.href}>
                  {link.label}
                  <ArrowRight size={16} />
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
  if (key.startsWith("docs/")) {
    return (
      <div className="public-container">
        <DocsShell items={docsItems}>{articleBody}</DocsShell>
      </div>
    );
  }
  return <div className="public-container">{articleBody}</div>;
}
