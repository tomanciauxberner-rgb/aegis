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
  signals: CrossRefAlert["signals"]
): string {
  const criticalSignals = signals.filter((s) => s.severity === "critical");
  const elevatedSignals = signals.filter((s) => s.severity === "elevated");
  const groups = [...new Set(signals.map((s) => GROUP_LABELS[s.group_id] ?? s.group_id))];

  if (criticalSignals.length > 0) {
    return `URGENT: "${systemName}" operates in ${country} where ${groups.join(", ")} face critical discrimination levels. EU AI Act Art. 9 requires documented risk mitigation for affected populations. Initiate FRIA immediately.`;
  }
  if (elevatedSignals.length > 0) {
    return `WARNING: "${systemName}" operates in ${country} where ${groups.join(", ")} report elevated discrimination. Consider enhanced monitoring and bias testing per EU AI Act Art. 9(4).`;
  }
  return `MONITOR: "${systemName}" operates in ${country} where discrimination signals are present for ${groups.join(", ")}. Include in periodic compliance review.`;
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

        const severityOrder: Record<string, number> = { critical: 0, elevated: 1, watch: 2 };
        const maxSeverity = signals.reduce(
          (max, s) => (severityOrder[s.severity] ?? 3) < (severityOrder[max] ?? 3) ? s.severity : max,
          "watch"
        );

        const signalTypes = new Set(signals.map((s) => {
          if (s.source_label?.includes("Eurostat") || s.source_label?.includes("FRA") || s.source_label?.includes("Being")) return "statistical";
          if (s.source_label?.includes("AI Act")) return "legislative";
          return "incident";
        }));

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
          recommendation: buildRecommendation(sys.name, country, signals),
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
