import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Where EU Regulators Disagree on AI — Divergence Engine",
  description:
    "Commission, EDPB, EDPS and national authorities on the record: every contradiction on the same AI question, each position linked to its source document.",
  alternates: { canonical: "/rights-graph/divergence" },
  openGraph: {
    title: "Where EU Regulators Disagree on AI — Divergence Engine",
    description:
      "Every on-record contradiction between EU regulators on AI, each position sourced.",
    url: "/rights-graph/divergence",
    type: "website",
  },
};

export default function DivergenceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
