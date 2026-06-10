import { Research } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/research"]!, "/research");

export default function Page() {
  return <div className="pt-10"><Research /></div>;
}
