import { findPublication, publicationPaths } from "@/content/research";
import { ResearchLanding, ResearchArticle } from "@/components/research-pages";
import { operations } from "@/lib/openapi";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { pages, docPaths } from "@/content/pages";
import { ContentIndex } from "@/components/content-index";
import { ContactForm } from "@/components/contact-form";
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
  const publication = findPublication(key);
  if (publication) return <ResearchArticle publication={publication} />;
  if (key === "research") return <ResearchLanding />;
  if (key === "contact")
    return (
      <div className="public-container article-layout">
        <header className="article-header">
          <span className="eyeline">Contact</span>
          <h1>Start with the actual problem.</h1>
          <p>
            Tell us what you are building, where you are stuck, and what a
            useful outcome would look like.
          </p>
        </header>
        <ContactForm />
      </div>
    );
  if (key === "docs") {
    return (
      <div className="public-container article-layout">
        <header className="article-header">
          <h1>Documentation</h1>
          <p>
            Set up the workspace, understand its boundaries, and connect real
            services.
          </p>
        </header>
        <ContentIndex
          searchLabel="Search documentation"
          placeholder="Search articles and guides…"
          items={docPaths.map((path) => ({ href: `/${path}`, ...pages[path] }))}
        />
      </div>
    );
  }
  const article = pages[key];
  if (!article) notFound();
  return (
    <div className="public-container article-layout">
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
}
