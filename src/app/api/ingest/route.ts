import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

interface CrossRefAlert {
  systemId: string;
  systemName: string;
  country: string;
  sector: string;
  riskCategory: string;
  signals: {
    group_id: string;
    title: string;
    severity: string;
    value_observed: number | null;
    value_eu_avg: number | null;
    year_observed: number | null;
    source_label: string | null;
  }[];
  convergenceScore: number;
  maxSeverity: string;
  recommendation: string;
}

const GROUP_LABELS: Record<string, string> = {
  african_descent: "People of African descent",
  roma: "Roma",
  muslims: "Muslims",
  lgbtiq: "LGBTIQ people",
  women: "Women",
  disabilities: "Persons with disabilities",
  migrants: "Migrants",
  jews: "Jewish people",
  general: "General population",
};

const RISK_TO_SECTOR: Record<string, string[]> = {
  employment: ["employment"],
  education: ["education"],
  essential_services: ["essential_services", "healthcare"],
  law_enforcement: ["law_enforcement", "justice"],
  migration: ["law_enforcement", "essential_services"],
  justice: ["justice", "law_enforcement"],
  biometrics: ["law_enforcement", "essential_services"],
  critical_infrastructure: ["essential_services"],
};

function buildRecommendation(
  systemName: string,
  country: string,
  maxSeverity: string,
  signals: CrossRefAlert["signals"]
): string {
  const groups = [...new Set(signals.map((s) => GROUP_LABELS[s.group_id] ?? s.group_id))];
  const highestDelta = signals
    .filter((s) => s.value_observed != null && s.value_eu_avg != null)
    .map((s) => Math.round((s.value_observed! - s.value_eu_avg!) * 10) / 10)
    .sort((a, b) => b - a)[0];
  const deltaNote = highestDelta != null && highestDelta > 0 ? ` Peak delta: +${highestDelta}pp above EU average.` : "";

  if (maxSeverity === "critical") {
    return `URGENT: "${systemName}" operates in ${country} where ${groups.join(", ")} face critical discrimination levels.${deltaNote} EU AI Act Art. 9 requires documented risk mitigation for affected populations. Initiate FRIA immediately.`;
  }
  if (maxSeverity === "elevated") {
    return `WARNING: "${systemName}" operates in ${country} where ${groups.join(", ")} report elevated discrimination.${deltaNote} Consider enhanced monitoring and bias testing per EU AI Act Art. 9(4).`;
  }
  return `MONITOR: "${systemName}" operates in ${country} where discrimination signals are present for ${groups.join(", ")}.${deltaNote} Include in periodic compliance review.`;
}

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 20);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const systemId = searchParams.get("system_id");

  try {
    let systemsQuery = supabase
      .from("ai_systems")
      .select("id, name, risk_category, deployment_countries, intended_purpose, is_high_risk, org_id")
      .eq("status", "active");

    if (systemId) {
      systemsQuery = systemsQuery.eq("id", systemId);
    }

    const { data: systems, error: sysError } = await systemsQuery;
    if (sysError) throw sysError;
    if (!systems || systems.length === 0) {
      return NextResponse.json({ crossRefs: [], total: 0 });
    }

    const crossRefs: CrossRefAlert[] = [];

    for (const sys of systems) {
      const countries: string[] = sys.deployment_countries ?? [];
      const riskCat = sys.risk_category ?? "";
      const sectors = RISK_TO_SECTOR[riskCat] ?? [riskCat];

      for (const country of countries) {
        const { data: signals } = await supabase
          .from("signals")
          .select("group_id, title, severity, value_observed, value_eu_avg, year_observed, source_label")
          .eq("country", country)
          .in("sector", sectors)
          .eq("is_active", true)
          .order("year_observed", { ascending: false })
          .limit(20);

        if (!signals || signals.length === 0) continue;

        const critCount = signals.filter((s) => s.severity === "critical").length;
        const elevCount = signals.filter((s) => s.severity === "elevated").length;
        const signalTypes = new Set(signals.map((s) => {
          if (s.source_label?.includes("Eurostat") || s.source_label?.includes("FRA") || s.source_label?.includes("Being") || s.source_label?.includes("Roma") || s.source_label?.includes("Muslim") || s.source_label?.includes("LGBTIQ")) return "statistical";
          if (s.source_label?.includes("AI Act")) return "legislative";
          return "incident";
        }));
        const typeCount = signalTypes.size;

        let maxSeverity = "watch";
        if (typeCount >= 3 && critCount >= 2) maxSeverity = "critical";
        else if (typeCount >= 2 && critCount >= 1) maxSeverity = "elevated";
        else if (critCount >= 2) maxSeverity = "elevated";
        else if (elevCount >= 2 || critCount >= 1) maxSeverity = "elevated";
        else if (elevCount >= 1) maxSeverity = "watch";

        crossRefs.push({
          systemId: sys.id,
          systemName: sys.name,
          country,
          sector: riskCat,
          riskCategory: riskCat,
          signals: signals.map((s) => ({
            group_id: s.group_id,
            title: s.title,
            severity: s.severity,
            value_observed: s.value_observed,
            value_eu_avg: s.value_eu_avg,
            year_observed: s.year_observed,
            source_label: s.source_label,
          })),
          convergenceScore: signalTypes.size,
          maxSeverity,
          recommendation: buildRecommendation(sys.name, country, maxSeverity, signals),
        });
      }
    }

    crossRefs.sort((a, b) => {
      const sev: Record<string, number> = { critical: 0, elevated: 1, watch: 2 };
      return (sev[a.maxSeverity] ?? 3) - (sev[b.maxSeverity] ?? 3);
    });

    return NextResponse.json({
      crossRefs,
      total: crossRefs.length,
      systemsAnalyzed: systems.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cross-ref] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
