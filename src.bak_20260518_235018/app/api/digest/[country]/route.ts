import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

const INDICATOR_DIRECTION: Record<string, "higher_is_worse" | "lower_is_worse"> = {
  disc_employment_5y: "higher_is_worse",
  black_disc_employment_5y: "higher_is_worse",
  black_racial_profiling: "higher_is_worse",
  roma_disc_employment: "higher_is_worse",
  roma_poverty_rate: "higher_is_worse",
  disc_lgbtiq_employment: "higher_is_worse",
  lgbtiq_harassment_12m: "higher_is_worse",
  trust_police: "lower_is_worse",
  hate_crime_reporting_rate: "lower_is_worse",
  online_hate_exposure: "higher_is_worse",
  muslim_disc_employment: "higher_is_worse",
  roma_housing_overcrowding: "higher_is_worse",
  black_poverty_risk: "higher_is_worse",
  lgbtiq_avoid_public: "higher_is_worse",
  institutional_trust_index: "lower_is_worse",
  hate_crime_data_gap: "higher_is_worse",
  employment_rate_non_eu_born: "lower_is_worse",
  unemployment_rate_non_eu_born: "higher_is_worse",
};

const INCIDENTS_BY_COUNTRY: Record<string, { title: string; sector: string; date: string; summary: string; source: string }[]> = {
  NL: [
    { title: "SyRI welfare fraud system ruled rights violation", sector: "Social benefits", date: "Feb 2020", summary: "District Court of The Hague ruled the Dutch SyRI profiling system violated Article 8 ECHR. Disproportionately targeted low-income and migrant neighborhoods.", source: "AlgorithmWatch / District Court The Hague" },
    { title: "Dutch childcare benefits scandal — algorithmic mass fraud accusations", sector: "Social benefits", date: "2019–2021", summary: "Dutch tax authority's algorithm falsely accused thousands of families of fraud, disproportionately targeting dual nationality and migrant families.", source: "Amnesty International / Parliamentary Inquiry" },
  ],
  FR: [
    { title: "CAF algorithm flags 13M households — bias against disabled & single mothers", sector: "Social benefits", date: "Jun 2023", summary: "France's family benefits authority used an AI scoring system biased against people with disabilities, single mothers, and low-income individuals.", source: "AlgorithmWatch / Lighthouse Reports" },
    { title: "Facebook job ads algorithm ruled discriminatory by Défenseur des Droits", sector: "Employment", date: "Mar 2024", summary: "Meta's ad distribution algorithm showed job ads to heavily gender-skewed audiences without advertiser intent, reinforcing occupational stereotypes.", source: "Défenseur des Droits (France)" },
  ],
  PL: [
    { title: "Poland unemployment scoring system scrapped after discrimination concerns", sector: "Employment", date: "Apr 2019", summary: "AI-based unemployment scoring systematically disadvantaged women and migrants in allocating employment support resources.", source: "AlgorithmWatch" },
  ],
};

async function fetchCountryIndicators(countryCode: string) {
  const result = await db.execute(sql.raw(`
    SELECT
      i.code AS indicator_code,
      i.name AS indicator_name,
      i.description,
      i.topic,
      i.subtopic,
      i.unit,
      iv.value,
      iv.year,
      p.code AS population_code,
      p.name AS population_name,
      s.code AS survey_code,
      s.name AS survey_name,
      s.source_url
    FROM indicator_values iv
    JOIN indicators i ON iv.indicator_id = i.id
    JOIN countries c ON iv.country_id = c.id
    JOIN surveys s ON i.survey_id = s.id
    LEFT JOIN populations p ON iv.population_id = p.id
    WHERE c.code = '${countryCode}'
    ORDER BY i.topic, iv.year DESC
  `));
  return Array.isArray(result) ? result : [];
}

async function fetchEU27Averages() {
  const result = await db.execute(sql.raw(`
    SELECT
      i.code AS indicator_code,
      ROUND(AVG(iv.value)::numeric, 1) AS eu_avg,
      COUNT(DISTINCT c.code) AS country_count
    FROM indicator_values iv
    JOIN indicators i ON iv.indicator_id = i.id
    JOIN countries c ON iv.country_id = c.id
    GROUP BY i.code
  `));
  const rows = Array.isArray(result) ? result : [];
  const map: Record<string, { avg: number; count: number }> = {};
  for (const r of rows as any[]) {
    map[r.indicator_code] = { avg: Number(r.eu_avg), count: Number(r.country_count) };
  }
  return map;
}

