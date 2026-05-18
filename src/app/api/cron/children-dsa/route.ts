import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  childrenApps,
  childrenDsaReports,
  childrenIngestLog,
} from "@/db/schema/children";
import { verifyCronSecret } from "@/lib/cron-auth";
import { fetchDsaVlopList } from "@/lib/children/dsa-vlop-client";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const PIPELINE = "children-dsa-reports";
const USER_AGENT = "Aegis-Intelligence-Bot/1.0 (+https://aegis-eu.com)";

interface DsaReportEntry {
  bundleId: string;
  appName: string;
  periodStart: string;
  periodEnd: string;
  reportUrl: string;
  metrics: Record<string, unknown>;
  minorsSpecific: Record<string, unknown>;
}

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
    const vlops = await fetchDsaVlopList();
    if (vlops.length === 0) {
      errorDetails.push("vlop-list empty");
    }

    for (const v of vlops) {
      try {
        const appRow = await db
          .select({ id: childrenApps.id })
          .from(childrenApps)
          .where(eq(childrenApps.bundleId, v.bundleId))
          .limit(1);

        let appId: string;
        if (appRow.length === 0) {
          const newAppId = `ios-${v.bundleId}`;
          await db.insert(childrenApps).values({
            id: newAppId,
            bundleId: v.bundleId,
            name: v.name,
            publisher: null,
            platforms: ["ios"],
            isVlop: true,
            vlopDesignationDate: v.designationDate,
            dsaTransparencyUrl: v.transparencyUrl,
            category: v.category,
          }).onConflictDoNothing();
          appId = newAppId;
        } else {
          appId = appRow[0].id;
        }

        if (!v.transparencyUrl) {
          skipped++;
          continue;
        }

        const reports = await fetchTransparencyReportIndex(v.transparencyUrl, v.bundleId, v.name);

        for (const r of reports) {
          const reportId = `${v.bundleId}-${r.periodStart}-${r.periodEnd}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 120);

          const result = await db
            .insert(childrenDsaReports)
            .values({
              id: reportId,
              appId,
              periodStart: r.periodStart,
              periodEnd: r.periodEnd,
              reportUrl: r.reportUrl,
              metrics: r.metrics,
              minorsSpecific: r.minorsSpecific,
            })
            .onConflictDoUpdate({
              target: [childrenDsaReports.appId, childrenDsaReports.periodStart, childrenDsaReports.periodEnd],
              set: {
                reportUrl: sql`excluded.report_url`,
                metrics: sql`excluded.metrics`,
                minorsSpecific: sql`excluded.minors_specific`,
                ingestedAt: sql`NOW()`,
              },
            })
            .returning({ id: childrenDsaReports.id, ingestedAt: childrenDsaReports.ingestedAt });

          if (result.length > 0) {
            const ageMs = Date.now() - new Date(result[0].ingestedAt).getTime();
            if (ageMs < 5_000) inserted++; else updated++;
          }
        }
      } catch (e) {
        errors++;
        errorDetails.push(`${v.bundleId}: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300));
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

async function fetchTransparencyReportIndex(
  transparencyUrl: string,
  bundleId: string,
  appName: string,
): Promise<DsaReportEntry[]> {
  const res = await fetch(transparencyUrl, {
    headers: { "User-Agent": USER_AGENT, "Accept": "text/html" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const pdfMatches = Array.from(html.matchAll(/href="([^"]+\.pdf)"/gi));
  const entries: DsaReportEntry[] = [];
  const seen = new Set<string>();

  for (const m of pdfMatches.slice(0, 12)) {
    const link = m[1];
    if (seen.has(link)) continue;
    seen.add(link);

    const fullUrl = link.startsWith("http") ? link : new URL(link, transparencyUrl).toString();
    const period = extractPeriodFromUrl(fullUrl) ?? extractPeriodFromContext(html, link);
    if (!period) continue;

    entries.push({
      bundleId,
      appName,
      periodStart: period.start,
      periodEnd: period.end,
      reportUrl: fullUrl,
      metrics: {},
      minorsSpecific: {},
    });
  }

  return entries;
}

function extractPeriodFromUrl(url: string): { start: string; end: string } | null {
  const m1 = url.match(/(20\d{2})[-_/]?H1/i);
  if (m1) return { start: `${m1[1]}-01-01`, end: `${m1[1]}-06-30` };
  const m2 = url.match(/(20\d{2})[-_/]?H2/i);
  if (m2) return { start: `${m2[1]}-07-01`, end: `${m2[1]}-12-31` };
  const m3 = url.match(/(20\d{2})[-_/]?Q([1-4])/i);
  if (m3) {
    const y = m3[1];
    const q = parseInt(m3[2], 10);
    const startMonth = String((q - 1) * 3 + 1).padStart(2, "0");
    const endMonth = String(q * 3).padStart(2, "0");
    const endDay = q === 1 || q === 4 ? "31" : "30";
    return { start: `${y}-${startMonth}-01`, end: `${y}-${endMonth}-${endDay}` };
  }
  return null;
}

function extractPeriodFromContext(html: string, link: string): { start: string; end: string } | null {
  const escLink = link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const window = new RegExp(`(.{0,300})${escLink}(.{0,300})`, "i");
  const ctx = html.match(window);
  if (!ctx) return null;
  const text = `${ctx[1]} ${ctx[2]}`;
  return extractPeriodFromUrl(text);
}
