import { Console } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/console"]!, "/console");

export default function Page() {
  return <Console />;
}
