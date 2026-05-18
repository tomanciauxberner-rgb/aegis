import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { db } from "@/db/client";
import { jurisprudenceCases } from "@/db/schema/jurisprudence-table";
import { inArray } from "drizzle-orm";
import { FriaPdfDocument } from "@/lib/fria/pdf-template";
import { z } from "zod";
import type { FriaWizardState } from "@/types";
import type { JurisprudenceCase } from "@/types/jurisprudence";

const BodySchema = z.object({
  state: z.object({
    step: z.number(),
    systemId: z.string(),
    context: z.object({
      deploymentDescription: z.string(),
      operationalFrequency: z.string(),
      duration: z.string(),
      humanOversightMeasures: z.string(),
    }),
    affectedGroups: z.array(z.object({
      populationCode: z.string(),
      estimatedSize: z.string(),
      vulnerabilityLevel: z.enum(["minimal", "low", "medium", "high", "critical"]),
      specificConcerns: z.string(),
    })),
    risks: z.array(z.object({
      id: z.string(),
      rightsCategoryCode: z.string(),
      title: z.string(),
      description: z.string(),
      likelihood: z.enum(["minimal", "low", "medium", "high", "critical"]),
      severity: z.enum(["minimal", "low", "medium", "high", "critical"]),
      dataEvidence: z.array(z.object({
        indicatorId: z.string(),
        value: z.number(),
        country: z.string(),
        year: z.number(),
        source: z.string(),
      })).default([]),
    })),
    mitigations: z.array(z.object({
      id: z.string(),
      riskId: z.string(),
      title: z.string(),
      description: z.string(),
      responsible: z.string(),
      deadline: z.string(),
    })),
    dpiaReference: z.string(),
    dpiaOverlapNotes: z.string(),
    selectedCases: z.array(z.string()),
  }),
  systemName: z.string().max(200).default("AI System"),
  orgName: z.string().max(200).default("Organisation"),
  format: z.enum(["pdf", "json"]).default("pdf"),
});

export async function POST(request: NextRequest) {
  const identifier =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anon";

  const { success } = rateLimit(identifier, 10);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { state, systemName, orgName, format } = parsed.data;

  if (format === "json") {
    const exportData = {
      meta: {
        format: "aegis-fria-v1",
        generatedAt: new Date().toISOString(),
        systemName,
        orgName,
        legalBasis: "Art. 27 Regulation (EU) 2024/1689",
      },
      state,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fria-${systemName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}.json"`,
      },
    });
  }

  let cases: JurisprudenceCase[] = [];
  if (state.selectedCases.length > 0) {
    const rows = await db
      .select()
      .from(jurisprudenceCases)
      .where(inArray(jurisprudenceCases.id, state.selectedCases.slice(0, 20)));

    cases = rows.map((r) => ({
      id: r.id,
      court: r.court,
      name: r.name,
      citation: r.citation,
      year: r.year,
      country: r.country,
      summary: r.summary,
      holding: r.holding,
      relevance: r.relevance,
      rights_categories: (r.rightsCategories as string[]) ?? [],
      ai_act_articles: (r.aiActArticles as string[]) ?? [],
      sectors: (r.sectors as string[]) ?? [],
      keywords: (r.keywords as string[]) ?? [],
      url: r.url,
    }));
  }

  const generatedAt = new Date().toISOString();

  const pdfBuffer = await renderToBuffer(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(FriaPdfDocument, {
      state: state as FriaWizardState,
      systemName,
      orgName,
      cases,
      generatedAt,
    }) as any
  );

  const filename = `fria-${systemName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}.pdf`;

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBuffer.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
