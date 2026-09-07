import { abbeyMetrics } from "@/lib/brand";
import { abbey } from "@/lib/content";
import { ProductShell } from "@/components/sections/ProductShell";

export const metadata = { title: "Abbey", description: abbey.tagline };

export default function Page() {
  return (
    <ProductShell name="Abbey" tag="Assistant layer" color="var(--color-abbey)"
      tagline={abbey.tagline} body={abbey.body}
      metrics={abbeyMetrics} notes={abbey.notes} faq={abbey.faq} />
  );
}
