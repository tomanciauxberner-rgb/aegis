"use client";

import { useState, useEffect, useRef } from "react";
import { Radio, Filter, ExternalLink, AlertTriangle, TrendingUp, Globe, Map, FileText, X, Loader2, Download, Copy, Check } from "lucide-react";
import { RiskDataPanel } from "@/components/fria/risk-data-panel";
import { EuMap, type CountryData } from "@/components/signals/eu-map";
import { EarlyWarningPanel } from "@/components/signals/early-warning-panel";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" }, { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" }, { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
];

const POPULATIONS = [
  { code: "african_descent", label: "People of African descent" },
  { code: "roma", label: "Roma" },
  { code: "muslims", label: "Muslims" },
  { code: "lgbtiq", label: "LGBTIQ people" },
  { code: "north_african", label: "North African immigrants" },
  { code: "turkish", label: "Turkish immigrants" },
  { code: "non_eu_born", label: "Non-EU born population" },
];

const MAP_INDICATORS = [
  { code: "disc_employment_5y", label: "Employment discrimination (5y) — FRA", population: "african_descent", topic: "discrimination" },
  { code: "black_disc_employment_5y", label: "Employment discrim. — African descent (2023)", population: "african_descent", topic: "discrimination" },
  { code: "roma_disc_employment", label: "Employment discrim. — Roma (2024)", population: "roma", topic: "discrimination" },
  { code: "roma_disc_housing", label: "Housing discrim. — Roma (2024)", population: "roma", topic: "discrimination" },
  { code: "roma_poverty_rate", label: "At-risk-of-poverty — Roma (2024)", population: "roma", topic: "discrimination" },
  { code: "roma_school_segregation", label: "School segregation — Roma (2024)", population: "roma", topic: "discrimination" },
  { code: "disc_lgbtiq_employment", label: "Employment discrim. — LGBTIQ", population: "lgbtiq", topic: "discrimination" },
  { code: "antisemitic_incidents", label: "Antisemitic incidents — Jews (2024)", population: "jews", topic: "discrimination" },
  { code: "trust_police", label: "Trust in police (general population)", population: "general", topic: "discrimination" },
  { code: "black_racial_profiling", label: "Racial profiling — African descent", population: "african_descent", topic: "discrimination" },
  { code: "lgbtiq_harassment_12m", label: "Harassment — LGBTIQ (12m)", population: "lgbtiq", topic: "discrimination" },
  { code: "employment_rate_non_eu_born", label: "Employment rate — Non-EU born (Eurostat 2024)", population: "non_eu_born", topic: "discrimination" },
  { code: "unemployment_rate_non_eu_born", label: "Unemployment rate — Non-EU born (Eurostat 2024)", population: "non_eu_born", topic: "discrimination" },
];

const INCIDENTS = [
  {
    id: "NL-SYRI", country: "NL", flag: "🇳🇱",
    title: "SyRI welfare fraud system ruled rights violation",
    sector: "Social benefits", groups: ["Migrants", "Low-income"],
    severity: "critical" as const, date: "Feb 2020",
    summary: "District Court of The Hague ruled the Dutch SyRI profiling system violated Article 8 ECHR. Disproportionately targeted low-income and migrant neighborhoods.",
    source: "AlgorithmWatch / District Court The Hague",
    url: "https://algorithmwatch.org/en/syri-case-the-hague/",
  },
  {
    id: "FR-CAF", country: "FR", flag: "🇫🇷",
    title: "CAF algorithm flags 13M households — bias against disabled & single mothers",
    sector: "Social benefits", groups: ["Disabilities", "Women"],
    severity: "critical" as const, date: "Jun 2023",
    summary: "France's family benefits authority used an AI scoring system biased against people with disabilities, single mothers, and low-income individuals.",
    source: "AlgorithmWatch / Lighthouse Reports",
    url: "https://algorithmwatch.org/en/press-release-reporting-form-collect-cases/",
  },
  {
    id: "FR-META", country: "FR", flag: "🇫🇷",
    title: "Facebook job ads algorithm ruled discriminatory by Défenseur des Droits",
    sector: "Employment", groups: ["Women"],
    severity: "high" as const, date: "Mar 2024",
    summary: "Meta's ad distribution algorithm showed job ads to heavily gender-skewed audiences without advertiser intent, reinforcing occupational stereotypes.",
    source: "Défenseur des Droits (France)",
    url: "https://www.defenseurdesdroits.fr/",
  },
  {
    id: "PL-UNEMPLOYMENT", country: "PL", flag: "🇵🇱",
    title: "Poland unemployment scoring system scrapped after discrimination concerns",
    sector: "Employment", groups: ["Women", "Migrants"],
    severity: "high" as const, date: "Apr 2019",
    summary: "AI-based unemployment scoring systematically disadvantaged women and migrants in allocating employment support resources.",
    source: "AlgorithmWatch",
    url: "https://algorithmwatch.org/en/poland-government-to-scrap-controversial-unemployment-scoring-system/",
  },
  {
    id: "NL-CHILDCARE", country: "NL", flag: "🇳🇱",
    title: "Dutch childcare benefits scandal — algorithmic mass fraud accusations",
    sector: "Social benefits", groups: ["Migrants", "African descent"],
    severity: "critical" as const, date: "2019–2021",
    summary: "Dutch tax authority's algorithm falsely accused thousands of families of fraud, disproportionately targeting dual nationality and migrant families.",
    source: "Amnesty International / Parliamentary Inquiry",
    url: "https://www.amnesty.org/en/documents/eur35/4286/2021/en/",
  },
];

