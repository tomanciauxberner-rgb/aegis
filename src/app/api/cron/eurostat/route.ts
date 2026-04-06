import { NextRequest, NextResponse } from "next/server";
import { insertSignals, buildExternalId } from "@/lib/signal-inserter";

const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

interface EurostatObs {
  country: string;
  value: number;
  year: number;
}

async function fetchEurostatSeries(
  datasetCode: string,
  params: Record<string, string>
): Promise<EurostatObs[]> {
  const query = new URLSearchParams({ format: "JSON", lang: "EN", ...params });
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${datasetCode}?${query}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Eurostat ${datasetCode}: HTTP ${res.status}`);
  const json = await res.json();

  const values: Record<number, number> = json.value ?? {};
  if (!Object.keys(values).length) return [];

  const dims: string[] = json.id ?? [];
  const sizes: number[] = json.size ?? [];

  const dimIndexMap: Record<string, Record<string, number>> = {};
  for (const dim of dims) {
    const catIndex = json.dimension?.[dim]?.category?.index ?? {};
    dimIndexMap[dim] = {};
    for (const [label, pos] of Object.entries(catIndex)) {
      dimIndexMap[dim][label] = Number(pos);
    }
  }

  const stride: Record<string, number> = {};
  let s = 1;
  for (let i = dims.length - 1; i >= 0; i--) {
    stride[dims[i]] = s;
    s *= sizes[i];
  }

  const geoLabels = Object.keys(dimIndexMap["geo"] ?? {});
  const timeLabels = Object.keys(dimIndexMap["time"] ?? {}).sort((a, b) => Number(b) - Number(a));

  const results: EurostatObs[] = [];

  for (const geo of geoLabels) {
    const country = geo.toUpperCase();
    if (!EU27.has(country)) continue;

    const geoPos = dimIndexMap["geo"][geo];

    for (const year of timeLabels) {
      const timePos = dimIndexMap["time"][year];

      let baseIdx = geoPos * stride["geo"] + timePos * stride["time"];

      const otherDims = dims.filter((d) => d !== "geo" && d !== "time");
      for (const dim of otherDims) {
        const paramVal = params[dim];
        if (paramVal && dimIndexMap[dim]?.[paramVal] !== undefined) {
          baseIdx += dimIndexMap[dim][paramVal] * stride[dim];
        } else {
          const firstPos = Object.values(dimIndexMap[dim] ?? {})[0] ?? 0;
          baseIdx += firstPos * stride[dim];
        }
      }

      const val = values[baseIdx];
      if (val !== undefined && val !== null) {
        results.push({ country, value: Math.round(val * 10) / 10, year: parseInt(year) });
        break;
      }
    }
  }

  return results;
}

async function fetchEuAverage(
  datasetCode: string,
  params: Record<string, string>
): Promise<number | null> {
  try {
    const obs = await fetchEurostatSeries(datasetCode, { ...params, geo: "EU27_2020" });
    return obs[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: string[] = [];
  const allSignals: Parameters<typeof insertSignals>[0] = [];

  const sharedParams = { sex: "T", age: "Y20-64", unit: "PC", c_birth: "FOR" };

  try {
    const [empObs, empEuAvg] = await Promise.all([
      fetchEurostatSeries("lfsa_ergacob", sharedParams),
      fetchEuAverage("lfsa_ergacob", sharedParams),
    ]);

    for (const obs of empObs) {
      const delta = empEuAvg !== null ? obs.value - empEuAvg : null;
      const severity = delta !== null
        ? delta <= -15 ? "critical" : delta <= -8 ? "elevated" : "watch"
        : obs.value < 55 ? "critical" : obs.value < 63 ? "elevated" : "watch";

      allSignals.push({
        country: obs.country,
        group_id: "migrants",
        sector: "employment",
        signal_type: "statistical",
        severity,
        title: `Employment rate foreign-born — ${obs.value}%${empEuAvg !== null ? ` (EU avg ${empEuAvg}%)` : ""} (${obs.year})`,
        summary: `Employment rate for foreign-born population aged 20-64: ${obs.value}%.${empEuAvg !== null ? ` EU27 average: ${empEuAvg}%. Delta: ${Math.round((obs.value - empEuAvg) * 10) / 10}pp.` : ""}`,
        value_observed: obs.value,
        value_eu_avg: empEuAvg ?? undefined,
        source_label: "Eurostat LFS — lfsa_ergacob",
        source_url: "https://ec.europa.eu/eurostat/databrowser/view/lfsa_ergacob/default/table",
        year_observed: obs.year,
        external_id: buildExternalId("eurostat", "lfsa-ergacob", obs.country, String(obs.year)),
      });
    }
  } catch (e: unknown) {
    errors.push(`lfsa_ergacob: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (allSignals.length === 0 && errors.length === 0) {
    errors.push("No data extracted — check Eurostat API availability");
  }

  const result = allSignals.length > 0
    ? await insertSignals(allSignals)
    : { inserted: 0, skipped: 0, errors: [] };

  return NextResponse.json({
    processed: allSignals.length,
    ...result,
    errors: [...result.errors, ...errors],
    timestamp: new Date().toISOString(),
  });
}
