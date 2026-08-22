import { Changelog } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/changelog"]!, "/changelog");

export default function Page() {
  return <Changelog />;
}
