import { GetStarted } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";
export const metadata = toNextMetadata(routeMetadata["/get-started"]!, "/get-started");
export default function Page() { return <GetStarted />; }
