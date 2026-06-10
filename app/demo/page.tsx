import { Demo } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/demo"]!, "/demo");

export default function Page() {
  return <Demo />;
}
