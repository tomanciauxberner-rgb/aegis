import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { childrenEdtechSystems, childrenGdprAge } from "@/db/schema/children";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Map edtech AI features → child developmental vulnerabilities
const FEATURE_TO_VULN: Record<string, string[]> = {
  behavioral_scoring: ["automated_decision", "profiling"],
  predictive_analytics: ["profiling", "automated_decision", "data_permanence"],
  algorithmic_ranking: ["automated_decision", "social_pressure"],
  school_assignment: ["automated_decision"],
  grade_aggregation: ["data_permanence"],
  content_recommendation: ["persuasive_design", "age_inappropriate"],
  absence_tracking: ["profiling", "data_permanence"],
};

// Annex III(3) education systems always implicate these frameworks
const BASE_FRAMEWORKS = ["charter_24", "uncrc_3", "ai_act_annex3_3", "gdpr_8"];

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const edtechId = request.nextUrl.searchParams.get("edtechId");
  if (!edtechId) return NextResponse.json({ error: "edtechId required" }, { status: 400 });

  try {
    const rows = await db
      .select()
      .from(childrenEdtechSystems)
      .where(eq(childrenEdtechSystems.id, edtechId))
      .limit(1);

    if (rows.length === 0) return NextResponse.json({ error: "System not found" }, { status: 404 });
    const sys = rows[0];

    const ageRow = await db
      .select({ age: childrenGdprAge.ageConsent })
      .from(childrenGdprAge)
      .where(eq(childrenGdprAge.countryCode, sys.countryCode))
      .limit(1);
    const consentAge = ageRow[0]?.age ?? null;

    // Derive vulnerabilities from the system's AI features
    const vulnSet = new Set<string>();
    for (const f of sys.aiFeatures) {
      for (const v of FEATURE_TO_VULN[f] ?? []) vulnSet.add(v);
    }
    // School systems with any scoring → manipulation/isolation baseline
    if (sys.aiFeatures.some((f) => /scoring|predictive/i.test(f))) {
      vulnSet.add("manipulation");
    }

    // Frameworks: base + Art.5 if prohibited tier
    const frameworks = [...BASE_FRAMEWORKS];
    if (sys.riskTier === "prohibited") frameworks.push("ai_act_5_1b");
    frameworks.push("uncrc_16");

    // Age bands: education systems typically span school age
    const ageBands = ["childhood_6_9", "pre_teen_10_12", "young_teen_13_15", "older_teen_16_17"];

    const tierLabel = sys.riskTier === "annex3" ? "AI Act Annex III high-risk" : sys.riskTier;

    const draftState = {
      step: 1,
      systemId: "",
      context: {
        deploymentDescription: `FRIA for ${sys.systemName}${sys.vendor ? ` (${sys.vendor})` : ""}, deployed at ${sys.deploymentScope} scale in ${sys.countryCode}. ${sys.description}`,
        operationalFrequency: sys.deploymentScope === "national" ? "Continuous, system-wide" : "",
        duration: "",
        humanOversightMeasures: "",
      },
      affectedGroups: [
        {
          populationCode: "young_teen_13_15",
          estimatedSize: sys.studentsAffected ? `~${sys.studentsAffected.toLocaleString()} students` : "",
          vulnerabilityLevel: sys.riskTier === "annex3" ? "high" : "medium",
          specificConcerns: `Minors subject to ${sys.aiFeatures.join(", ") || "the system"} in an educational setting (${tierLabel}).`,
        },
      ],
      risks: [],
      mitigations: [],
      dpiaReference: "",
      dpiaOverlapNotes: "",
      selectedCases: [],
      childAssessment: {
        ageBands,
        frameworks: [...new Set(frameworks)],
        vulnerabilities: [...vulnSet],
        bestInterestsNotes: "",
        ageAssuranceMethod: consentAge !== null
          ? `Local GDPR Art. 8 age of consent in ${sys.countryCode}: ${consentAge}. Verify how the system handles consent for pupils below this age.`
          : "",
      },
    };

    return NextResponse.json({
      title: `FRIA — ${sys.systemName}`,
      sourceRef: sys.id,
      draftState,
      meta: {
        system_name: sys.systemName,
        country: sys.countryCode,
        risk_tier: sys.riskTier,
        consent_age: consentAge,
        fria_required: sys.riskTier === "annex3" || sys.riskTier === "prohibited",
      },
    });
  } catch (e) {
    console.error("[fria/prefill]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
