import { Products } from "./client";
import { routeMetadata, toNextMetadata } from "@/lib/route-meta";
export const metadata = toNextMetadata(routeMetadata["/products"]!, "/products");
export default function Page() { return <Products />; }
