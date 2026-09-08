import {
  findImplementationStudy,
  findPublication,
  implementationPaths,
  publicationPaths,
} from "@/content/research";
import {
  ImplementationStudyArticle,
  ResearchLanding,
  ResearchArticle,
} from "@/components/research-pages";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { pages } from "@/content/pages";
import { PlatformPage } from "@/components/platform-page";
import { AbbeyPage } from "@/components/abbey-page";
import { AbiPage } from "@/components/abi-page";
import { WdbxPage } from "@/components/wdbx-page";
import { ArchitecturePage } from "@/components/architecture-page";
import { ContactPage } from "@/components/contact-page";
import { CompanyPage } from "@/components/company-page";
import { InvestorsPage } from "@/components/investors-page";
import { KnowledgePage } from "@/components/knowledge-page";
import { RepositoriesPage } from "@/components/repositories-page";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return [
    ...Object.keys(pages).filter((path) => !path.startsWith("docs/")),
    ...publicationPaths,
    ...implementationPaths,
    "research",
    "contact",
    "knowledge",
    "repositories",
  ].map((path) => ({
    slug: path.split("/"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = (await params).slug.join("/");
  const publication = findPublication(key);
  const study = findImplementationStudy(key);
  return {
    title:
      publication?.title ||
      study?.title ||
      pages[key]?.title ||
      (
        {
          research: "Research",
          contact: "Contact",
          company: "Company",
          investors: "Investors",
          knowledge: "Knowledge",
          repositories: "Repositories",
        } as Record<string, string>
      )[key],
    description:
      publication?.abstract ||
      study?.summary ||
      pages[key]?.description ||
      (
        {
          research:
            "Source-reviewed MLAI research with provenance — no invented StatBlocks.",
          contact:
            "One inbox for deploy, pilot, partner, or invest. Privacy-first by default.",
          company:
            "Why MLAI exists — Delaware C-Corp, Orlando roots, evidence before projections.",
          investors:
            "Positioning thesis, deliberately figure-free. Evidence before projections.",
          knowledge:
            "Motto, personas, routing prior, substrate invariant — claim-honest knowledge base.",
          repositories:
            "Each repository's claims ledger: Current, Partial, Proposed, Not claimed.",
        } as Record<string, string>
      )[key],
  };
}

export default async function Page({ params }: Props) {
  const key = (await params).slug.join("/");
  // Dedicated /docs routes own documentation IA.
  if (key === "docs" || key.startsWith("docs/")) notFound();

  const publication = findPublication(key);
  if (publication) return <ResearchArticle publication={publication} />;
  const study = findImplementationStudy(key);
  if (study) return <ImplementationStudyArticle study={study} />;
  if (key === "research") return <ResearchLanding />;
  if (key === "contact") return <ContactPage />;
  if (key === "platform") return <PlatformPage />;
  if (key === "abbey") return <AbbeyPage />;
  if (key === "abi") return <AbiPage />;
  if (key === "wdbx") return <WdbxPage />;
  if (key === "architecture") return <ArchitecturePage />;
  if (key === "company") return <CompanyPage />;
  if (key === "investors") return <InvestorsPage />;
  if (key === "knowledge") return <KnowledgePage />;
  if (key === "repositories") return <RepositoriesPage />;

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
