import { Team } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/team"]!, "/team");

export default function Page() {
  return <div className="pt-10"><Team /></div>;
}
