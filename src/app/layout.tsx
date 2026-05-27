import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aegis — Fundamental Rights Intelligence for the EU AI Act",
    template: "%s | Aegis",
  },
  description:
    "Open, non-profit observatory for EU fundamental rights intelligence — grounding AI Act assessments in real FRA, Eurostat and case-law data. Built with researchers and policy experts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Aegis — Fundamental Rights Intelligence for the EU AI Act",
    description:
      "Open, non-profit observatory for EU fundamental rights intelligence — grounding AI Act assessments in real FRA, Eurostat and case-law data. Built with researchers and policy experts.",
    type: "website",
    locale: "en_EU",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,800;1,9..144,400&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
