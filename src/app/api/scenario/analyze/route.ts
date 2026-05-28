import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitDistributed } from "@/lib/rate-limit";
import { buildKnowledgeContext, KB_SOURCES } from "@/lib/scenario/ai-act-knowledge";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const InputSchema = z.object({
  role: z.enum(["provider", "deployer", "both"]),
  nature: z.enum(["standalone", "embedded_product", "gpai", "transparency_only", "unsure"]),
  annexArea: z.string().max(40),
  country: z.string().max(2),
  description: z.string().max(600).optional().or(z.literal("")),
});

const SYSTEM_PROMPT = `You are a regulatory analyst specialised in the EU AI Act. You produce rigorous, sourced scenario analysis for a SPECIFIC AI system described by a user.

ABSOLUTE RULES — these are non-negotiable:
1. You reason ONLY from the KNOWLEDGE BASE provided below. You must NOT introduce regulatory facts, articles, deadlines or obligations that are not in the knowledge base.
2. If something cannot be determined from the knowledge base or the user's description, you mark it explicitly with "verified": false and explain what is missing. Never fabricate certainty.
3. You NEVER invent numerical probabilities or percentages. Divergence is expressed qualitatively only (majority / minority / contested / emerging).
4. You apply the Article 6(3) exception analysis carefully, and you ALWAYS flag that profiling of natural persons forecloses the exception.
5. Your tone is precise and professional. You are not giving legal advice and you say so.
6. You reason about THIS system specifically — not generic boilerplate. Reflect the user's actual description, role, nature, area and country.

You output ONLY valid JSON matching the exact schema given. No markdown, no preamble.`;

function buildUserPrompt(input: z.infer<typeof InputSchema>): string {
  const kb = buildKnowledgeContext();
  return `KNOWLEDGE BASE (your only source of regulatory truth):
${kb}

SYSTEM TO ANALYSE:
- Role of the user: ${input.role}
- Nature of the system: ${input.nature}
- Declared Annex III area: ${input.annexArea}
- Primary country of deployment: ${input.country || "not specified"}
- Description: ${input.description || "(none provided)"}

Produce a scenario analysis for THIS system. Return ONLY this JSON:
{
  "classification": {
    "verdict": "high_risk | likely_high_risk | exception_possible | not_high_risk | undetermined",
    "reasoning": "2-4 sentences applying Annex III + Article 6(3) to THIS system specifically",
    "profilingFlag": "true if the system likely performs profiling of natural persons (which forecloses the 6(3) exception), with one sentence why; else empty string",
    "verified": true/false,
    "gap": "if verified is false, what information is missing to be certain; else empty string"
  },
  "personalDeadline": { "date": "the applicable agreed deadline for this system's category", "note": "1-2 sentences incl. the pending-adoption caveat", "verified": true/false },
  "scenarios": [
    { "id": "short_id", "label": "scenario name", "trigger": "what would make this scenario real", "deadline": "resulting deadline", "exposure": "concrete consequence for THIS system incl. penalties where relevant", "likelihood": "baseline | agreed-pending | contingent | interpretive" }
  ],
  "divergences": [
    { "question": "a real interpretive tension for THIS system", "positions": [ { "stance": "...", "basis": "grounded in the KB", "weight": "majority | minority | contested | emerging" } ] }
  ],
  "robustActions": ["actions valuable whichever timeline lands, specific to this system"],
  "caveat": "one sentence: scenario intelligence, not legal advice, validate with a professional"
}

Produce 3-5 scenarios and 1-3 divergences. Be specific to this system.`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`scenario-analyze:${ip}`, 8);
  if (!success) {
    return NextResponse.json({ error: "Analysis limit reached. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Reasoning engine not configured" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(parsed.data) }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[scenario/analyze] Anthropic error:", err.slice(0, 300));
      return NextResponse.json({ error: "Reasoning engine unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    let analysis: unknown;
    try {
      analysis = JSON.parse(clean);
    } catch {
      console.error("[scenario/analyze] parse error:", raw.slice(0, 300));
      return NextResponse.json({ error: "Could not parse analysis" }, { status: 502 });
    }

    return NextResponse.json({
      analysis,
      sources: KB_SOURCES,
      model: "claude-haiku-4-5",
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[scenario/analyze]", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
