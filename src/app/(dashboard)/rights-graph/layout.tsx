import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EU High-Risk AI Systems, Mapped — Unified Rights Graph",
  description:
    "A sourced registry of real AI systems deployed across the EU: what they do, who runs them, the fundamental rights they touch, and whether a FRIA is publicly known.",
  alternates: { canonical: "/rights-graph" },
  openGraph: {
    title: "EU High-Risk AI Systems, Mapped — Unified Rights Graph",
    description:
      "Real AI systems deployed across the EU — rights touched, FRIA status, every entry sourced.",
    url: "/rights-graph",
    type: "website",
  },
};

export default function RightsGraphLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
