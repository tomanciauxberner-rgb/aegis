import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const apiKey =
    request.headers.get("x-api-key") ||
    request.nextUrl.searchParams.get("api_key");

  const identifier = apiKey || request.headers.get("x-forwarded-for") || "anon";
  const { success, remaining } = rateLimit(identifier, 30);

  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 30 requests per minute." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        },
      }
    );
  }

  const { searchParams } = request.nextUrl;
  const country = searchParams.get("country");
  const topic = searchParams.get("topic");
  const population = searchParams.get("population");
  const year = searchParams.get("year");

  try {
    const conditions: string[] = [];
    if (country) conditions.push(`c.code = '${country.toUpperCase().replace(/'/g, "")}'`);
    if (topic) conditions.push(`i.topic = '${topic.replace(/'/g, "")}'`);
    if (population) conditions.push(`p.code = '${population.replace(/'/g, "")}'`);
    if (year) conditions.push(`iv.year = ${parseInt(year, 10)}`);

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await db.execute(sql.raw(`
      SELECT
        i.code        AS indicator,
        i.name        AS indicator_name,
        i.topic,
        i.subtopic,
        i.unit,
        iv.value,
        iv.year,
        iv.sample_size,
        p.code        AS population_code,
        p.name        AS population_name,
        c.code        AS country_code,
        c.name        AS country_name,
        s.code        AS survey_code,
        s.name        AS survey_name,
        s.source_url  AS survey_url
      FROM indicator_values iv
      JOIN indicators  i ON iv.indicator_id  = i.id
      JOIN countries   c ON iv.country_id    = c.id
      JOIN surveys     s ON i.survey_id      = s.id
      LEFT JOIN populations p ON iv.population_id = p.id
      ${whereClause}
      ORDER BY c.code, i.topic, iv.year DESC
      LIMIT 500
    `));

    const rows: any[] = Array.isArray(result) ? result : [];

    return NextResponse.json(
      {
        meta: {
          api: "Aegis Open Data API v1",
          source: "EU Agency for Fundamental Rights (FRA)",
          license: "Open data — attribution required. Source: fra.europa.eu",
          filters: { country, topic, population, year },
          total: rows.length,
        },
        data: rows.map((r: any) => ({
          country: { code: r.country_code, name: r.country_name },
          indicator: { code: r.indicator, name: r.indicator_name, topic: r.topic, subtopic: r.subtopic, unit: r.unit },
          population: r.population_code ? { code: r.population_code, name: r.population_name } : null,
          value: Number(r.value),
          year: Number(r.year),
          sampleSize: r.sample_size ? Number(r.sample_size) : null,
          survey: { code: r.survey_code, name: r.survey_name, url: r.survey_url },
        })),
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": remaining.toString(),
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "x-api-key",
        },
      }
    );
  } catch (error) {
    console.error("[API] Indicators error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
