import { Suspense } from "react";
import { Login } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";

export const metadata = toNextMetadata(routeMetadata["/login"]!, "/login");

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