function buildPrompt(
  countryCode: string,
  countryName: string,
  indicators: any[],
  eu27Averages: Record<string, { avg: number; count: number }>,
  incidents: { title: string; sector: string; date: string; summary: string; source: string }[]
): string {
  const indicatorLines = indicators.map((r: any) => {
    const eu = eu27Averages[r.indicator_code];
    const euNote = eu
      ? (() => {
          const diff = Number(r.value) - eu.avg;
          const direction = INDICATOR_DIRECTION[r.indicator_code];
          const worse = direction === "higher_is_worse" ? diff > 0 : diff < 0;
          const sign = diff > 0 ? "+" : "";
          return `EU avg: ${eu.avg}% (${sign}${diff.toFixed(1)}pp — ${worse ? "worse than EU avg" : "better than EU avg"}, n=${eu.count} countries)`;
        })()
      : "No EU comparison available";
    return `- ${r.indicator_name} [${r.population_name ?? "general"}]: ${r.value}% (${r.year}) | ${euNote} | Source: ${r.survey_name}`;
  }).join("\n");

  const incidentLines = incidents.length > 0
    ? incidents.map((i) => `- ${i.title} (${i.date}, ${i.sector}): ${i.summary} [Source: ${i.source}]`).join("\n")
    : "No documented algorithmic incidents for this country in the Aegis database.";

  return `You are a senior human rights analyst at a EU fundamental rights research institute. Generate a concise, factual country briefing for ${countryName} (${countryCode}) based exclusively on the data below. Do not add any information not present in the data.

STRUCTURE YOUR RESPONSE IN EXACTLY THIS FORMAT:

## ${countryName} — Fundamental Rights Briefing
*Generated by Aegis Signal Monitor | Data: FRA surveys + Eurostat LFS*

### Key Findings
[3-5 bullet points identifying the most significant findings, always citing the value, year, and source. Highlight where ${countryName} is significantly above or below EU average.]

### Data Gaps
[Bullet points identifying which populations or indicators are NOT covered for ${countryName}. This is critical intelligence for researchers.]

### Algorithmic Risk Signals
[Summary of documented algorithmic incidents, or explicit statement if none documented.]

### Recommended Focus Areas
[Exactly 3 concrete action points for advocacy officers or FRANET researchers, grounded in the data above.]

---
*All figures are survey-based estimates. Source data: ${[...new Set(indicators.map((r: any) => r.survey_name))].join(", ")}.*

---
COUNTRY DATA FOR ${countryName} (${countryCode}):
${indicatorLines}

ALGORITHMIC INCIDENTS:
${incidentLines}

CRITICAL RULES:
- Every statistic you mention must come from the data above
- Always include the year and source for each figure
- If a population group has no data for ${countryName}, explicitly flag it as a data gap
- Do not use hedging language like "may" or "might" — state facts from the data directly
- Keep the entire briefing under 600 words`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params;
  const countryCode = country.toUpperCase().replace(/[^A-Z]/g, "");

  if (!countryCode || countryCode.length !== 2) {
    return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
  }

  const identifier = request.headers.get("x-forwarded-for") || "anon";
  const { success } = rateLimit(identifier, 10);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const [indicators, eu27Averages] = await Promise.all([
      fetchCountryIndicators(countryCode),
      fetchEU27Averages(),
    ]);

    if (indicators.length === 0) {
      return NextResponse.json(
        { error: `No data found for country: ${countryCode}` },
        { status: 404 }
      );
    }

    const countryName = String((indicators[0] as any).country_name ?? countryCode);
    const incidents = INCIDENTS_BY_COUNTRY[countryCode] ?? [];
    const prompt = buildPrompt(countryCode, countryName, indicators as any[], eu27Averages, incidents);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "output-128k-2025-02-19",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("[digest] Anthropic error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(parsed.delta.text));
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Country": countryCode,
        "X-Indicators-Count": String(indicators.length),
      },
    });
  } catch (error) {
    console.error("[digest] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
