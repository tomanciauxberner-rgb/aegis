import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { rgSystems, rgProviders, rgSources } from "@/db/schema/rights-graph";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { canContribute } from "@/lib/auth/contributor";

export const dynamic = "force-dynamic";

const Schema = z.object({
  name: z.string().trim().min(2).max(250),
  provider: z.string().trim().max(200).optional().or(z.literal("")),
  purpose: z.string().trim().min(5).max(2000),
  annexArea: z.string().max(40),
  riskTier: z.enum(["prohibited", "high_risk", "limited_risk", "minimal_risk", "undetermined"]).default("undetermined"),
  deploymentStatus: z.enum(["in_production", "piloted", "procured", "announced", "withdrawn", "unknown"]).default("unknown"),
  countries: z.array(z.string().max(2)).max(27).default([]),
  legalBasis: z.string().max(2000).optional().or(z.literal("")),
  affectsChildren: z.boolean().default(false),
  affectsMigrants: z.boolean().default(false),
  source: z.object({
    title: z.string().trim().min(2).max(400),
    url: z.string().trim().url().max(600),
    publisher: z.string().max(200).optional().or(z.literal("")),
  }),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canContribute(user.id))) {
    return NextResponse.json({ error: "Contributor access required" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the fields. A primary source (title + URL) is required.", details: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  try {
    let providerId: string | null = null;
    if (d.provider) {
      const existing = await db.select({ id: rgProviders.id }).from(rgProviders).where(eq(rgProviders.name, d.provider)).limit(1);
      if (existing.length > 0) providerId = existing[0].id;
      else {
        const [p] = await db.insert(rgProviders).values({ name: d.provider, provenance: "community" }).returning({ id: rgProviders.id });
        providerId = p.id;
      }
    }

    const [sys] = await db.insert(rgSystems).values({
      name: d.name,
      providerId,
      purpose: d.purpose,
      annexArea: d.annexArea,
      riskTier: d.riskTier,
      deploymentStatus: d.deploymentStatus,
      countries: d.countries,
      legalBasis: d.legalBasis || null,
      affectsChildren: d.affectsChildren,
      affectsMigrants: d.affectsMigrants,
      provenance: "community",
      contributorId: user.id,
    }).returning({ id: rgSystems.id });

    await db.insert(rgSources).values({
      entityType: "system",
      entityId: sys.id,
      title: d.source.title,
      url: d.source.url,
      publisher: d.source.publisher || null,
    });

    return NextResponse.json({ id: sys.id, provenance: "community" }, { status: 201 });
  } catch (e) {
    console.error("[rg/submit]", e);
    return NextResponse.json({ error: "Could not submit system" }, { status: 500 });
  }
}
