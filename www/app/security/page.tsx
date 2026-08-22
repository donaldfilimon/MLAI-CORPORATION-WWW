import { Security } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/security"]!, "/security");

export default function Page() {
  return <Security />;
}
