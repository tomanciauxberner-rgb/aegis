import type { RssItem } from "@/types/children-v2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

export type PolicySignalType =
  | "research_project" | "opinion_or_guidance"
  | "consultation_open" | "consultation_closed"
  | "bill_introduced" | "bill_adopted"
  | "parliamentary_question" | "position_paper"
  | "work_programme" | "stakeholder_event";

export type PolicySignalStatus =
  | "upcoming" | "open" | "in_progress" | "closed" | "adopted" | "withdrawn";

export interface PolicySignalExtracted {
  external_id: string;
  signal_type: PolicySignalType;
  status: PolicySignalStatus;
  title_original: string;
  title_en: string;
  summary_en: string;
  signal_date: string;
  deadline_date: string | null;
  jurisdiction: string;
  country_codes: string[];
  themes: string[];
  legal_frameworks: string[];
  relevance_score: number;
  why_it_matters: string;
  stakeholders: string[];
  source_url: string;
  affects_minors: boolean;
}

const SYSTEM_PROMPT = `You are a senior EU policy analyst monitoring upstream signals affecting minors' digital rights, AI Act implementation for children, and online safety frameworks.

You receive items from official EU sources (FRA, EDPB, EDPS, European Commission, etc.) and must extract ONLY signals relevant to children/minors' digital rights, online safety, AI Act impacts on minors, or related fundamental rights matters.

STRICT INCLUSION — keep an item if it touches:
- Minors' digital rights, online safety, age verification, parental consent
- AI Act implementation affecting children (education, behavioral assessment, profiling)
- Children's protection from harmful online content (DSA Art. 28, audiovisual directive)
- Research projects, opinions, consultations, work programmes mentioning minors/children/youth
- Fundamental rights frameworks (UNCRC, Charter Art. 24, GDPR Art. 8) related to children
- Position papers on platform liability for child safety
- Education AI systems (Annex III point 3)
- DPIA templates, anonymisation, transparency obligations that apply to minors data processors
- Scientific research safeguards where minors are a vulnerable data subject category

STRICT EXCLUSION — drop items about:
- Pure administrative/budget/HR/institutional news with zero rights dimension
- Adult-only matters
- Pure administrative/budget news
- Topics where minors are not a material dimension

SIGNAL TYPES — pick the BEST match:
- research_project: ongoing or new research initiative by an EU agency
- opinion_or_guidance: Article 64 opinions, EDPB guidelines, regulatory guidance
- consultation_open / consultation_closed: public consultations on policy
- bill_introduced / bill_adopted: national legislation
- parliamentary_question: written/oral questions in EU or national parliaments
- position_paper: official position from agency or civil society
- work_programme: agency annual workplan or strategic agenda
- stakeholder_event: public conference, workshop, hearing

STATUS:
- upcoming: announced but not yet started
- open: currently accepting input
- in_progress: ongoing work (research, drafting)
- closed: input period ended, awaiting outcome
- adopted: final decision/text published
- withdrawn: cancelled or superseded

RELEVANCE SCORE (0-100):
- 90-100: direct children impact, immediate strategic value (e.g. new EDPB opinion on minors, FRA report on AI and children)
- 70-89: significant children dimension, policy makers will reference it
- 50-69: children mentioned but not central focus
- 30-49: tangential but worth tracking
- 20-29: marginal, include anyway
- below 20: drop

JURISDICTION: "eu" (EU institutions), "council_of_europe", or ISO-2 country code

THEMES: pick from this controlled list (multi-select OK):
ai_education, age_verification, parental_consent, profiling, online_harms, content_moderation,
ed_tech, social_media, gaming, harmful_content, child_safety_by_design, mental_health, well_being,
algorithmic_bias, transparency, accountability, data_minimisation, dpia, fria

LEGAL FRAMEWORKS — multi-select from:
gdpr, ai_act, dsa, dma, audiovisual_directive, unccrc, eu_charter_art24, council_europe_lanzarote,
better_internet_strategy, digital_decade

STAKEHOLDERS — who should know? Pick from:
dpas, fra, edpb, edps, commission, parliament, civil_society, children_rights_orgs, platforms, edtech_vendors, researchers, schools

WHY IT MATTERS — 1-2 sentences in English explaining the operational impact for an expert reading their morning dashboard. Be concrete: "deadline X", "shifts burden of proof", "first national framework on Y", etc.

Respond ONLY with a JSON array. Empty array [] if no item qualifies. NO markdown, NO preamble.`;

export async function classifyPolicyItems(
  items: RssItem[],
  sourceName: string,
  languageCode: string,
): Promise<PolicySignalExtracted[]> {
  if (items.length === 0) return [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const userContent = `Source: ${sourceName}
Language: ${languageCode}
Number of items: ${items.length}

For each item below, decide if it touches minors/children digital rights and if so extract structured signal data.

ITEMS:
${items.map((it, idx) => `[${idx}]
TITLE: ${it.title}
URL: ${it.link}
DATE: ${it.pubDate}
DESC: ${it.description.slice(0, 1500)}`).join("\n\n")}`;

  const res = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
    signal: AbortSignal.timeout(45_000),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Anthropic API ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = (data.content?.[0]?.text ?? "[]") as string;
  const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try { parsed = JSON.parse(match[0]); } catch { return []; }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isValidSignal);
}

function isValidSignal(x: unknown): x is PolicySignalExtracted {
  if (!x || typeof x !== "object") return false;
  const d = x as Record<string, unknown>;
  return (
    typeof d.external_id === "string" && d.external_id.length > 0 &&
    typeof d.signal_type === "string" &&
    typeof d.status === "string" &&
    typeof d.title_original === "string" &&
    typeof d.title_en === "string" &&
    typeof d.summary_en === "string" &&
    typeof d.signal_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.signal_date) &&
    typeof d.source_url === "string" && /^https?:\/\//.test(d.source_url) &&
    Array.isArray(d.themes) &&
    Array.isArray(d.country_codes) &&
    Array.isArray(d.stakeholders) &&
    typeof d.relevance_score === "number" &&
    d.affects_minors === true
  );
}
