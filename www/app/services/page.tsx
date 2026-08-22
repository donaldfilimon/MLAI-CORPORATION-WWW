import { Services } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/services"]!, "/services");

export default function Page() {
  return <div className="pt-10"><Services /></div>;
}
