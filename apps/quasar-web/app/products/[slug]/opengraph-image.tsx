import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { content } from "@/data";

export const runtime = "nodejs";
export const alt = "MLAI Corporation — Product";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return content.products.map((product) => ({ slug: product.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = content.products.find((p) => p.slug === slug);

  return renderOgImage({
    kicker: product?.kicker ?? "PRODUCT",
    title: product?.name ?? "MLAI Corporation",
  });
}
