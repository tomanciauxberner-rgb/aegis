import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rights Exposure — AI Systems × Fundamental Rights",
  description:
    "Which fundamental rights each mapped AI system touches, cross-referenced with documented incidents and sector signals. Every node sourced.",
  alternates: { canonical: "/rights-graph/exposure" },
  openGraph: {
    title: "Rights Exposure — AI Systems × Fundamental Rights",
    description:
      "The rights footprint of mapped AI systems, cross-referenced with incidents and sector signals.",
    url: "/rights-graph/exposure",
    type: "website",
  },
};

export default function ExposureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
