import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Act Risk Classification, Reasoned and Cited — Scenario Engine",
  description:
    "Classify your AI system under the EU AI Act: Annex III high-risk areas, the Article 6(3) exception, Digital Omnibus deadlines. Every conclusion cites the articles it relies on.",
  alternates: { canonical: "/ai-act-scenarios" },
  openGraph: {
    title: "AI Act Risk Classification, Reasoned and Cited — Scenario Engine",
    description:
      "Classify your AI system under the EU AI Act: Annex III, Article 6(3), Omnibus deadlines — every conclusion cited.",
    url: "/ai-act-scenarios",
    type: "website",
  },
};

export default function ScenariosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
