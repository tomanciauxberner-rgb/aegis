import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://aegis-eu.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const weekly: [string, number][] = [
    ["", 1],
    ["/code-radar", 0.8],
    ["/rights-graph", 0.8],
    ["/ai-act-scenarios", 0.8],
  ];
  const monthly: [string, number][] = [
    ["/rights-graph/divergence", 0.7],
    ["/rights-graph/fria-gap", 0.7],
    ["/rights-graph/precedents", 0.7],
    ["/rights-graph/exposure", 0.6],
    ["/roadmap", 0.4],
    ["/methodology", 0.4],
    ["/legal/privacy", 0.2],
    ["/legal/terms", 0.2],
    ["/legal/notice", 0.2],
  ];

  return [
    ...weekly.map(([route, priority]) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...monthly.map(([route, priority]) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority,
    })),
  ];
}
