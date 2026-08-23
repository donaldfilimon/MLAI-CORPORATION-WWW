import { Home } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/"]!, "/");

export default function Page() {
  return <Home />;
}
