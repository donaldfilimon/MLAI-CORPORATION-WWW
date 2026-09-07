import type { MetadataRoute } from "next";
import { routes } from "@/lib/nav";
import { org } from "@/lib/brand";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${org.url}${r === "/" ? "/" : `${r}/`}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: r === "/" ? 1 : 0.7,
  }));
}
