import { findPublication, publicationPaths } from "@/content/research";
import { ResearchLanding, ResearchArticle } from "@/components/research-pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { pages } from "@/content/pages";
import { PlatformPage } from "@/components/platform-page";
import { AbbeyPage } from "@/components/abbey-page";
import { AbiPage } from "@/components/abi-page";
import { WdbxPage } from "@/components/wdbx-page";
import { ContactPage } from "@/components/contact-page";
import { CompanyPage } from "@/components/company-page";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return [
    ...Object.keys(pages).filter((path) => !path.startsWith("docs/")),
    ...publicationPaths,
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
  // Dedicated /docs routes own documentation IA.
  if (key === "docs" || key.startsWith("docs/")) notFound();

  const publication = findPublication(key);
  if (publication) return <ResearchArticle publication={publication} />;
  if (key === "research") return <ResearchLanding />;
  if (key === "contact") return <ContactPage />;
  if (key === "platform") return <PlatformPage />;
  if (key === "abbey") return <AbbeyPage />;
  if (key === "abi") return <AbiPage />;
  if (key === "wdbx") return <WdbxPage />;
  if (key === "company") return <CompanyPage />;

  const article = pages[key];
  if (!article) notFound();

  return (
    <div className="public-container">
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
    </div>
  );
}
