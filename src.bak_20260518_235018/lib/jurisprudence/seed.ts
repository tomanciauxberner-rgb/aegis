import { db } from "@/db/client";
import { jurisprudenceCases, jurisprudenceIngestLog } from "@/db/schema/jurisprudence-table";
import { sql } from "drizzle-orm";
import { ALL_CASES } from "./cases";

export async function seedJurisprudenceCases(): Promise<{
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const [log] = await db
    .insert(jurisprudenceIngestLog)
    .values({ source: "manual" })
    .returning();

  for (const c of ALL_CASES) {
    try {
      const result = await db
        .insert(jurisprudenceCases)
        .values({
          id: c.id,
          court: c.court,
          name: c.name,
          citation: c.citation,
          year: c.year,
          country: c.country,
          summary: c.summary,
          holding: c.holding,
          relevance: c.relevance,
          rightsCategories: c.rights_categories,
          aiActArticles: c.ai_act_articles,
          sectors: c.sectors,
          keywords: c.keywords,
          url: c.url,
          ingestSource: "manual",
        })
        .onConflictDoUpdate({
          target: jurisprudenceCases.id,
          set: {
            name: sql`excluded.name`,
            citation: sql`excluded.citation`,
            year: sql`excluded.year`,
            country: sql`excluded.country`,
            summary: sql`excluded.summary`,
            holding: sql`excluded.holding`,
            relevance: sql`excluded.relevance`,
            rightsCategories: sql`excluded.rights_categories`,
            aiActArticles: sql`excluded.ai_act_articles`,
            sectors: sql`excluded.sectors`,
            keywords: sql`excluded.keywords`,
            url: sql`excluded.url`,
            updatedAt: sql`NOW()`,
          },
        })
        .returning({ id: jurisprudenceCases.id });

      if (result.length > 0) inserted++;
      else skipped++;
    } catch {
      errors++;
    }
  }

  await db
    .update(jurisprudenceIngestLog)
    .set({
      completedAt: new Date(),
      inserted,
      updated,
      skipped,
      errors,
    })
    .where(sql`id = ${log.id}`);

  return { inserted, updated, skipped, errors };
}
