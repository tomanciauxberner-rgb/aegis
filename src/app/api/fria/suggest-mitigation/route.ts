import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") || "anon";
  const { success } = rateLimit(identifier, 10);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "sk-ant-xxxxx") {
    return NextResponse.json({
      suggestions: [
        {
          title: "Implement bias testing protocol",
          description: "Establish regular bias audits using demographically diverse test datasets. Test for disparate impact across protected characteristics before and after deployment.",
          category: "technical",
        },
        {
          title: "Human-in-the-loop review",
          description: "Ensure all AI-generated decisions are reviewed by a qualified human before affecting individuals. Document override rates and reasons.",
          category: "oversight",
        },
        {
          title: "Transparency and notification",
          description: "Inform all affected individuals that AI is being used in the decision-making process. Provide clear explanation of how to contest decisions.",
          category: "transparency",
        },
      ],
      source: "template",
    });
  }

  try {
    const body = await request.json();
    const { riskTitle, riskDescription, rightCategory, country, populations } = body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20241022",
        max_tokens: 1024,
        system: `You are an EU AI Act compliance expert specializing in Fundamental Rights Impact Assessments (FRIA) under Article 27. You suggest concrete, actionable mitigation measures for identified risks to fundamental rights. Always reference relevant EU Charter articles. Be specific and practical — no generic advice. Respond in JSON format only: {"suggestions": [{"title": "...", "description": "...", "category": "technical|oversight|transparency|organizational|legal"}]}`,
        messages: [
          {
            role: "user",
            content: `Suggest 3 specific mitigation measures for this FRIA risk:

Risk: ${riskTitle}
Description: ${riskDescription}
Fundamental Right: ${rightCategory}
Deployment Country: ${country}
Affected Populations: ${populations}

Provide practical, implementable measures that address this specific risk. Reference relevant EU Charter articles and FRA guidelines where applicable.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        suggestions: [
          {
            title: "Review and implement appropriate safeguards",
            description: text.slice(0, 500),
            category: "organizational",
          },
        ],
      };
    }

    return NextResponse.json({ ...parsed, source: "claude" });
  } catch (error) {
    console.error("[API] Mitigation suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
