import type { MetadataRoute } from "next";
import { publicationPaths } from "@/content/research";
import { pages } from "@/content/pages";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "http://127.0.0.1:3100";
  return [
    "",
    "docs",
    "research",
    "contact",
    ...Object.keys(pages),
    ...publicationPaths,
  ].map((path) => ({
    url: `${base}/${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.6 : 1,
  }));
}
