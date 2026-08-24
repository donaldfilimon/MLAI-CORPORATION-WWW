import { Docs } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/docs"]!, "/docs");

export default function Page() {
  return <Docs />;
}
