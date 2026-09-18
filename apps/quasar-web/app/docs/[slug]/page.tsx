import { DocPage } from "./client";
import { docMeta, toNextMetadata } from "@/lib/route-meta";
import { docLd } from "@/lib/structured-data";
import { content } from "@/data";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return content.docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(docMeta(slug), `/docs/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = content.docs.find((d) => d.slug === slug);
  if (!record) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        // Safe only because the payload is in-repo content validated by the
        // Zod schema in src/data/schemas (see content.test.ts) — JSON.stringify
        // does NOT escape "</script>", so never widen this to user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(docLd(record)) }}
      />
      <DocPage slug={slug} />
    </>
  );
}
