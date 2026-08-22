import { Benchmarks } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/benchmarks"]!, "/benchmarks");

export default function Page() {
  return <Benchmarks />;
}
