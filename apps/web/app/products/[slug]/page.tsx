import { Product } from "./client";
import { productMeta, toNextMetadata } from "@/lib/route-meta";
import { softwareApplicationLd } from "@/lib/structured-data";
import { content } from "@/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(productMeta(slug), `/products/${slug}`);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = content.products.find((p) => p.slug === slug);
  return (
    <>
      {product ? (
        <script
          type="application/ld+json"
          // Safe only because the payload is in-repo content validated by the
          // Zod schema in src/data/schemas (see content.test.ts) — JSON.stringify
          // does NOT escape "</script>", so never widen this to user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(product)) }}
        />
      ) : null}
      <Product />
    </>
  );
}
