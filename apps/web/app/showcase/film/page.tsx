import { ShowcaseFilm } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/showcase/film"]!, "/showcase/film");

export default function Page() {
  return <ShowcaseFilm />;
}
