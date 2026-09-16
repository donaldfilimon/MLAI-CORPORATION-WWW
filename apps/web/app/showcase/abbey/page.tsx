import { ShowcaseAbbey } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase/abbey"]!, "/showcase/abbey");

export default function Page() {
  return <ShowcaseAbbey />;
}
