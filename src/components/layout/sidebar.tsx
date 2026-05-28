"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, FileCheck, Settings, LogOut, Radio, Menu, X, Baby, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/overview",    label: "Overview",       icon: LayoutDashboard },
  { href: "/signals",     label: "Signal Monitor",    icon: Radio },
  { href: "/children",    label: "Children's Rights", icon: Baby },
  { href: "/ai-act-scenarios", label: "AI Act Scenarios", icon: Scale },
  { href: "/systems",     label: "AI Systems",        icon: Cpu },
  { href: "/assessments", label: "Assessments",    icon: FileCheck },
  { href: "/settings",    label: "Settings",       icon: Settings },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4"
        style={{ background: "#071525", borderBottom: "1px solid #1e3a5f", height: 56 }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{ color: "#4a7fa5", background: "none", border: "none", cursor: "pointer" }}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <Image src="/logo.png" alt="Aegis" width={24} height={28} />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", color: "#e8eaf0" }}>AEGIS</p>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 flex flex-col z-50 transition-transform duration-300",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: "#071525", borderRight: "1px solid #1e3a5f" }}
      >
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #1e3a5f", height: 72 }}>
          <Image src="/logo.png" alt="Aegis" width={36} height={42} />
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600, letterSpacing: "0.12em", color: "#e8eaf0" }}>AEGIS</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", color: "#4a7fa5" }}>INTELLIGENCE PLATFORM</p>
          </div>
          <button
            className="md:hidden ml-auto"
            onClick={() => setMobileOpen(false)}
            style={{ color: "#4a7fa5", background: "none", border: "none", cursor: "pointer" }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "text-accent"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                )}
                style={isActive ? { background: "rgba(79,124,255,0.12)", color: "#4f7cff" } : {}}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span style={{ fontSize: 15, fontWeight: isActive ? 500 : 400 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: "1px solid #1e3a5f", padding: "12px 16px" }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 12, color: "#4a7fa5", fontFamily: "var(--font-mono)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </span>
            <button onClick={handleSignOut} title="Sign out" style={{ color: "#4a7fa5", background: "none", border: "none", cursor: "pointer" }}>
              <LogOut className="w-4 h-4 hover:text-danger" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
