import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/api/", "/sign-in", "/sign-up"],
    },
    sitemap: `${process.env.APP_URL || "http://127.0.0.1:3100"}/sitemap.xml`,
  };
}
