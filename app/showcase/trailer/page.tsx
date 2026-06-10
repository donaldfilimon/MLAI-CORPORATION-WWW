import { ShowcaseTrailer } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase/trailer"]!, "/showcase/trailer");

export default function Page() {
  return <ShowcaseTrailer />;
}
