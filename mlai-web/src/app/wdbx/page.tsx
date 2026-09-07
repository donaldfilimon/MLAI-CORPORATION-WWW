import { wdbxMetrics } from "@/lib/brand";
import { wdbx } from "@/lib/content";
import { ProductShell } from "@/components/sections/ProductShell";

export const metadata = { title: "WDBX", description: wdbx.tagline };

export default function Page() {
  return (
    <ProductShell name="WDBX" tag="Vector storage" color="var(--color-wdbx)"
      tagline={wdbx.tagline} body={wdbx.body}
      metrics={wdbxMetrics} notes={wdbx.notes} faq={wdbx.faq} />
  );
}
