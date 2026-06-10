import { ShowcaseExplainer } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase/explainer"]!, "/showcase/explainer");

export default function Page() {
  return <ShowcaseExplainer />;
}
