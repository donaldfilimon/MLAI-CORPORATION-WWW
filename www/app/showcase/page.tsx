import { Showcase } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase"]!, "/showcase");

export default function Page() {
  return <Showcase />;
}
