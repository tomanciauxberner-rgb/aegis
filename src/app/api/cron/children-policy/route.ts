import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  childrenPolicySources,
  childrenPolicySignals,
  childrenIngestLog,
} from "@/db/schema";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchRssFeed } from "@/lib/children/rss-fetcher";
import {
  classifyPolicyItems,
  type PolicySignalExtracted,
} from "@/lib/children/policy-classifier";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PIPELINE = "children-policy";
const MAX_SOURCES_PER_RUN = 20;
const MAX_ITEMS_PER_SOURCE = 25;
const MIN_RELEVANCE_TO_INSERT = 25;

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
    const sources = await db
      .select()
      .from(childrenPolicySources)
      .where(and(
        eq(childrenPolicySources.isActive, true),
        eq(childrenPolicySources.ingestStrategy, "rss"),
      ))
      .orderBy(sql`COALESCE(${childrenPolicySources.lastIngestedAt}, '1970-01-01'::timestamptz) ASC`)
      .limit(MAX_SOURCES_PER_RUN);

    if (sources.length === 0) {
      errorDetails.push("no policy sources with ingest_strategy='rss' found");
    }

    for (const source of sources) {
      try {
        if (!source.rssUrl) {
          await markSourceIngested(source.id);
          skipped++;
          continue;
        }

        const items = await fetchRssFeed(source.rssUrl);
        if (items.length === 0) {
          await markSourceIngested(source.id);
          skipped++;
          continue;
        }

        const trimmed = items.slice(0, MAX_ITEMS_PER_SOURCE);
        const signals = await classifyPolicyItems(trimmed, source.name, source.languageCode);

        if (signals.length === 0) {
          await markSourceIngested(source.id);
          skipped++;
          continue;
        }

        for (const sig of signals) {
          if (sig.relevance_score < MIN_RELEVANCE_TO_INSERT) {
            skipped++;
            continue;
          }
          const res = await upsertSignal(source.id, source.languageCode, sig);
          if (res === "inserted") inserted++;
          else if (res === "updated") updated++;
          else skipped++;
        }

        await markSourceIngested(source.id);
      } catch (e) {
        errors++;
        const msg = e instanceof Error ? e.message : String(e);
        errorDetails.push(`${source.id}: ${msg.slice(0, 300)}`);
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

async function upsertSignal(
  sourceId: string,
  languageCode: string,
  sig: PolicySignalExtracted,
): Promise<"inserted" | "updated" | "skipped"> {
  const compositeId = `${sourceId}--${sig.external_id}`.slice(0, 160);

  const result = await db
    .insert(childrenPolicySignals)
    .values({
      id: compositeId,
      sourceId,
      signalType: sig.signal_type,
      status: sig.status,
      titleOriginal: sig.title_original,
      titleEn: sig.title_en,
      summaryEn: sig.summary_en,
      signalDate: sig.signal_date,
      deadlineDate: sig.deadline_date ?? null,
      jurisdiction: sig.jurisdiction,
      countryCodes: sig.country_codes,
      themes: sig.themes,
      legalFrameworks: sig.legal_frameworks,
      relevanceScore: Math.max(0, Math.min(100, Math.round(sig.relevance_score))),
      whyItMatters: sig.why_it_matters,
      stakeholders: sig.stakeholders,
      sourceUrl: sig.source_url,
      languageOriginal: languageCode,
      externalId: sig.external_id,
      isVerified: false,
    })
    .onConflictDoUpdate({
      target: [childrenPolicySignals.sourceId, childrenPolicySignals.externalId],
      set: {
        signalType:       sql`excluded.signal_type`,
        status:           sql`excluded.status`,
        titleOriginal:    sql`excluded.title_original`,
        titleEn:          sql`excluded.title_en`,
        summaryEn:        sql`excluded.summary_en`,
        signalDate:       sql`excluded.signal_date`,
        deadlineDate:     sql`excluded.deadline_date`,
        themes:           sql`excluded.themes`,
        legalFrameworks:  sql`excluded.legal_frameworks`,
        relevanceScore:   sql`excluded.relevance_score`,
        whyItMatters:     sql`excluded.why_it_matters`,
        stakeholders:     sql`excluded.stakeholders`,
        sourceUrl:        sql`excluded.source_url`,
      },
    })
    .returning({ id: childrenPolicySignals.id, createdAt: childrenPolicySignals.createdAt });

  if (result.length === 0) return "skipped";
  const row = result[0];
  const ageMs = Date.now() - new Date(row.createdAt).getTime();
  return ageMs < 5_000 ? "inserted" : "updated";
}

async function markSourceIngested(sourceId: string): Promise<void> {
  await db
    .update(childrenPolicySources)
    .set({ lastIngestedAt: new Date() })
    .where(eq(childrenPolicySources.id, sourceId));
}
