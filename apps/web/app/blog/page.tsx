import { Blog } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/blog"]!, "/blog");

export default function Page() {
  return <Blog />;
}
