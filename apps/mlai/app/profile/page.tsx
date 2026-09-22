import { Profile } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/profile"]!, "/profile");

export default function Page() {
  return <Profile />;
}
