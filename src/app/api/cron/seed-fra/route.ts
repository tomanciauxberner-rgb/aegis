import { NextRequest, NextResponse } from "next/server";
import { insertSignals, buildExternalId } from "@/lib/signal-inserter";
import { FRA_DATA, FRA_SOURCES } from "@/lib/fra/data";

const SECTOR_MAP: Record<string, string> = {
  employment:         "employment",
  education:          "education",
  housing:            "housing",
  healthcare:         "healthcare",
  law_enforcement:    "law_enforcement",
  essential_services: "essential_services",
  online:             "online",
  justice:            "justice",
};


const GROUP_LABELS: Record<string, string> = {
  african_descent: "People of African descent",
  roma:            "Roma",
  muslims:         "Muslims",
  lgbtiq:          "LGBTIQ people",
  women:           "Women",
  disabilities:    "Persons with disabilities",
  migrants:        "Migrants",
  jews:            "Jews",
  general:         "General population",
};

const INDICATOR_LABELS: Record<string, string> = {
  experienced_discrimination_employment: "Employment discrimination rate",
  experienced_racial_harassment:         "Racial harassment rate",
  discrimination_housing:                "Housing discrimination rate",
  hateful_posts_passing_moderation:      "Hate content passing moderation",
  trust_courts:                          "Trust in courts",
  trust_police:                          "Trust in police",
  hate_crime_reporting_rate:             "Hate crime reporting rate",
  online_hate_exposure:                  "Online hate exposure rate",
  poverty_risk:                          "At-risk-of-poverty rate",
  housing_overcrowding:                  "Housing overcrowding rate",
  avoid_public_spaces:                   "Avoidance of public spaces",
};

const EU_AVERAGES: Record<string, number> = {};
for (const point of FRA_DATA) {
  if (point.country === "EU") {
    EU_AVERAGES[`${point.group}:${point.sector}:${point.indicator}`] = point.value;
  }
}

function deriveSeverity(value: number, euAvg: number | undefined): "critical" | "elevated" | "watch" {
  if (euAvg !== undefined && euAvg > 0) {
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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const countryPoints = FRA_DATA.filter((d) => d.country !== "EU");

  const signals = countryPoints.map((point) => {
    const source = FRA_SOURCES[point.source];
    const euKey = `${point.group}:${point.sector}:${point.indicator}`;
    const euAvg = EU_AVERAGES[euKey];
    const severity = deriveSeverity(point.value, euAvg);
    const sector = SECTOR_MAP[point.sector] ?? point.sector;

    const groupLabel = GROUP_LABELS[point.group] ?? point.group.replace(/_/g, " ");
    const indicatorLabel = INDICATOR_LABELS[point.indicator] ?? point.indicator.replace(/_/g, " ");
    const euNote = euAvg ? ` (EU avg: ${euAvg}%)` : "";

    return {
      country: point.country,
      group_id: point.group,
      sector,
      signal_type: "statistical" as const,
      severity,
      title: `${indicatorLabel} — ${groupLabel}${euNote} (${point.year})`,
      summary: point.note ?? `${point.value}% of ${groupLabel.toLowerCase()} reported ${indicatorLabel.toLowerCase()} in ${point.year}.${euAvg ? ` EU27 average: ${euAvg}%. Delta: ${Math.round((point.value - euAvg) * 10) / 10}pp.` : ""}`,
      value_observed: point.value,
      value_eu_avg: euAvg,
      source_label: source?.label ?? point.source,
      source_url: source?.url,
      year_observed: point.year,
      external_id: buildExternalId("fra", point.country, point.group, point.sector, point.indicator, String(point.year)),
    };
  });

  const result = await insertSignals(signals);

  return NextResponse.json({
    processed: signals.length,
    ...result,
    timestamp: new Date().toISOString(),
  });
}
