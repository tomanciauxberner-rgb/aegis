import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://aegis-eu.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/login",
          "/register",
          "/overview",
          "/systems",
          "/assessments",
          "/settings",
          "/signals",
          "/children",
          "/compliance-bridge",
          "/compliance-dna",
          "/fria-studio",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