const SEVERITY_BADGE: Record<string, string> = {
  critical: "text-danger bg-danger-soft border border-danger/30",
  high: "text-gold bg-gold-soft border border-gold/30",
  medium: "text-accent bg-accent-soft border border-accent/30",
};

const DATA_SOURCES = [
  { label: "Roma Survey 2024 — Rights of Roma and Travellers in 13 Countries", year: "2024", url: "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2025/roma-survey-2024" },
  { label: "Being Black in the EU", year: "2023", url: "https://fra.europa.eu/en/publication/2023/being-black-eu" },
  { label: "EU LGBTIQ Survey III", year: "2024", url: "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2024/eu-lgbtiq-survey-iii" },
  { label: "Jewish Experiences & Perceptions of Antisemitism", year: "2024", url: "https://fra.europa.eu/en/publication/2024/antisemitism-overview-2024" },
  { label: "Being Muslim in the EU", year: "2023", url: "https://fra.europa.eu/en/publication/2023/being-muslim-eu" },
  { label: "Fundamental Rights Report 2025", year: "2025", url: "https://fra.europa.eu/en/publication/2025/fundamental-rights-report-2025-fra-opinions" },
  { label: "Eurostat LFS — Employment by country of birth", year: "2024", url: "https://ec.europa.eu/eurostat/web/microdata/european-union-labour-force-survey" },
];

