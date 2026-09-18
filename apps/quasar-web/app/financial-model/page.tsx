import { FinancialModel } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/financial-model"]!, "/financial-model");

export default function Page() {
  return <FinancialModel />;
}
