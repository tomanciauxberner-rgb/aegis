import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  childrenApps,
  childrenAppRankings,
  childrenIngestLog,
} from "@/db/schema/children";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchItunesChart, lookupItunesApp } from "@/lib/children/app-store-client";
import { fetchDsaVlopList } from "@/lib/children/dsa-vlop-client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PIPELINE = "children-apps";

const EU_COUNTRIES_ROTATION = [
  "DE", "FR", "IT", "ES", "NL", "BE", "PL", "SE",
] as const;

const CATEGORIES: ("kids" | "social" | "entertainment" | "games")[] = [
  "kids", "social", "entertainment", "games",
];

const APPS_PER_CHART = 25;

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const { searchParams } = request.nextUrl;
  const countriesParam = searchParams.get("countries");
  const countries = countriesParam
    ? countriesParam.split(",").map((c) => c.toUpperCase()).slice(0, 27)
    : pickRotation();

  const [log] = await db
    .insert(childrenIngestLog)
    .values({ pipeline: PIPELINE })
    .returning();

  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const errorDetails: string[] = [];

  let vlopMap = new Map<string, { designationDate: string; transparencyUrl: string | null; category: string }>();
  try {
    const vlops = await fetchDsaVlopList();
    for (const v of vlops) {
      vlopMap.set(v.bundleId, {
        designationDate: v.designationDate,
        transparencyUrl: v.transparencyUrl,
        category: v.category,
      });
    }
  } catch (e) {
    errorDetails.push(`vlop-list: ${e instanceof Error ? e.message : String(e)}`);
  }

  const observedAt = new Date();

  for (const country of countries) {
    for (const category of CATEGORIES) {
      try {
        const entries = await fetchItunesChart({
          countryCode: country,
          category,
          limit: APPS_PER_CHART,
        });

        for (const entry of entries) {
          const appId = `ios-${entry.bundleId}`;
          const vlopInfo = vlopMap.get(entry.bundleId);

          let declaredMinAge = entry.declaredMinAge;
          if (declaredMinAge === null && entry.trackId) {
            try {
              const lookup = await lookupItunesApp(entry.trackId, country);
              if (lookup?.contentAdvisoryRating) {
                const m = lookup.contentAdvisoryRating.match(/(\d+)/);
                if (m) declaredMinAge = parseInt(m[1], 10);
              }
            } catch {
              // tolerate lookup failures
            }
          }

          const appUpsert = await db
            .insert(childrenApps)
            .values({
              id: appId,
              bundleId: entry.bundleId,
              name: entry.name,
              publisher: entry.publisher,
              platforms: ["ios"],
              declaredMinAge,
              isVlop: vlopInfo !== undefined,
              vlopDesignationDate: vlopInfo?.designationDate ?? null,
              dsaTransparencyUrl: vlopInfo?.transparencyUrl ?? null,
              category: entry.category,
            })
            .onConflictDoUpdate({
              target: childrenApps.bundleId,
              set: {
                name: sql`excluded.name`,
                publisher: sql`excluded.publisher`,
                declaredMinAge: sql`COALESCE(excluded.declared_min_age, ${childrenApps.declaredMinAge})`,
                isVlop: sql`excluded.is_vlop OR ${childrenApps.isVlop}`,
                vlopDesignationDate: sql`COALESCE(excluded.vlop_designation_date, ${childrenApps.vlopDesignationDate})`,
                dsaTransparencyUrl: sql`COALESCE(excluded.dsa_transparency_url, ${childrenApps.dsaTransparencyUrl})`,
                category: sql`excluded.category`,
                updatedAt: sql`NOW()`,
                platforms: sql`
                  CASE
                    WHEN ${childrenApps.platforms} @> '["ios"]'::jsonb THEN ${childrenApps.platforms}
                    ELSE ${childrenApps.platforms} || '["ios"]'::jsonb
                  END
                `,
              },
            })
            .returning({ id: childrenApps.id, createdAt: childrenApps.createdAt });

          if (appUpsert.length > 0) {
            const ageMs = Date.now() - new Date(appUpsert[0].createdAt).getTime();
            if (ageMs < 5_000) inserted++; else updated++;
          }

          await db
            .insert(childrenAppRankings)
            .values({
              appId,
              countryCode: country,
              platform: "ios",
              chartCategory: category,
              rank: entry.rank,
              observedAt,
            })
            .onConflictDoNothing();
        }
      } catch (e) {
        errors++;
        errorDetails.push(`${country}/${category}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300));
      }
    }
  }

  await db.update(childrenIngestLog).set({
    completedAt: new Date(),
    inserted, updated, skipped, errors,
    errorDetails,
  }).where(eq(childrenIngestLog.id, log.id));

  return NextResponse.json({
    pipeline: PIPELINE,
    countries,
    inserted, updated, skipped, errors,
    errorDetails,
    timestamp: observedAt.toISOString(),
  });
}

function pickRotation(): string[] {
  const dayOfWeek = new Date().getUTCDay();
  const start = (dayOfWeek * 4) % EU_COUNTRIES_ROTATION.length;
  const rotated = [...EU_COUNTRIES_ROTATION.slice(start), ...EU_COUNTRIES_ROTATION.slice(0, start)];
  return rotated.slice(0, 4);
}