function BriefingPanel({ countryCode, countryName, onClose }: {
  countryCode: string;
  countryName: string;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setContent("");
    setLoading(true);
    setError("");

    async function stream() {
      try {
        const res = await fetch(`/api/digest/${countryCode}`);
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        setLoading(false);
        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          setContent((prev) => prev + decoder.decode(value, { stream: true }));
        }
      } catch (e: any) {
        if (!cancelled) {
          setLoading(false);
          setError(e.message ?? "Failed to generate briefing");
        }
      }
    }
    stream();
    return () => { cancelled = true; };
  }, [countryCode]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegis-briefing-${countryCode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const date = new Date().toISOString().slice(0, 10);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Aegis Briefing — ${countryName} — ${date}</title>
<style>
  @page { margin: 2cm; }
  body { font-family: Georgia, serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; max-width: 700px; margin: 0 auto; }
  h2 { font-size: 16pt; font-weight: bold; margin-top: 0; border-bottom: 2px solid #1a1a1a; padding-bottom: 6px; }
  h3 { font-size: 10pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #555; margin-top: 20px; margin-bottom: 6px; }
  ul { padding-left: 18px; margin: 6px 0; }
  li { margin-bottom: 6px; }
  strong { font-weight: bold; }
  hr { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
  em { color: #666; font-size: 9pt; }
  .footer { font-size: 8pt; color: #999; margin-top: 24px; border-top: 1px solid #eee; padding-top: 8px; }
</style>
</head><body>
${renderMarkdown(content).replace(/class="[^"]*"/g, "")}
<div class="footer">Generated by Aegis Signal Monitor · ${date} · Not for publication without verification</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-text mt-6 mb-2 font-[family-name:var(--font-display)]">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-accent uppercase tracking-widest mt-5 mb-2 font-[family-name:var(--font-mono)]">$1</h3>')
      .replace(/^\*(.+)\*$/gm, '<p class="text-base text-text-dim italic mb-3">$1</p>')
      .replace(/^---$/gm, '<hr class="border-border my-4"/>')
      .replace(/^\- (.+)$/gm, '<li class="text-base text-text-muted leading-relaxed mb-1.5 pl-1">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="space-y-0.5 mb-3 list-disc list-inside">$&</ul>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-text font-semibold">$1</strong>')
      .replace(/\n\n/g, '<br/>')
      .replace(/\n/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-xl h-[calc(100vh-2rem)] bg-bg border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ background: "#080a14" }}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-base font-semibold text-text">
              Intelligence Briefing — {countryName}
            </span>
            {loading && <Loader2 className="w-3.5 h-3.5 text-text-dim animate-spin" />}
          </div>
          <div className="flex items-center gap-2">
            {content && !loading && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-base text-text-dim hover:text-text border border-border rounded transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-base text-text-dim hover:text-text border border-border rounded transition-colors"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </button>
                <button
                  onClick={handleDownloadMd}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-base text-text-dim hover:text-text border border-border rounded transition-colors"
                >
                  .md
                </button>
              </>
            )}
            <button onClick={onClose} className="text-text-dim hover:text-text transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4" ref={contentRef}>
          {loading && !content && (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <p className="text-base text-text-muted">Fetching {countryName} indicators + EU averages…</p>
            </div>
          )}

          {error && (
            <div className="bg-danger-soft border border-danger/30 rounded-lg p-4">
              <p className="text-base text-danger font-medium">Error: {error}</p>
            </div>
          )}

          {content && (
            <div
              className="prose-aegis text-text"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}

          {!content && !loading && !error && (
            <p className="text-base text-text-muted">No content received.</p>
          )}
        </div>

        <div className="px-5 py-2.5 border-t border-border flex-shrink-0">
          <p className="text-base text-text-dim font-[family-name:var(--font-mono)]">
            Generated by Aegis · Powered by Anthropic Claude · Data: FRA surveys + Eurostat · Not for publication without verification
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignalsPage() {
  const [countryCode, setCountryCode] = useState("");
  const [populationCode, setPopulationCode] = useState("");
  const [mapIndicator, setMapIndicator] = useState(MAP_INDICATORS[0].code);
  const [mapData, setMapData] = useState<CountryData[]>([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [briefingOpen, setBriefingOpen] = useState(false);

  const selectedCountryName = COUNTRIES.find((c) => c.code === countryCode)?.name ?? "";

  useEffect(() => {
    async function loadMapData() {
      setMapLoading(true);
      try {
        const ind = MAP_INDICATORS.find((i) => i.code === mapIndicator)!;
        const params = new URLSearchParams({ topic: ind.topic, population: ind.population });
        const res = await fetch(`/api/indicators?${params}`);
        if (!res.ok) throw new Error();
        const json = await res.json();

        const byCountry: Record<string, number> = {};
        for (const row of json.data) {
          if (row.indicator.code === mapIndicator && row.country?.code) {
            byCountry[row.country.code] = row.value;
          }
        }

        setMapData(COUNTRIES.map((c) => ({
          code: c.code,
          name: c.name,
          value: byCountry[c.code] ?? null,
          indicator: MAP_INDICATORS.find((i) => i.code === mapIndicator)?.label ?? "",
          indicatorCode: mapIndicator,
        })));
      } catch {
        setMapData(COUNTRIES.map((c) => ({ code: c.code, name: c.name, value: null, indicator: "", indicatorCode: mapIndicator })));
      } finally {
        setMapLoading(false);
      }
    }
    loadMapData();
  }, [mapIndicator]);

  useEffect(() => {
    if (!countryCode) setBriefingOpen(false);
  }, [countryCode]);

  const filteredIncidents = INCIDENTS.filter((inc) => {
    if (countryCode && inc.country !== countryCode) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {briefingOpen && countryCode && (
        <BriefingPanel
          countryCode={countryCode}
          countryName={selectedCountryName}
          onClose={() => setBriefingOpen(false)}
        />
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-accent" />
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Signal Monitor
            </h1>
          </div>
          <p className="text-base text-text-muted">
            Discrimination patterns and algorithmic incidents across the EU —{" "}
            <span className="text-text-dim">data: FRA surveys + Eurostat + documented cases</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {countryCode && (
            <button
              onClick={() => setBriefingOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded-lg text-base font-bold hover:bg-accent/90 transition-colors shadow-lg"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate briefing — {selectedCountryName}
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-soft border border-success/20 rounded text-base text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live data
          </div>
        </div>
      </div>

      <EarlyWarningPanel onSelectCountry={(code) => setCountryCode(code)} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-accent" />
            <span className="text-base font-semibold uppercase tracking-wider text-text-dim font-[family-name:var(--font-mono)]">
              EU27 Overview
            </span>
          </div>
          <select
            value={mapIndicator}
            onChange={(e) => setMapIndicator(e.target.value)}
            className="px-3 py-1.5 bg-surface border border-border rounded text-base text-text focus:outline-none focus:border-accent transition-colors"
          >
            {MAP_INDICATORS.map((ind) => (
              <option key={ind.code} value={ind.code}>{ind.label}</option>
            ))}
          </select>
        </div>

        <div className={cn("transition-opacity duration-300", mapLoading && "opacity-50")}>
          <EuMap
            data={mapData}
            selectedCountry={countryCode}
            onSelect={(code) => setCountryCode(code === countryCode ? "" : code)}
            title={MAP_INDICATORS.find((i) => i.code === mapIndicator)?.label}
            indicatorCode={mapIndicator}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg">
        <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
        <select
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="flex-1 px-3 py-2 bg-bg border border-border rounded text-base text-text focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        <select
          value={populationCode}
          onChange={(e) => setPopulationCode(e.target.value)}
          className="flex-1 px-3 py-2 bg-bg border border-border rounded text-base text-text focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All populations</option>
          {POPULATIONS.map((p) => (
            <option key={p.code} value={p.code}>{p.label}</option>
          ))}
        </select>
        {(countryCode || populationCode) && (
          <button
            onClick={() => { setCountryCode(""); setPopulationCode(""); }}
            className="px-3 py-2 text-base text-text-muted hover:text-text border border-border rounded transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="text-base font-semibold uppercase tracking-wider text-text-dim font-[family-name:var(--font-mono)]">
              FRA Survey Data
            </h2>
          </div>

          {countryCode ? (
            <RiskDataPanel countryCode={countryCode} populationCode={populationCode || undefined} />
          ) : (
            <div className="bg-surface border border-border rounded-lg p-10 text-center">
              <Globe className="w-8 h-8 text-text-dim mx-auto mb-3" />
              <p className="text-base font-medium text-text mb-1">Select a country</p>
              <p className="text-base text-text-muted">
                Click a country on the map or use the filter above
              </p>
            </div>
          )}

          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            <p className="text-base font-semibold text-text-dim uppercase tracking-wider font-[family-name:var(--font-mono)]">
              Data sources
            </p>
            {DATA_SOURCES.map((src) => (
              <a key={src.label} href={src.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between group hover:text-accent transition-colors">
                <span className="text-base text-text-muted group-hover:text-accent transition-colors">{src.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base text-text-dim font-[family-name:var(--font-mono)]">{src.year}</span>
                  <ExternalLink className="w-3 h-3 text-text-dim group-hover:text-accent transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gold" />
              <h2 className="text-base font-semibold uppercase tracking-wider text-text-dim font-[family-name:var(--font-mono)]">
                Documented Incidents
              </h2>
            </div>
            <span className="text-base text-text-dim font-[family-name:var(--font-mono)]">
              {filteredIncidents.length} / {INCIDENTS.length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((inc) => (
              <div key={inc.id} className="bg-surface border border-border rounded-lg p-5 hover:border-border-accent transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-lg leading-none mt-0.5">{inc.flag}</span>
                    <p className="text-base font-semibold text-text leading-snug">{inc.title}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded text-base font-bold uppercase tracking-wider flex-shrink-0", SEVERITY_BADGE[inc.severity])}>
                    {inc.severity}
                  </span>
                </div>
                <p className="text-base text-text-muted leading-relaxed mb-3">{inc.summary}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base px-2 py-0.5 bg-surface-2 border border-border rounded text-text-dim font-[family-name:var(--font-mono)]">
                      {inc.sector}
                    </span>
                    {inc.groups.map((g) => (
                      <span key={g} className="text-base px-2 py-0.5 bg-surface-2 border border-border rounded text-text-dim">{g}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base text-text-dim font-[family-name:var(--font-mono)]">{inc.date}</span>
                    <a href={inc.url} target="_blank" rel="noopener noreferrer" className="text-text-dim hover:text-accent transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className="text-base text-text-dim mt-2 font-[family-name:var(--font-mono)]">Source: {inc.source}</p>
              </div>
            ))}

            {filteredIncidents.length === 0 && (
              <div className="bg-surface border border-border rounded-lg p-8 text-center">
                <p className="text-base text-text-muted">No incidents found for this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
