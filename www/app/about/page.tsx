import { About } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/about"]!, "/about");

export default function Page() {
  return <div className="pt-10"><About /></div>;
}
