import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://aegis-eu.com";

export const metadata: Metadata = {
  title: "Public Code Radar — EU27 Government Open Source, Measured",
  description:
    "Who actually publishes public-sector code in Europe. National open-source catalogues polled weekly — EMBAG Art. 9, Interoperable Europe Act — every source verified before it counts.",
  alternates: { canonical: "/code-radar" },
  openGraph: {
    title: "Public Code Radar — EU27 Government Open Source, Measured",
    description:
      "National open-source catalogues polled weekly, every source verified. The follow-through on public money, public code — measured.",
    url: "/code-radar",
    type: "website",
  },
};

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Public Code Radar — EU27 public-sector open source, measured over time",
  description:
    "Weekly snapshots of national public-sector open-source catalogues across the EU27, plus Switzerland as statutory anchor (EMBAG Art. 9): repositories, organisations and forges, taken from each catalogue's own API. A source only enters the radar once its endpoint is verified.",
  url: `${BASE}/code-radar`,
  creator: {
    "@type": "Organization",
    name: "AEGIS",
    url: BASE,
  },
  isAccessibleForFree: true,
  keywords: [
    "public sector open source",
    "government code",
    "EU27",
    "EMBAG",
    "Interoperable Europe Act",
    "public money public code",
    "open data",
  ],
  temporalCoverage: "2026-07/..",
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `${BASE}/api/code-radar`,
    },
  ],
};

export default function CodeRadarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      {children}
    </>
  );
}
