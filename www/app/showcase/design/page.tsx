import { ShowcaseDesignLab } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase/design"]!, "/showcase/design");

export default function Page() {
  return <ShowcaseDesignLab />;
}
