import { ResearchPaper } from "./client";
import { researchMeta, toNextMetadata } from "@/lib/route-meta";
import { researchArticleLd } from "@/lib/structured-data";
import { content } from "@/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(researchMeta(slug), `/research/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const paper = content.research.publications.find((p) => p.slug === slug);
  return (
    <>
      {paper ? (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(researchArticleLd(paper)) }}
        />
      ) : null}
      <ResearchPaper />
    </>
  );
}
