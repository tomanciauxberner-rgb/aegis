import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { recommendations } from "@/db/schema/tables";
import { desc, eq } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import type { RecommendationInput, RecommendationSavePayload } from "@/types/recommendations";
import type { SignalDetail } from "@/types/alerts";

const GROUP_LABELS: Record<string, string> = {
  african_descent: "People of African descent",
  roma: "Roma",
  muslims: "Muslims",
  lgbtiq: "LGBTIQ people",
  women: "Women",
  disabilities: "Persons with disabilities",
  migrants: "Migrants",
  jews: "Jews",
  general: "General population",
};

const SECTOR_LABELS: Record<string, string> = {
  employment: "Employment",
  education: "Education",
  housing: "Housing",
  healthcare: "Healthcare",
  law_enforcement: "Law enforcement",
  essential_services: "Essential services",
  online: "Online",
  justice: "Justice",
};

function generateRefNumber(country: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `AEGIS-${year}-${country}-${seq}`;
}

function buildPrompt(input: RecommendationInput): string {
  const groupLabel = GROUP_LABELS[input.groupId] ?? input.groupId;
  const sectorLabel = SECTOR_LABELS[input.sector] ?? input.sector;

  const evidenceLines = input.signalDetails.map((s) => {
    const parts = [`[${s.signal_type.toUpperCase()}] ${s.title}`];
    if (s.summary) parts.push(s.summary);
    if (s.delta_pp !== null) parts.push(`Delta: ${s.delta_pp > 0 ? "+" : ""}${s.delta_pp}pp`);
    if (s.source) parts.push(`Source: ${s.source}${s.year ? ` (${s.year})` : ""}`);
    return parts.join(" | ");
  }).join("\n");

  const severityExplain = {
    critical: "Critical — multiple severe signals converge with documented harm",
    elevated: "Elevated — concerning pattern detected across signal types",
    watch: "Watch — signals present but below alarm threshold",
  }[input.severity] ?? input.severity;

  return `You are a senior analyst at a fundamental rights intelligence platform. Generate a formal intelligence brief based strictly on the data provided. Do not add any information not present below.

COUNTRY: ${input.country}
POPULATION GROUP: ${groupLabel}
SECTOR: ${sectorLabel}
SEVERITY LEVEL: ${input.severity.toUpperCase()} — ${severityExplain}
SIGNAL TYPES PRESENT: ${input.convergenceScore}/3 (statistical, legislative, incident)

EVIDENCE:
${evidenceLines}

Generate EXACTLY this JSON structure, nothing else, no markdown, no preamble:
{
  "situation": "2-3 sentences. Factual summary referencing the severity level (${input.severity}), group, sector, and country. Reference specific data points and delta values from the evidence. Do NOT describe the situation as critical or maximum unless severity is CRITICAL.",
  "eu_context": "1-2 sentences. How this situation compares to EU-wide patterns based on delta_pp values in the evidence. If no EU comparison data is available, state: No EU comparative data available in current dataset."
}

RULES:
- Match tone to severity: watch=measured, elevated=concerned, critical=urgent
- Every claim must be traceable to the evidence above
- No hedging language (no "may", "might", "could")
- No recommendations — those fields are for the analyst to complete
- Formal register, suitable for official institutional communication
- situation max 60 words
- eu_context max 40 words`;
}

export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 10);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = (body as any)?.action;

  if (action === "generate") {
    const input = body as { action: string } & RecommendationInput;

    if (!input.alertId || !input.country || !input.groupId || !input.sector) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = buildPrompt(input);

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("[recommendations/generate] Anthropic error:", err);
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const anthropicData = await anthropicRes.json();
    const rawText = anthropicData.content?.[0]?.text ?? "";

    let parsed: { situation: string; eu_context: string };
    try {
      const clean = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      console.error("[recommendations/generate] Parse error:", rawText);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
    }

    return NextResponse.json({
      situation: parsed.situation,
      euContext: parsed.eu_context,
      evidenceBase: input.signalDetails,
      refNumber: generateRefNumber(input.country),
    });
  }

  if (action === "save") {
    const payload = (body as { action: string } & RecommendationSavePayload);

    if (!payload.addressee || !payload.legalBasis || !payload.actionRequested || !payload.deadline) {
      return NextResponse.json(
        { error: "All four recommendation fields are required before saving" },
        { status: 400 }
      );
    }

    try {
      const [saved] = await db.insert(recommendations).values({
        alertId: payload.alertId,
        country: payload.country,
        groupId: payload.groupId,
        sector: payload.sector,
        convergenceScore: payload.convergenceScore,
        severity: payload.severity,
        situation: payload.situation,
        evidenceBase: payload.evidenceBase as any,
        euContext: payload.euContext,
        addressee: payload.addressee,
        legalBasis: payload.legalBasis,
        actionRequested: payload.actionRequested,
        deadline: payload.deadline,
        refNumber: payload.refNumber,
      }).returning();

      return NextResponse.json(saved, { status: 201 });
    } catch (error) {
      console.error("[recommendations/save] DB error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 30);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");

  try {
    const query = db
      .select()
      .from(recommendations)
      .orderBy(desc(recommendations.createdAt))
      .limit(50);

    const data = country
      ? await db.select().from(recommendations)
          .where(eq(recommendations.country, country.toUpperCase()))
          .orderBy(desc(recommendations.createdAt))
          .limit(50)
      : await query;

    return NextResponse.json({ recommendations: data, total: data.length });
  } catch (error) {
    console.error("[recommendations/get] DB error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
