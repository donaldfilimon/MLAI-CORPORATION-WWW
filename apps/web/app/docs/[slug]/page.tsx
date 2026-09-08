import { DocPage } from "./client";
import { docMeta, toNextMetadata } from "@/lib/route-meta";
import { content } from "@/data";

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
  return <DocPage slug={slug} />;
}
