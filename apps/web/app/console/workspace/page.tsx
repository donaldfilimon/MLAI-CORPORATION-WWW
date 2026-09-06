import { ConsoleWorkspace } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/console/workspace"]!, "/console/workspace");

export default function Page() {
  return <ConsoleWorkspace />;
}
