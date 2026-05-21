"use client";

import { useEffect, useState } from "react";
import { Gavel, Smartphone, GraduationCap, Scale, Radar, ScanSearch, Trophy, ShieldAlert } from "lucide-react";
import { ChildrenKpiStrip } from "@/components/children/kpi-strip";
import { ChildrenRightsIndex } from "@/components/children/children-rights-index";
import { DsaMinorsTracker } from "@/components/children/dsa-minors-tracker";
import { EnforcementTab } from "@/components/children/enforcement-tab";
import { AppTab } from "@/components/children/app-tab";
import { EdtechTab } from "@/components/children/edtech-tab";
import { GdprAgeMap } from "@/components/children/gdpr-age-map";
import { PolicyTab } from "@/components/children/policy-tab";
import { TriggerScanner } from "@/components/children/trigger-scanner";
import type { OverviewResponse } from "@/types/children-ui";

type Tab = "index" | "policy" | "dsa" | "decisions" | "apps" | "edtech" | "gdpr" | "scanner";

const TABS: { key: Tab; label: string; icon: typeof Gavel; desc: string }[] = [
  { key: "index",     label: "Rights Index",      icon: Trophy,        desc: "EU-27 composite ranking" },
  { key: "policy",    label: "Forward Signal",    icon: Radar,         desc: "Action windows · deadlines" },
  { key: "dsa",       label: "DSA Minors",        icon: ShieldAlert,   desc: "Art. 28 enforcement · Commission" },
  { key: "decisions", label: "Enforcement",       icon: Gavel,         desc: "Cross-border patterns + case law" },
  { key: "apps",      label: "Compliance gaps",   icon: Smartphone,    desc: "Age-of-consent violations across EU" },
  { key: "edtech",    label: "EdTech map",        icon: GraduationCap, desc: "Annex III national systems" },
  { key: "gdpr",      label: "GDPR Art. 8",       icon: Scale,         desc: "Fragmented age of consent" },
  { key: "scanner",   label: "Trigger scanner",   icon: ScanSearch,    desc: "Regulatory trigger detection" },
];

export default function ChildrenPage() {
  const [tab, setTab] = useState<Tab>("index");
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setOverviewLoading(true);
    fetch("/api/children-v2/overview", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: OverviewResponse) => setOverview(d))
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">Children Digital Rights</h1>
          <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            EU-27 · Live
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] max-w-3xl">
          Forward intelligence on EU minors&apos; digital rights: policy signals from FRA, EDPB &amp; agencies, DPA decisions, app market exposure, EdTech AI Act classification, and fragmented GDPR Article 8 age of consent.
        </p>
      </header>

      <ChildrenKpiStrip data={overview} loading={overviewLoading} />

      <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--color-border)]">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`group inline-flex items-center gap-2 px-3 md:px-4 py-2.5 -mb-px text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-[var(--color-accent)] text-[var(--color-text)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-[var(--color-accent)]" : "text-[var(--color-text-dim)] group-hover:text-[var(--color-text-muted)]"}`} />
              <span>{t.label}</span>
              <span className="hidden md:inline text-[11px] text-[var(--color-text-dim)] font-normal">· {t.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[400px]">
        {tab === "index"     && <ChildrenRightsIndex />}
        {tab === "policy"    && <PolicyTab />}
        {tab === "dsa"       && <DsaMinorsTracker />}
        {tab === "decisions" && <EnforcementTab />}
        {tab === "apps"      && <AppTab />}
        {tab === "edtech"    && <EdtechTab />}
        {tab === "gdpr"      && <GdprAgeMap />}
        {tab === "scanner"   && <TriggerScanner />}
      </div>


    </div>
  );
}
