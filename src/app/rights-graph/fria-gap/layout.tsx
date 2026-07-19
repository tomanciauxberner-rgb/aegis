import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The FRIA Gap — High-Risk AI Without Impact Assessments",
  description:
    "How many high-risk AI systems in the EU have a publicly identifiable Article 27 Fundamental Rights Impact Assessment — and how many don't. Sample size always shown.",
  alternates: { canonical: "/rights-graph/fria-gap" },
  openGraph: {
    title: "The FRIA Gap — High-Risk AI Without Impact Assessments",
    description:
      "Article 27 FRIA coverage among mapped high-risk AI systems — measured from sourced entries only.",
    url: "/rights-graph/fria-gap",
    type: "website",
  },
};

export default function FriaGapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
