import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { db } from "@/db/client";
import { codeRadarSnapshots } from "@/db/schema";
import type { CodeRadarPayload } from "@/db/schema/code-radar";
import { RADAR_SOURCES } from "@/lib/code-radar/sources";
import { fetchFrSnapshot } from "@/lib/code-radar/fetch-fr";
import { fetchChSnapshot } from "@/lib/code-radar/fetch-ch";
import { fetchDeSnapshot } from "@/lib/code-radar/fetch-de";

export async function GET(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  const errors: string[] = [];
  let inserted = 0;
  const enabled = RADAR_SOURCES.filter((s) => s.enabled);

  for (const source of enabled) {
    try {
      let payload: CodeRadarPayload;

      switch (source.id) {
        case "fr_codegouv":
          payload = await fetchFrSnapshot();
          break;
        case "ch_github_swiss":
          payload = await fetchChSnapshot();
          break;
        case "de_opencode":
          payload = await fetchDeSnapshot();
          break;
        default:
          throw new Error(`No adapter implemented for ${source.id}`);
      }

      await db.insert(codeRadarSnapshots).values({
        sourceId: source.id,
        country: source.country,
        status: "ok",
        payload,
      });
      inserted++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${source.id}: ${msg}`);
      try {
        await db.insert(codeRadarSnapshots).values({
          sourceId: source.id,
          country: source.country,
          status: "error",
          payload: null,
          error: msg,
        });
      } catch {
        // l'échec d'enregistrement de l'erreur ne doit pas casser la boucle
      }
    }
  }

  return NextResponse.json({
    processed: enabled.length,
    inserted,
    errors,
    timestamp: new Date().toISOString(),
  });
}
