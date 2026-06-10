import { Product } from "./client";
import { productMeta, toNextMetadata } from "@/lib/route-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return toNextMetadata(productMeta(slug), `/products/${slug}`);
}

export default function Page() {
  return <Product />;
}
