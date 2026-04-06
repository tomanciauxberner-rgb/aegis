import { createClient } from "@/lib/supabase/server";

export interface SignalPayload {
  country: string;
  group_id: string;
  sector: string;
  signal_type: "statistical" | "legislative" | "incident";
  severity: "critical" | "elevated" | "watch";
  title: string;
  summary?: string;
  value_observed?: number;
  value_baseline?: number;
  value_eu_avg?: number;
  source_id?: string;
  source_label?: string;
  source_url?: string;
  year_observed?: number;
  year_baseline?: number;
  expires_at?: string;
  metadata?: Record<string, unknown>;
  external_id: string;
}

export interface InsertResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

export async function insertSignals(signals: SignalPayload[]): Promise<InsertResult> {
  const supabase = await createClient();
  const result: InsertResult = { inserted: 0, skipped: 0, errors: [] };

  for (const signal of signals) {
    if (!signal.external_id || !signal.country || !signal.group_id || !signal.sector) {
      result.errors.push(`Invalid signal: missing required fields — ${signal.external_id ?? "no id"}`);
      continue;
    }

    const countryCode = signal.country.toUpperCase().replace(/[^A-Z]/g, "");
    if (countryCode.length !== 2) {
      result.errors.push(`Invalid country code: ${signal.country}`);
      continue;
    }

    const { data: existing } = await supabase
      .from("signals")
      .select("id")
      .eq("external_id", signal.external_id)
      .maybeSingle();

    if (existing) {
      result.skipped++;
      continue;
    }

    const { error } = await supabase.from("signals").insert({
      country: countryCode,
      group_id: signal.group_id,
      sector: signal.sector,
      signal_type: signal.signal_type,
      severity: signal.severity,
      title: signal.title.slice(0, 500),
      summary: signal.summary?.slice(0, 2000),
      value_observed: signal.value_observed ?? null,
      value_baseline: signal.value_baseline ?? null,
      value_eu_avg: signal.value_eu_avg ?? null,
      source_id: signal.source_id ?? null,
      source_label: signal.source_label?.slice(0, 200) ?? null,
      source_url: signal.source_url?.slice(0, 500) ?? null,
      year_observed: signal.year_observed ?? null,
      year_baseline: signal.year_baseline ?? null,
      expires_at: signal.expires_at ?? null,
      metadata: signal.metadata ?? null,
      external_id: signal.external_id,
      is_active: true,
    });

    if (error) {
      result.errors.push(`Insert failed for ${signal.external_id}: ${error.message}`);
    } else {
      result.inserted++;
    }
  }

  if (result.inserted > 0) {
    await supabase.rpc("recompute_convergence");
  }

  return result;
}

export function buildExternalId(source: string, ...parts: string[]): string {
  return [source, ...parts]
    .map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 60))
    .join(":");
}
