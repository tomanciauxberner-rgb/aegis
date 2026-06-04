/**
 * Compliance Bridge — regulatory version diff data.
 *
 * Tracks amendments between the EU AI Act as adopted (Reg. 2024/1689,
 * OJ 13 June 2024) and the Digital Omnibus on AI amendments
 * (provisional political agreement, 7 May 2026).
 *
 * IMPORTANT STATUS: as of June 2026 the Omnibus is a PROVISIONAL political
 * agreement — not yet formally adopted or published in the Official Journal.
 * Each change carries its status so the diff never presents pending text as law.
 *
 * Sources (verified June 2026): Orrick, Gibson Dunn, Hogan Lovells, White & Case,
 * Inside Privacy, DLA Piper summaries of the 7 May 2026 trilogue agreement.
 */

export type ChangeKind = "added" | "removed" | "modified";
export type ChangeStatus = "in_force" | "provisional_agreement" | "proposed";

export interface RegulatoryChange {
  id: string;
  kind: ChangeKind;
  status: ChangeStatus;
  article: string;
  title: string;
  before: string | null;   // null for purely added provisions
  after: string | null;    // null for removed provisions
  impact: string;
}

export interface RegulatoryVersion {
  code: string;
  label: string;
  date: string;
  description: string;
}

export const AI_ACT_VERSIONS: { from: RegulatoryVersion; to: RegulatoryVersion } = {
  from: {
    code: "ai_act_2024",
    label: "EU AI Act (as adopted)",
    date: "2024-06-13",
    description: "Regulation (EU) 2024/1689, Official Journal version of 13 June 2024.",
  },
  to: {
    code: "ai_act_omnibus_2026",
    label: "AI Act + Digital Omnibus",
    date: "2026-05-07",
    description: "Provisional political agreement on the Digital Omnibus on AI, 7 May 2026 — pending formal adoption and OJ publication.",
  },
};

export const AI_ACT_CHANGES: RegulatoryChange[] = [
  {
    id: "chg_hr_annex3_deadline",
    kind: "modified",
    status: "provisional_agreement",
    article: "Art. 113 / Annex III timeline",
    title: "High-risk (Annex III) obligations deadline",
    before: "Obligations for stand-alone Annex III high-risk systems apply from 2 August 2026.",
    after: "Deferred to 2 December 2027.",
    impact: "Deployers and providers of use-case high-risk systems (employment, education, essential services, etc.) gain ~16 months, but the obligations themselves are unchanged.",
  },
  {
    id: "chg_hr_annex1_deadline",
    kind: "modified",
    status: "provisional_agreement",
    article: "Art. 113 / Annex I timeline",
    title: "High-risk (Annex I, regulated products) deadline",
    before: "Obligations for Annex I product-embedded high-risk AI apply from 2 August 2027.",
    after: "Deferred to 2 August 2028.",
    impact: "AI embedded in products under existing EU sectoral legislation gets a later, separate deadline.",
  },
  {
    id: "chg_art10_biasdata",
    kind: "modified",
    status: "provisional_agreement",
    article: "Art. 10(5)",
    title: "Special-category data for bias detection",
    before: "Processing of special-category data for bias detection available to providers of high-risk systems only.",
    after: "Extended to deployers, under a strict-necessity standard with mandatory safeguards (subsidiarity vs synthetic data, pseudonymisation, access controls, no onward sharing, timely deletion).",
    impact: "Broader lawful basis for bias mitigation, but tightly conditioned; creates no obligation to perform bias detection.",
  },
  {
    id: "chg_art5_nudifiers",
    kind: "added",
    status: "provisional_agreement",
    article: "Art. 5 (new prohibition)",
    title: "AI-generated non-consensual intimate imagery & CSAM",
    before: null,
    after: "New prohibition targeting AI systems enabling generation of non-consensual intimate imagery ('nudifiers') and child sexual abuse material.",
    impact: "Adds a new Article 5 prohibited practice — top-tier penalty exposure under Art. 99(3).",
  },
  {
    id: "chg_smc_category",
    kind: "added",
    status: "provisional_agreement",
    article: "Definitions / burden relief",
    title: "Small mid-cap enterprise (SMC) category",
    before: null,
    after: "New 'small mid-cap' category introduced to extend administrative-burden relief beyond SMEs.",
    impact: "Proportionality measures (e.g. simplified documentation) reach a wider band of mid-sized organisations.",
  },
  {
    id: "chg_art6_3_register",
    kind: "added",
    status: "provisional_agreement",
    article: "Art. 6(3) / Art. 49",
    title: "Registration of self-exempted systems reinstated",
    before: null,
    after: "Providers considering their system exempt from high-risk classification under Art. 6(3) must still register it in the EU database.",
    impact: "Closes a transparency gap: self-assessed exemptions become publicly visible.",
  },
  {
    id: "chg_ai_office_role",
    kind: "modified",
    status: "provisional_agreement",
    article: "Governance",
    title: "Strengthened AI Office role",
    before: "AI Office coordination role as set in the 2024 text.",
    after: "Stronger central role for the AI Office in determining when parts of the regime become operational, plus governance refinements.",
    impact: "More centralised steering of the regime's operational timing; companies depend on secondary measures still to be finalised.",
  },
];

export const VERSION_DIFF_DISCLAIMER =
  "The Digital Omnibus on AI is a provisional political agreement (7 May 2026). It takes legal effect only upon formal adoption and publication in the Official Journal. Until then, the AI Act as adopted in 2024 remains the law in force, and 2 August 2026 stays an active compliance date for provisions not deferred. Verify against the final text before reliance.";
