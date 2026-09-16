import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const routes = ["", "/wdbx", "/abi", "/abbey", "/platform", "/services", "/research", "/architecture", "/company", "/investors", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `https://mlai.dev${r}`,
    lastModified: new Date(),
    changeFrequency: r === "" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/wdbx" || r === "/investors" ? 0.9 : 0.7,
  }));
}
