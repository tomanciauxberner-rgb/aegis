import type { RssItem, DpaDecisionExtracted } from "@/types/children-v2";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are a senior EU data protection analyst specialised in minors' rights.
You receive raw items from a national Data Protection Authority and must extract ONLY decisions, sanctions, or guidance that concern minors (under 18) — directly or via processing of their personal data.

Strict inclusion criteria — keep the item if ANY of these is true:
- The decision concerns a service primarily used by minors (social media, gaming, edtech, kids apps)
- Children's data, age verification, parental consent, or GDPR Art. 8 is discussed
- The respondent is a school, edtech provider, child-facing platform, or content moderation entity affecting minors
- The decision invokes UNCRC, EU Charter Art. 24, DSA Art. 28 (minors protection), or AI Act Annex III point 3 (education)

Strict exclusion — drop items about:
- Generic GDPR enforcement with no minors dimension
- Adult-only services
- B2B data processing with no consumer impact
- Administrative or technical decisions with no rights impact

For each kept item, return ONE object with these exact fields:
{
  "external_id": "<stable slug from URL or title, max 100 chars, lowercase, hyphens>",
  "decision_date": "<YYYY-MM-DD, best estimate from item date>",
  "published_date": "<YYYY-MM-DD or null>",
  "title_original": "<title in source language, max 300 chars>",
  "title_en": "<English translation of title, max 300 chars>",
  "summary_en": "<2-4 factual sentences in English, max 800 chars, NO speculation>",
  "outcome": "<fine|warning|injunction|dismissed|ongoing|settled|guidance>",
  "fine_amount_eur": <integer EUR or null>,
  "respondent_name": "<entity name or null>",
  "respondent_sector": "<edtech|social_media|gaming|streaming|school|public_authority|other or null>",
  "legal_bases": ["gdpr_art8" | "gdpr_art22" | "gdpr_art35" | "dsa_art28" | "dsa_art34" | "dsa_art35" | "dsa_art39" | "ai_act_annex3" | "ai_act_art5" | "ai_act_art27" | "uncrc_art3" | "uncrc_art16" | "uncrc_art17" | "charter_art24"],
  "age_range_affected": "<e.g. 'under 13', '13-17', 'all minors' or null>",
  "severity": "<critical|high|medium|low|informational>",
  "source_url": "<direct URL>",
  "affects_minors": true
}

Severity scale:
- critical: fine ≥ 1M EUR OR injunction halting a service used by 100k+ minors OR systemic rights violation
- high: fine ≥ 100k EUR OR enforcement against major platform OR clear Art. 8 violation
- medium: warning, guidance with mandatory action, smaller fine
- low: minor guidance, advisory opinion
- informational: report, study, consultation

Respond ONLY with a JSON array. Empty array [] if no item qualifies. NO markdown, NO preamble, NO explanation.`;

export async function classifyDpaItems(
  items: RssItem[],
  languageCode: string,
): Promise<DpaDecisionExtracted[]> {
  if (items.length === 0) return [];

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const userContent = `Source language: ${languageCode}
Number of items: ${items.length}

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

  return parsed.filter(isValidDecision);
}

function isValidDecision(x: unknown): x is DpaDecisionExtracted {
  if (!x || typeof x !== "object") return false;
  const d = x as Record<string, unknown>;
  return (
    typeof d.external_id === "string" && d.external_id.length > 0 &&
    typeof d.decision_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d.decision_date) &&
    typeof d.title_original === "string" &&
    typeof d.title_en === "string" &&
    typeof d.summary_en === "string" &&
    typeof d.source_url === "string" && /^https?:\/\//.test(d.source_url) &&
    d.affects_minors === true &&
    Array.isArray(d.legal_bases)
  );
}
