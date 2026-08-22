import { Privacy } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/privacy"]!, "/privacy");

export default function Page() {
  return <Privacy />;
}
