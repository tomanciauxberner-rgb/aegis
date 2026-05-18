import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") || "anon";
  const { success } = rateLimit(identifier, 30);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const countryCode = searchParams.get("country");
  const populationCode = searchParams.get("population");

  if (!countryCode) {
    return NextResponse.json(
      { error: "country parameter required" },
      { status: 400 }
    );
  }

  try {
    let query;

    if (populationCode) {
      query = sql`
        SELECT
          i.code as indicator_code,
          i.name as indicator_name,
          i.description as indicator_description,
          i.topic,
          i.subtopic,
          iv.value,
          iv.year,
          iv.sample_size,
          p.code as population_code,
          p.name as population_name,
          s.code as survey_code,
          s.name as survey_name,
          s.source_url as survey_url,
          c.code as country_code,
          c.name as country_name,
          c.region as country_region
        FROM indicator_values iv
        JOIN indicators i ON iv.indicator_id = i.id
        JOIN populations p ON iv.population_id = p.id
        JOIN surveys s ON i.survey_id = s.id
        JOIN countries c ON iv.country_id = c.id
        WHERE c.code = ${countryCode.toUpperCase()}
          AND p.code = ${populationCode}
        ORDER BY iv.year DESC, i.topic
      `;
    } else {
      query = sql`
        SELECT
          i.code as indicator_code,
          i.name as indicator_name,
          i.description as indicator_description,
          i.topic,
          i.subtopic,
          iv.value,
          iv.year,
          iv.sample_size,
          p.code as population_code,
          p.name as population_name,
          s.code as survey_code,
          s.name as survey_name,
          s.source_url as survey_url,
          c.code as country_code,
          c.name as country_name,
          c.region as country_region
        FROM indicator_values iv
        JOIN indicators i ON iv.indicator_id = i.id
        JOIN populations p ON iv.population_id = p.id
        JOIN surveys s ON i.survey_id = s.id
        JOIN countries c ON iv.country_id = c.id
        WHERE c.code = ${countryCode.toUpperCase()}
        ORDER BY iv.year DESC, i.topic
      `;
    }

    const results = await db.execute(query);
    const rows: any[] = Array.isArray(results) ? results : [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({
        country: { code: countryCode.toUpperCase(), name: countryCode, region: "" },
        overallRisk: "unknown",
        totalIndicators: 0,
        riskBreakdown: {},
        indicators: [],
      });
    }

    const countryInfo = {
      code: String(rows[0].country_code),
      name: String(rows[0].country_name),
      region: String(rows[0].country_region),
    };

    const riskIndicators = (rows as any[]).map((r: any) => {
      const val = Number(r.value) || 0;
      const topic = String(r.topic || "");
      let riskSignal: string;

      if (topic === "discrimination" || topic === "hate_crime") {
        if (val >= 70) riskSignal = "critical";
        else if (val >= 55) riskSignal = "high";
        else if (val >= 35) riskSignal = "medium";
        else if (val >= 15) riskSignal = "low";
        else riskSignal = "minimal";
      } else if (topic === "trust") {
        if (val <= 20) riskSignal = "critical";
        else if (val <= 35) riskSignal = "high";
        else if (val <= 50) riskSignal = "medium";
        else riskSignal = "low";
      } else if (topic === "poverty") {
        if (val >= 80) riskSignal = "critical";
        else if (val >= 60) riskSignal = "high";
        else if (val >= 40) riskSignal = "medium";
        else riskSignal = "low";
      } else {
        if (val >= 55) riskSignal = "high";
        else if (val >= 30) riskSignal = "medium";
        else riskSignal = "low";
      }

      return {
        indicator: String(r.indicator_code),
        name: String(r.indicator_name),
        description: String(r.indicator_description || ""),
        topic,
        subtopic: String(r.subtopic || ""),
        value: val,
        year: Number(r.year),
        sampleSize: Number(r.sample_size) || null,
        population: {
          code: String(r.population_code),
          name: String(r.population_name),
        },
        source: {
          survey: String(r.survey_code),
          name: String(r.survey_name),
          url: String(r.survey_url || ""),
        },
        riskSignal,
      };
    });

    const riskCounts = riskIndicators.reduce(
      (acc: Record<string, number>, ind: any) => {
        acc[ind.riskSignal] = (acc[ind.riskSignal] || 0) + 1;
        return acc;
      },
      {}
    );

    let overallRisk = "minimal";
    if ((riskCounts.critical || 0) >= 3) overallRisk = "critical";
    else if (riskCounts.critical) overallRisk = "high";
    else if ((riskCounts.high || 0) >= 2) overallRisk = "high";
    else if (riskCounts.high) overallRisk = "medium";
    else if (riskCounts.medium) overallRisk = "medium";
    else if (riskCounts.low) overallRisk = "low";

    return NextResponse.json({
      country: countryInfo,
      overallRisk,
      totalIndicators: riskIndicators.length,
      riskBreakdown: riskCounts,
      indicators: riskIndicators,
    });
  } catch (error) {
    console.error("[API] Country risk error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
