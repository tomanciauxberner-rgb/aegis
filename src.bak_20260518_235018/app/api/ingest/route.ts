import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { insertSignals, buildExternalId } from "@/lib/signal-inserter";
import { rateLimit } from "@/lib/rate-limit";

const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

const VALID_GROUPS = new Set([
  "african_descent","roma","muslims","lgbtiq","women",
  "disabilities","migrants","jews","general",
]);

const VALID_SECTORS = new Set([
  "employment","education","housing","healthcare",
  "law_enforcement","essential_services","online","justice",
]);

interface ExtractedDataPoint {
  country: string;
  group_id: string;
  sector: string;
  indicator: string;
  value: number;
  eu_average: number | null;
  year: number;
  source_label: string;
  source_url: string;
  summary: string;
}

function deriveSeverity(value: number, euAvg: number | null): "critical" | "elevated" | "watch" {
  if (euAvg !== null && euAvg > 0) {
    const delta = value - euAvg;
    const ratio = delta / euAvg;
    if (delta >= 20 || (ratio >= 0.5 && delta >= 10)) return "critical";
    if (delta >= 10 || (ratio >= 0.25 && delta >= 5)) return "elevated";
    return "watch";
  }
  if (value >= 65) return "critical";
  if (value >= 50) return "elevated";
  return "watch";
}

export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 5);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { text: string; sourceLabel?: string; sourceUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, sourceLabel, sourceUrl } = body;
  if (!text || text.trim().length < 50) {
    return NextResponse.json({ error: "Text must be at least 50 characters" }, { status: 400 });
  }

  if (text.length > 30000) {
    return NextResponse.json({ error: "Text too long — max 30,000 characters. Split into sections." }, { status: 400 });
  }

  try {
    const prompt = `You are a data extraction specialist for the EU Fundamental Rights Agency (FRA). Extract structured discrimination data points from the following text.

For EACH concrete statistic mentioned (a percentage, rate, or measurable value about discrimination, harassment, violence, poverty, employment, education, housing, or trust), extract:

- country: ISO 2-letter code (EU27 only: AT,BE,BG,HR,CY,CZ,DK,EE,FI,FR,DE,GR,HU,IE,IT,LV,LT,LU,MT,NL,PL,PT,RO,SK,SI,ES,SE). Use "EU" for EU averages.
- group_id: one of: african_descent, roma, muslims, lgbtiq, women, disabilities, migrants, jews, general
- sector: one of: employment, education, housing, healthcare, law_enforcement, essential_services, online, justice
- indicator: short snake_case descriptor (e.g. "experienced_discrimination_employment", "poverty_risk", "school_segregation", "harassment_12m")
- value: the numeric percentage or rate (just the number, no % sign)
- eu_average: the EU-wide average for this indicator if mentioned, otherwise null
- year: the survey/data year (NOT the publication year)
- source_label: the publication name (e.g. "Roma Survey 2024", "Being Black in the EU 2023")
- source_url: URL if mentioned, otherwise ""
- summary: one sentence describing the data point factually

RULES:
- Only extract data points with a CONCRETE numeric value
- Skip qualitative statements without numbers
- Skip data from non-EU countries (Albania, North Macedonia, Serbia, UK)
- If a value is for "EU average" or "EU total", set country to "EU"
- If the same indicator appears for multiple countries, create separate entries
- Validate: value must be 0-100 for percentages

Respond ONLY with a JSON array. No markdown, no preamble, no explanation.

TEXT TO ANALYZE:
${text.slice(0, 25000)}`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("[ingest] Anthropic error:", err);
      return NextResponse.json({ error: "AI extraction failed" }, { status: 502 });
    }

    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData.content?.[0]?.text ?? "[]";
    const clean = rawText.replace(/```json|```/g, "").trim();

    let extracted: ExtractedDataPoint[];
    try {
      extracted = JSON.parse(clean);
    } catch {
      console.error("[ingest] Parse error:", rawText.slice(0, 500));
      return NextResponse.json({ error: "Failed to parse AI response", raw: rawText.slice(0, 200) }, { status: 502 });
    }

    if (!Array.isArray(extracted)) {
      return NextResponse.json({ error: "AI returned non-array response" }, { status: 502 });
    }

    const valid = extracted.filter((dp) => {
      if (!dp.country || !dp.group_id || !dp.sector || dp.value == null) return false;
      if (dp.country !== "EU" && !EU27.has(dp.country)) return false;
      if (!VALID_GROUPS.has(dp.group_id)) return false;
      if (!VALID_SECTORS.has(dp.sector)) return false;
      if (dp.value < 0 || dp.value > 100) return false;
      return true;
    });

    const euAvgMap: Record<string, number> = {};
    for (const dp of valid) {
      if (dp.country === "EU") {
        euAvgMap[`${dp.group_id}:${dp.sector}:${dp.indicator}`] = dp.value;
      }
    }

    const countryPoints = valid.filter((dp) => dp.country !== "EU");

    const signals = countryPoints.map((dp) => {
      const euKey = `${dp.group_id}:${dp.sector}:${dp.indicator}`;
      const euAvg = dp.eu_average ?? euAvgMap[euKey] ?? undefined;
      const severity = deriveSeverity(dp.value, euAvg ?? null);
      const src = sourceLabel ?? dp.source_label ?? "FRA Report";

      return {
        country: dp.country,
        group_id: dp.group_id,
        sector: dp.sector,
        signal_type: "statistical" as const,
        severity,
        title: `${dp.indicator.replace(/_/g, " ")} — ${dp.group_id.replace(/_/g, " ")}${euAvg ? ` (EU avg: ${euAvg}%)` : ""} (${dp.year})`,
        summary: dp.summary || `${dp.value}% reported in ${dp.country} (${dp.year}).${euAvg ? ` EU avg: ${euAvg}%.` : ""}`,
        value_observed: dp.value,
        value_eu_avg: euAvg,
        source_label: src,
        source_url: sourceUrl ?? dp.source_url ?? undefined,
        year_observed: dp.year,
        external_id: buildExternalId("ingest", dp.country, dp.group_id, dp.sector, dp.indicator, String(dp.year)),
      };
    });

    let insertResult = { inserted: 0, skipped: 0, errors: [] as string[] };
    if (signals.length > 0) {
      insertResult = await insertSignals(signals);
    }

    return NextResponse.json({
      extracted: extracted.length,
      valid: valid.length,
      euAverages: Object.keys(euAvgMap).length,
      countryPoints: countryPoints.length,
      ...insertResult,
      preview: valid.slice(0, 5).map((dp) => ({
        country: dp.country,
        group: dp.group_id,
        sector: dp.sector,
        value: dp.value,
        year: dp.year,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ingest] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
