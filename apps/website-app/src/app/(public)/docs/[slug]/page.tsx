import { operations } from "@/lib/openapi";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { pages, docPaths } from "@/content/pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return docPaths.map((path) => ({ slug: path.slice("docs/".length) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const article = pages[`docs/${slug}`];
  if (!article) return {};
  return { title: article.title, description: article.description };
}

export default async function DocArticlePage({ params }: Props) {
  const slug = (await params).slug;
  const key = `docs/${slug}`;
  const article = pages[key];
  if (!article) notFound();

  return (
    <div className="article-layout">
      <header className="article-header">
        <span className="eyeline">{article.category}</span>
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
              {section.code ? (
                <pre>
                  <code>{section.code}</code>
                </pre>
              ) : null}
            </section>
          ))}
          {key === "docs/api" ? (
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
          ) : null}
          {article.links ? (
            <nav className="article-links" aria-label="Related content">
              {article.links.map((link) => (
                <Link className="text-link" href={link.href} key={link.href}>
                  {link.label}
                  <ArrowRight size={16} />
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
