/**
 * Compliance Bridge — cross-framework mapping data.
 *
 * Source-verified crosswalk between ISO/IEC 42001:2023 and the EU AI Act
 * (Reg. 2024/1689), plus the AI Act gaps that ISO 42001 does not cover.
 *
 * Every mapping row is grounded in published crosswalk analysis and the
 * primary article text. Alignment levels are conservative: where ISO 42001
 * only partially covers an AI Act article, it is marked "partial", and the
 * AI Act obligations with no ISO 42001 equivalent are marked "gap" — because
 * ISO 42001 certification does NOT equal AI Act compliance.
 *
 * Sources (verified June 2026):
 *  - ISO/IEC 42001:2023 clause & Annex A structure
 *  - EU AI Act Arts. 9–14, 11+Annex IV, 43, 48, 49, 71, 72, 73
 *  - Published control-by-control crosswalks (Glacis, Modulos, prEN 18286 Annex D)
 */

export type Alignment = "high" | "partial" | "gap";

export interface FrameworkNode {
  code: string;
  framework: string;
  ref: string;       // clause / article identifier
  title: string;
}

export interface BridgeMapping {
  id: string;
  iso: FrameworkNode | null;   // null where the AI Act obligation has no ISO 42001 equivalent
  aiAct: FrameworkNode;
  alignment: Alignment;
  note: string;
}

/** ISO/IEC 42001:2023 clauses and Annex A controls referenced in the crosswalk. */
export const ISO_42001_NODES: Record<string, FrameworkNode> = {
  c6_1:  { code: "iso_c6_1",  framework: "ISO 42001", ref: "Clause 6.1",  title: "Actions to address risks and opportunities" },
  c6_2:  { code: "iso_c6_2",  framework: "ISO 42001", ref: "Clause 6.2 + Annex B", title: "AI objectives & data governance guidance" },
  c7_5:  { code: "iso_c7_5",  framework: "ISO 42001", ref: "Clause 7.5",  title: "Documented information" },
  c9_1:  { code: "iso_c9_1",  framework: "ISO 42001", ref: "Clause 9.1",  title: "Monitoring, measurement, analysis, evaluation" },
  a8:    { code: "iso_a8",    framework: "ISO 42001", ref: "Annex A.8",   title: "Information for interested parties / transparency" },
  a9:    { code: "iso_a9",    framework: "ISO 42001", ref: "Annex A.9",   title: "Use of AI systems / human oversight" },
};

/** EU AI Act articles referenced in the crosswalk. */
export const AI_ACT_NODES: Record<string, FrameworkNode> = {
  art9:    { code: "ai_art9",    framework: "EU AI Act", ref: "Art. 9",            title: "Risk management system" },
  art10:   { code: "ai_art10",   framework: "EU AI Act", ref: "Art. 10",           title: "Data and data governance" },
  art11:   { code: "ai_art11",   framework: "EU AI Act", ref: "Art. 11 + Annex IV", title: "Technical documentation" },
  art12:   { code: "ai_art12",   framework: "EU AI Act", ref: "Art. 12",           title: "Record-keeping / automatic logging" },
  art13:   { code: "ai_art13",   framework: "EU AI Act", ref: "Art. 13",           title: "Transparency & information to deployers" },
  art14:   { code: "ai_art14",   framework: "EU AI Act", ref: "Art. 14",           title: "Human oversight" },
  art43:   { code: "ai_art43",   framework: "EU AI Act", ref: "Art. 43",           title: "Conformity assessment" },
  art48:   { code: "ai_art48",   framework: "EU AI Act", ref: "Art. 48",           title: "CE marking" },
  art49:   { code: "ai_art49",   framework: "EU AI Act", ref: "Art. 49 + 71",      title: "Registration in EU database" },
  art72:   { code: "ai_art72",   framework: "EU AI Act", ref: "Art. 72",           title: "Post-market monitoring" },
  art73:   { code: "ai_art73",   framework: "EU AI Act", ref: "Art. 73",           title: "Serious incident reporting" },
};

export const BRIDGE_MAPPINGS: BridgeMapping[] = [
  {
    id: "m_risk",
    iso: ISO_42001_NODES.c6_1,
    aiAct: AI_ACT_NODES.art9,
    alignment: "high",
    note: "ISO 42001 risk-management processes directly support AI Act Art. 9. Enhancement: risk assessment must explicitly address health, safety and fundamental rights across the full lifecycle.",
  },
  {
    id: "m_data",
    iso: ISO_42001_NODES.c6_2,
    aiAct: AI_ACT_NODES.art10,
    alignment: "high",
    note: "Both cover data quality, bias mitigation and provenance. AI Act Art. 10 is more prescriptive (relevance, representativeness, error-free), requiring enhanced documentation.",
  },
  {
    id: "m_doc",
    iso: ISO_42001_NODES.c7_5,
    aiAct: AI_ACT_NODES.art11,
    alignment: "partial",
    note: "ISO 42001 establishes documentation practice but not the specific Annex IV format and content. Additional technical documentation is required, retained 10 years after market placement.",
  },
  {
    id: "m_log",
    iso: ISO_42001_NODES.c9_1,
    aiAct: AI_ACT_NODES.art12,
    alignment: "partial",
    note: "ISO 42001 requires monitoring but allows flexibility. Art. 12 mandates automatic event logging with traceability and retention — a technical gap requiring continuous logging infrastructure.",
  },
  {
    id: "m_transparency",
    iso: ISO_42001_NODES.a8,
    aiAct: AI_ACT_NODES.art13,
    alignment: "high",
    note: "Both emphasise transparency and explainability. AI Act Art. 13 requires specific 'instructions for use' content that may need enhancement.",
  },
  {
    id: "m_oversight",
    iso: ISO_42001_NODES.a9,
    aiAct: AI_ACT_NODES.art14,
    alignment: "high",
    note: "Strong alignment on human oversight, override and intervention. Specific documentation of override mechanisms may need enhancement.",
  },
  // ── Gaps: AI Act obligations with no ISO 42001 equivalent ──
  {
    id: "m_conformity",
    iso: null,
    aiAct: AI_ACT_NODES.art43,
    alignment: "gap",
    note: "ISO 42001 certification is management-system focused. AI Act conformity assessment evaluates the specific system; some high-risk systems require notified-body assessment — entirely separate from ISO certification.",
  },
  {
    id: "m_ce",
    iso: null,
    aiAct: AI_ACT_NODES.art48,
    alignment: "gap",
    note: "CE marking is a regulatory process with no ISO 42001 equivalent.",
  },
  {
    id: "m_register",
    iso: null,
    aiAct: AI_ACT_NODES.art49,
    alignment: "gap",
    note: "High-risk systems must be registered in the public EU database before market placement (Art. 49, 71). No ISO 42001 equivalent.",
  },
  {
    id: "m_postmarket",
    iso: null,
    aiAct: AI_ACT_NODES.art72,
    alignment: "gap",
    note: "AI Act requires a specific post-market monitoring system (Art. 72) beyond ISO 42001's management-system monitoring.",
  },
  {
    id: "m_incident",
    iso: null,
    aiAct: AI_ACT_NODES.art73,
    alignment: "gap",
    note: "Serious incident reporting to national competent authorities within statutory deadlines (Art. 73). No ISO 42001 equivalent.",
  },
];

export const COVERAGE_DISCLAIMER =
  "ISO/IEC 42001 certification does not by itself establish EU AI Act conformity. The two are complementary: ISO 42001 covers organisational AI management processes; the AI Act imposes product-level obligations, conformity assessment and enforcement. This mapping reflects published crosswalk analysis and must be validated against the current legal text before reliance.";
