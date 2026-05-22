import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/legal/privacy" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Privacy</Link>
            <Link href="/legal/terms" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Terms</Link>
            <Link href="/legal/notice" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Legal notice</Link>
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        {children}
      </main>
    </div>
  );
}
