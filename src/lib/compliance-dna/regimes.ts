/**
 * Compliance DNA — regulatory regimes with real, source-verified penalty ceilings.
 * Every figure is traced to the specific article that sets it.
 * Methodology principle: exposure is never invented — it is bounded by the
 * statutory ceilings of the applicable regime, scaled by the share of
 * obligations left unevidenced. Voluntary standards (ISO 42001) carry no fine.
 *
 * Sources (verified June 2026):
 *  - AI Act Art. 99 (Reg. 2024/1689)
 *  - GDPR Art. 83 (Reg. 2016/679)
 *  - NIS2 Art. 34 (Dir. 2022/2555)
 *  - DORA Art. 50 (Reg. 2022/2554) — no fixed EU-level ceiling
 *  - CRA Art. 64 (Reg. 2024/2847)
 *  - ISO/IEC 42001:2023 — voluntary management-system standard
 */

export type LegalForce = "binding_regulation" | "binding_directive" | "voluntary_standard";

export interface PenaltyTier {
  code: string;
  label: string;
  fixedCeilingEur: number | null;   // null where no fixed EU-level ceiling exists
  turnoverPct: number | null;       // percentage of worldwide annual turnover
  rule: "higher_of" | "lower_of_for_sme" | "national_discretion";
  appliesTo: string;                // which obligations trigger this tier
  article: string;
}

export interface ComplianceRegime {
  code: string;
  name: string;
  instrument: string;
  legalForce: LegalForce;
  penaltyArticle: string;
  hasFinancialPenalty: boolean;
  tiers: PenaltyTier[];
  smeRule?: string;
  note?: string;
  sourceUrl: string;
}

export const COMPLIANCE_REGIMES: ComplianceRegime[] = [
  {
    code: "ai_act",
    name: "EU AI Act",
    instrument: "Regulation (EU) 2024/1689",
    legalForce: "binding_regulation",
    penaltyArticle: "Art. 99",
    hasFinancialPenalty: true,
    tiers: [
      { code: "ai_t1", label: "Prohibited practices", fixedCeilingEur: 35_000_000, turnoverPct: 7, rule: "higher_of", appliesTo: "Art. 5 prohibited AI practices", article: "Art. 99(3)" },
      { code: "ai_t2", label: "High-risk & operator obligations", fixedCeilingEur: 15_000_000, turnoverPct: 3, rule: "higher_of", appliesTo: "Provider (Art. 16), deployer (Art. 26), transparency (Art. 50), notified bodies", article: "Art. 99(4)" },
      { code: "ai_t3", label: "Incorrect information to authorities", fixedCeilingEur: 7_500_000, turnoverPct: 1, rule: "higher_of", appliesTo: "Misleading information to notified bodies / authorities", article: "Art. 99(5)" },
    ],
    smeRule: "For SMEs and start-ups, the fine is the LOWER of the fixed amount or the percentage (Art. 99(6)).",
    sourceUrl: "https://artificialintelligenceact.eu/article/99/",
  },
  {
    code: "gdpr",
    name: "GDPR",
    instrument: "Regulation (EU) 2016/679",
    legalForce: "binding_regulation",
    penaltyArticle: "Art. 83",
    hasFinancialPenalty: true,
    tiers: [
      { code: "gdpr_t1", label: "Core principles & data-subject rights", fixedCeilingEur: 20_000_000, turnoverPct: 4, rule: "higher_of", appliesTo: "Art. 5, 6, 9 (lawfulness, consent, special categories), data-subject rights", article: "Art. 83(5)" },
      { code: "gdpr_t2", label: "Controller / processor obligations", fixedCeilingEur: 10_000_000, turnoverPct: 2, rule: "higher_of", appliesTo: "Art. 8, 25, 32 (child consent, privacy by design, security)", article: "Art. 83(4)" },
    ],
    sourceUrl: "https://gdpr-info.eu/art-83-gdpr/",
  },
  {
    code: "nis2",
    name: "NIS2",
    instrument: "Directive (EU) 2022/2555",
    legalForce: "binding_directive",
    penaltyArticle: "Art. 34",
    hasFinancialPenalty: true,
    tiers: [
      { code: "nis2_essential", label: "Essential entities", fixedCeilingEur: 10_000_000, turnoverPct: 2, rule: "higher_of", appliesTo: "Risk-management & reporting (Art. 21, 23) — energy, transport, health, digital infrastructure", article: "Art. 34(4)" },
      { code: "nis2_important", label: "Important entities", fixedCeilingEur: 7_000_000, turnoverPct: 1.4, rule: "higher_of", appliesTo: "Same obligations, important-entity classification", article: "Art. 34(5)" },
    ],
    note: "Directive — ceilings are minimum harmonised maxima; Member States transpose and may exceed them.",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
  },
  {
    code: "dora",
    name: "DORA",
    instrument: "Regulation (EU) 2022/2554",
    legalForce: "binding_regulation",
    penaltyArticle: "Art. 50",
    hasFinancialPenalty: true,
    tiers: [
      { code: "dora_national", label: "Administrative penalties", fixedCeilingEur: null, turnoverPct: null, rule: "national_discretion", appliesTo: "ICT risk management, incident reporting, resilience testing", article: "Art. 50" },
    ],
    note: "DORA sets no fixed EU-level monetary ceiling for financial entities; penalties are determined by national competent authorities and must be effective, proportionate and dissuasive. Periodic penalty payments for critical ICT third-party providers can reach 1% of average daily worldwide turnover (Art. 35(6)).",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj",
  },
  {
    code: "cra",
    name: "Cyber Resilience Act",
    instrument: "Regulation (EU) 2024/2847",
    legalForce: "binding_regulation",
    penaltyArticle: "Art. 64",
    hasFinancialPenalty: true,
    tiers: [
      { code: "cra_t1", label: "Essential cybersecurity requirements", fixedCeilingEur: 15_000_000, turnoverPct: 2.5, rule: "higher_of", appliesTo: "Annex I essential requirements + manufacturer obligations (Art. 13, 14)", article: "Art. 64(2)" },
      { code: "cra_t2", label: "Other operator obligations", fixedCeilingEur: 10_000_000, turnoverPct: 2, rule: "higher_of", appliesTo: "Importers, distributors, conformity assessment, CE marking", article: "Art. 64(3)" },
      { code: "cra_t3", label: "Incorrect information", fixedCeilingEur: 5_000_000, turnoverPct: 1, rule: "higher_of", appliesTo: "Misleading information to authorities / notified bodies", article: "Art. 64(4)" },
    ],
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/2847/oj",
  },
  {
    code: "iso_42001",
    name: "ISO/IEC 42001",
    instrument: "ISO/IEC 42001:2023",
    legalForce: "voluntary_standard",
    penaltyArticle: "—",
    hasFinancialPenalty: false,
    tiers: [],
    note: "Voluntary AI management-system standard. Non-conformity carries no administrative fine; the consequence is loss or denial of certification, not a penalty. Included for coverage mapping, never for fine estimation.",
    sourceUrl: "https://www.iso.org/standard/81230.html",
  },
];

export function getRegime(code: string): ComplianceRegime | undefined {
  return COMPLIANCE_REGIMES.find((r) => r.code === code);
}

export function regimesWithPenalty(): ComplianceRegime[] {
  return COMPLIANCE_REGIMES.filter((r) => r.hasFinancialPenalty);
}
