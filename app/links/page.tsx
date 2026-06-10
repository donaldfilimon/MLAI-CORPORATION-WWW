import { Links } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/links"]!, "/links");

export default function Page() {
  return <Links />;
}
