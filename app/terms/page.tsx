import { Terms } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/terms"]!, "/terms");

export default function Page() {
  return <Terms />;
}
