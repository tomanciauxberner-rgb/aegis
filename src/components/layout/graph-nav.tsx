"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GRAPH_VIEWS = [
  { href: "/rights-graph", label: "Map" },
  { href: "/rights-graph/divergence", label: "Divergence" },
  { href: "/rights-graph/fria-gap", label: "FRIA Gap" },
  { href: "/rights-graph/exposure", label: "Exposure" },
  { href: "/rights-graph/precedents", label: "Precedents" },
];

export function GraphNav() {
  const pathname = usePathname();

  return (
    <div style={{ background: "#0d1b35", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <nav
        aria-label="Rights Graph views"
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {GRAPH_VIEWS.map((view) => {
          const isActive =
            view.href === "/rights-graph"
              ? pathname === "/rights-graph"
              : pathname.startsWith(view.href);

          return (
            <Link
              key={view.href}
              href={view.href}
              aria-current={isActive ? "page" : undefined}
              style={{
                fontSize: 13,
                padding: "14px 14px 12px",
                textDecoration: "none",
                whiteSpace: "nowrap",
                color: isActive ? "#4f7cff" : "#aaccdd",
                borderBottom: isActive ? "2px solid #4f7cff" : "2px solid transparent",
              }}
            >
              {view.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
