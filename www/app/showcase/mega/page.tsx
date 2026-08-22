import { ShowcaseMega } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase/mega"]!, "/showcase/mega");

export default function Page() {
  return <ShowcaseMega />;
}
