import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Act Case Law by Sector — Rights Precedent System",
  description:
    "CJEU, ECHR, DPA and national rulings matched to each regulatory sector, with the holding and its binding force. Every ruling sourced.",
  alternates: { canonical: "/rights-graph/precedents" },
  openGraph: {
    title: "AI Act Case Law by Sector — Rights Precedent System",
    description:
      "Binding and persuasive case law for AI deployments, matched by sector — CJEU, ECHR, DPA, national courts.",
    url: "/rights-graph/precedents",
    type: "website",
  },
};

export default function PrecedentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
