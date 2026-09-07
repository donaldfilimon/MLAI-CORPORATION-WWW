import { abiMetrics } from "@/lib/brand";
import { abi } from "@/lib/content";
import { ProductShell } from "@/components/sections/ProductShell";

export const metadata = { title: "ABI", description: abi.tagline };

export default function Page() {
  return (
    <ProductShell name="ABI" tag="Compute + orchestration" color="var(--color-abi)"
      tagline={abi.tagline} body={abi.body}
      metrics={abiMetrics} notes={abi.notes} faq={abi.faq} />
  );
}
