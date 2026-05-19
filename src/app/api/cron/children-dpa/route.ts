import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  childrenDpaRegistry,
  childrenDpaDecisions,
  childrenIngestLog,
} from "@/db/schema/children";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchRssFeed } from "@/lib/children/rss-fetcher";
import { classifyDpaItems } from "@/lib/children/dpa-classifier";
import type { DpaDecisionExtracted } from "@/types/children-v2";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PIPELINE = "dpa-decisions";
const MAX_DPAS_PER_RUN = 20;
const MAX_ITEMS_PER_DPA = 20;

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const [log] = await db
    .insert(childrenIngestLog)
    .values({ pipeline: PIPELINE })
    .returning();

  let inserted = 0, updated = 0, skipped = 0, errors = 0;
  const errorDetails: string[] = [];

  try {
    const dpas = await db
      .select()
      .from(childrenDpaRegistry)
      .where(and(
        eq(childrenDpaRegistry.isActive, true),
        eq(childrenDpaRegistry.ingestStrategy, "rss"),
      ))
      .orderBy(sql`COALESCE(${childrenDpaRegistry.lastIngestedAt}, '1970-01-01'::timestamptz) ASC`)
      .limit(MAX_DPAS_PER_RUN);

    if (dpas.length === 0) {
      errorDetails.push("no DPAs with ingest_strategy='rss' found");
    }

    for (const dpa of dpas) {
      try {
        if (!dpa.rssUrl) {
          await markDpaIngested(dpa.id);
          skipped++;
          continue;
        }

        const items = await fetchRssFeed(dpa.rssUrl);
        if (items.length === 0) {
          await markDpaIngested(dpa.id);
          skipped++;
          continue;
        }

        const trimmed = items.slice(0, MAX_ITEMS_PER_DPA);
        const decisions = await classifyDpaItems(trimmed, dpa.languageCode);

        if (decisions.length === 0) {
          await markDpaIngested(dpa.id);
          skipped++;
          continue;
        }

        for (const dec of decisions) {
          const res = await upsertDecision(dpa.id, dpa.countryCode, dpa.languageCode, dec);
          if (res === "inserted") inserted++;
          else if (res === "updated") updated++;
          else skipped++;
        }

        await markDpaIngested(dpa.id);
      } catch (e) {
        errors++;
        const msg = e instanceof Error ? e.message : String(e);
        errorDetails.push(`${dpa.id}: ${msg.slice(0, 300)}`);
      }
    }
  } catch (e) {
    errors++;
    errorDetails.push(`fatal: ${e instanceof Error ? e.message : String(e)}`);
  }

  await db.update(childrenIngestLog).set({
    completedAt: new Date(),
    inserted, updated, skipped, errors,
    errorDetails,
  }).where(eq(childrenIngestLog.id, log.id));

  return NextResponse.json({
    pipeline: PIPELINE,
    inserted, updated, skipped, errors,
    errorDetails,
    timestamp: new Date().toISOString(),
  });
}

async function upsertDecision(
  dpaId: string,
  countryCode: string,
  languageCode: string,
  dec: DpaDecisionExtracted,
): Promise<"inserted" | "updated" | "skipped"> {
  const compositeId = `${dpaId}--${dec.external_id}`.slice(0, 120);

  const result = await db
    .insert(childrenDpaDecisions)
    .values({
      id: compositeId,
      dpaId,
      countryCode,
      decisionDate: dec.decision_date,
      publishedDate: dec.published_date ?? null,
      titleOriginal: dec.title_original,
      titleEn: dec.title_en,
      summaryEn: dec.summary_en,
      outcome: dec.outcome,
      fineAmountEur: dec.fine_amount_eur ?? null,
      respondentName: dec.respondent_name ?? null,
      respondentSector: dec.respondent_sector ?? null,
      legalBases: dec.legal_bases,
      ageRangeAffected: dec.age_range_affected ?? null,
      severity: dec.severity,
      sourceUrl: dec.source_url,
      languageOriginal: languageCode,
      ingestSource: "auto",
      externalId: dec.external_id,
      isVerified: false,
    })
    .onConflictDoUpdate({
      target: [childrenDpaDecisions.dpaId, childrenDpaDecisions.externalId],
      set: {
        titleOriginal:    sql`excluded.title_original`,
        titleEn:          sql`excluded.title_en`,
        summaryEn:        sql`excluded.summary_en`,
        outcome:          sql`excluded.outcome`,
        fineAmountEur:    sql`excluded.fine_amount_eur`,
        respondentName:   sql`excluded.respondent_name`,
        respondentSector: sql`excluded.respondent_sector`,
        legalBases:       sql`excluded.legal_bases`,
        severity:         sql`excluded.severity`,
        sourceUrl:        sql`excluded.source_url`,
      },
    })
    .returning({ id: childrenDpaDecisions.id, createdAt: childrenDpaDecisions.createdAt });

  if (result.length === 0) return "skipped";
  const row = result[0];
  const ageMs = Date.now() - new Date(row.createdAt).getTime();
  return ageMs < 5_000 ? "inserted" : "updated";
}

async function markDpaIngested(dpaId: string): Promise<void> {
  await db
    .update(childrenDpaRegistry)
    .set({ lastIngestedAt: new Date() })
    .where(eq(childrenDpaRegistry.id, dpaId));
}
