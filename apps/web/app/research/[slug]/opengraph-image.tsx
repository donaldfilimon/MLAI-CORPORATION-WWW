import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { content } from "@/data";

export const runtime = "nodejs";
export const alt = "MLAI Research";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return content.research.publications.map((paper) => ({ slug: paper.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = content.research.publications.find((p) => p.slug === slug);

  return renderOgImage({
    kicker: paper?.tag ?? "RESEARCH",
    title: paper?.title ?? "MLAI Corporation",
    subtitle: paper ? `${paper.date} · ${paper.readTime}` : undefined,
  });
}
