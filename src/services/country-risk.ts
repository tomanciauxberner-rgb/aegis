import { db } from "@/db/client";
import { countries, indicators, indicatorValues, populations } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { CountryRiskProfile, RiskLevel } from "@/types";

function computeRiskSignal(value: number, indicator: string): RiskLevel {
  if (indicator.includes("discrimination") || indicator.includes("hate")) {
    if (value >= 60) return "critical";
    if (value >= 40) return "high";
    if (value >= 20) return "medium";
    if (value >= 10) return "low";
    return "minimal";
  }
  if (value >= 50) return "high";
  if (value >= 25) return "medium";
  if (value >= 10) return "low";
  return "minimal";
}

export async function getCountryRiskProfile(
  countryCode: string,
  topic?: string
): Promise<CountryRiskProfile | null> {
  const country = await db.query.countries.findFirst({
    where: eq(countries.code, countryCode.toUpperCase()),
  });

  if (!country) return null;

  let query = db
    .select({
      indicatorCode: indicators.code,
      indicatorName: indicators.name,
      value: indicatorValues.value,
      year: indicatorValues.year,
      sampleSize: indicatorValues.sampleSize,
      populationCode: populations.code,
      surveyId: indicators.surveyId,
    })
    .from(indicatorValues)
    .innerJoin(indicators, eq(indicatorValues.indicatorId, indicators.id))
    .leftJoin(populations, eq(indicatorValues.populationId, populations.id))
    .where(eq(indicatorValues.countryId, country.id))
    .orderBy(desc(indicatorValues.year))
    .limit(100);

  const results = await query;

  const profileIndicators = results.map((r) => ({
    code: r.indicatorCode,
    name: r.indicatorName,
    value: Number(r.value) || 0,
    year: r.year,
    population: r.populationCode || undefined,
    source: "FRA Survey Data",
    riskSignal: computeRiskSignal(Number(r.value) || 0, r.indicatorCode),
  }));

  const riskCounts = profileIndicators.reduce(
    (acc, ind) => {
      acc[ind.riskSignal] = (acc[ind.riskSignal] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  let overallRiskSignal: RiskLevel = "minimal";
  if (riskCounts.critical) overallRiskSignal = "critical";
  else if (riskCounts.high && riskCounts.high >= 3) overallRiskSignal = "high";
  else if (riskCounts.medium && riskCounts.medium >= 3)
    overallRiskSignal = "medium";
  else if (riskCounts.low) overallRiskSignal = "low";

  return {
    countryCode: country.code,
    countryName: country.name,
    indicators: profileIndicators,
    overallRiskSignal,
  };
}
