import { TFPoseDemo } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/tf-pose-demo"]!, "/tf-pose-demo");

export default function Page() {
  return <TFPoseDemo />;
}
