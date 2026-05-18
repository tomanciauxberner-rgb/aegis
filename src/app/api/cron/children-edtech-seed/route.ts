import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  childrenEdtechSystems,
  childrenIngestLog,
} from "@/db/schema/children";
import { verifyCronSecret } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PIPELINE = "children-edtech-seed";

interface SeedEntry {
  id: string;
  country_code: string;
  system_name: string;
  vendor: string | null;
  deployment_scope: "national" | "regional" | "pilot" | "withdrawn";
  students_affected: number | null;
  ai_features: string[];
  annex3_categories: string[];
  risk_tier: "annex3" | "prohibited" | "limited" | "minimal" | "unknown";
  legal_status: string | null;
  source_url: string | null;
  description: string;
  last_verified: string;
}

const SEED: SeedEntry[] = [
  {
    id: "edtech-hu-kreta",
    country_code: "HU",
    system_name: "KRÉTA — Köznevelési Regisztrációs és Tanulmányi Alaprendszer",
    vendor: "eKRÉTA Informatikai Zrt.",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["behavioral_scoring", "predictive_analytics"],
    annex3_categories: ["annex_iii_3_a", "annex_iii_3_b"],
    risk_tier: "annex3",
    legal_status: "under_investigation",
    source_url: "https://eugyintezes.e-kreta.hu/",
    description: "Hungary's national education registry and learning management platform used across primary and secondary schools. Includes behavioral and academic scoring modules that fall under AI Act Annex III point 3 (education and vocational training).",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-fr-pronote",
    country_code: "FR",
    system_name: "PRONOTE",
    vendor: "Index Education (Docaposte group)",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["grade_aggregation", "absence_tracking"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "compliant",
    source_url: "https://www.index-education.com/fr/pronote.php",
    description: "Dominant school management system in French middle and high schools (collèges, lycées). Aggregates grades, attendance, behavior. Used by the majority of public secondary schools but does not currently implement AI scoring features that would trigger Annex III classification.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-fr-affelnet",
    country_code: "FR",
    system_name: "Affelnet / Parcoursup",
    vendor: "Ministère de l'Éducation nationale",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["algorithmic_ranking", "school_assignment"],
    annex3_categories: ["annex_iii_3_a"],
    risk_tier: "annex3",
    legal_status: "compliant",
    source_url: "https://www.parcoursup.gouv.fr/",
    description: "French national algorithmic platforms for assigning students to upper-secondary schools (Affelnet) and to higher education programmes (Parcoursup). Ranking algorithms determine educational access at scale — clear fit for AI Act Annex III point 3 on access to education.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-nl-magister",
    country_code: "NL",
    system_name: "Magister",
    vendor: "Iddink Group",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["grade_aggregation"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "compliant",
    source_url: "https://magister.nl/",
    description: "Widely used Dutch school administration system (voortgezet onderwijs). Core LMS without standalone AI scoring; flagged here as baseline for comparison with future AI feature additions.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-de-iserv",
    country_code: "DE",
    system_name: "IServ",
    vendor: "IServ GmbH",
    deployment_scope: "national",
    students_affected: null,
    ai_features: [],
    annex3_categories: [],
    risk_tier: "minimal",
    legal_status: "compliant",
    source_url: "https://iserv.de/",
    description: "Widely deployed German school server platform providing email, file sharing, schedule. No AI scoring features identified.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-it-classroom-google",
    country_code: "IT",
    system_name: "Google Classroom (Italian schools deployment)",
    vendor: "Google LLC",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["content_recommendation"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "under_review",
    source_url: "https://www.garanteprivacy.it/",
    description: "Mass deployment of Google Workspace for Education across Italian public schools. Garante (Italian DPA) has issued repeated guidance on cross-border data transfers and behavioral profiling risks.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-es-roble",
    country_code: "ES",
    system_name: "Roble — Plataforma Educativa de Madrid",
    vendor: "Comunidad de Madrid",
    deployment_scope: "regional",
    students_affected: null,
    ai_features: ["grade_aggregation"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "compliant",
    source_url: "https://gestiona.madrid.org/wpad_web/",
    description: "Regional education platform of the Madrid autonomous community. Family-school communication, grade tracking. No AI scoring features documented.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-pl-vulcan",
    country_code: "PL",
    system_name: "Vulcan UONET+",
    vendor: "Vulcan sp. z o.o.",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["grade_aggregation", "absence_tracking"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "compliant",
    source_url: "https://www.vulcan.edu.pl/",
    description: "Dominant Polish school information system. Used by thousands of primary and secondary schools. Core LMS without AI scoring features.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-se-skolfederation",
    country_code: "SE",
    system_name: "Skolfederation / Skolverkets digital tools",
    vendor: "Skolverket (National Agency for Education)",
    deployment_scope: "national",
    students_affected: null,
    ai_features: [],
    annex3_categories: [],
    risk_tier: "minimal",
    legal_status: "compliant",
    source_url: "https://www.skolverket.se/",
    description: "Swedish national educational identity federation and Skolverket-managed assessment tools. No AI scoring features documented.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-ie-vsware",
    country_code: "IE",
    system_name: "VSware",
    vendor: "VSware Ltd.",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["grade_aggregation"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "compliant",
    source_url: "https://vsware.ie/",
    description: "Widely used Irish school management system across post-primary schools. Core LMS; no AI scoring features.",
    last_verified: "2025-01-15",
  },
  {
    id: "edtech-be-smartschool",
    country_code: "BE",
    system_name: "Smartschool",
    vendor: "Smartbit bv",
    deployment_scope: "national",
    students_affected: null,
    ai_features: ["grade_aggregation"],
    annex3_categories: [],
    risk_tier: "limited",
    legal_status: "compliant",
    source_url: "https://www.smartschool.be/",
    description: "Dominant Flemish school platform (secondary education). Family communication, grades, attendance. Belgian APD/GBA has issued guidance on data minimisation in school platforms.",
    last_verified: "2025-01-15",
  },
];

export async function POST(request: NextRequest) {
  return runSeed(request);
}

export async function GET(request: NextRequest) {
  return runSeed(request);
}

async function runSeed(request: NextRequest): Promise<NextResponse> {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const [log] = await db
    .insert(childrenIngestLog)
    .values({ pipeline: PIPELINE })
    .returning();

  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const errorDetails: string[] = [];

  for (const e of SEED) {
    try {
      const result = await db
        .insert(childrenEdtechSystems)
        .values({
          id: e.id,
          countryCode: e.country_code,
          systemName: e.system_name,
          vendor: e.vendor,
          deploymentScope: e.deployment_scope,
          studentsAffected: e.students_affected,
          aiFeatures: e.ai_features,
          annex3Categories: e.annex3_categories,
          riskTier: e.risk_tier,
          legalStatus: e.legal_status,
          sourceUrl: e.source_url,
          description: e.description,
          lastVerified: e.last_verified,
        })
        .onConflictDoUpdate({
          target: childrenEdtechSystems.id,
          set: {
            systemName:       sql`excluded.system_name`,
            vendor:           sql`excluded.vendor`,
            deploymentScope:  sql`excluded.deployment_scope`,
            aiFeatures:       sql`excluded.ai_features`,
            annex3Categories: sql`excluded.annex3_categories`,
            riskTier:         sql`excluded.risk_tier`,
            legalStatus:      sql`excluded.legal_status`,
            sourceUrl:        sql`excluded.source_url`,
            description:      sql`excluded.description`,
            lastVerified:     sql`excluded.last_verified`,
            updatedAt:        sql`NOW()`,
          },
        })
        .returning({ id: childrenEdtechSystems.id, createdAt: childrenEdtechSystems.createdAt });

      if (result.length > 0) {
        const ageMs = Date.now() - new Date(result[0].createdAt).getTime();
        if (ageMs < 5_000) inserted++; else updated++;
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      errorDetails.push(`${e.id}: ${err instanceof Error ? err.message : String(err)}`.slice(0, 300));
    }
  }

  await db.update(childrenIngestLog).set({
    completedAt: new Date(),
    inserted, updated, skipped, errors,
    errorDetails,
  }).where(eq(childrenIngestLog.id, log.id));

  return NextResponse.json({
    pipeline: PIPELINE,
    total: SEED.length,
    inserted, updated, skipped, errors,
    errorDetails,
    timestamp: new Date().toISOString(),
  });
}
