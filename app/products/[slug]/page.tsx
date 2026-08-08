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
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd(product)) }}
        />
      ) : null}
      <Product />
    </>
  );
}
