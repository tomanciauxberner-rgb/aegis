/**
 * Maps the Rights Graph `annex_area` free-form values to FRIA Studio
 * domain codes. Defensive: unknown values fall back to null so the
 * caller can prompt for manual domain selection rather than guessing wrong.
 */

import { ANNEX3_DOMAINS } from "./annex3-taxonomy";

// Known aliases observed in the Rights Graph data, mapped to canonical domain codes.
const AREA_ALIASES: Record<string, string> = {
  // biometric
  "biometric": "biometric",
  "biometrics": "biometric",
  "annex_iii_1": "biometric",
  "annex3_1": "biometric",
  // critical infrastructure
  "critical_infrastructure": "critical_infrastructure",
  "infrastructure": "critical_infrastructure",
  "annex_iii_2": "critical_infrastructure",
  "annex3_2": "critical_infrastructure",
  // education
  "education": "education",
  "education_vocational": "education",
  "edtech": "education",
  "annex_iii_3": "education",
  "annex3_3": "education",
  // employment
  "employment": "employment",
  "employment_hr": "employment",
  "hr": "employment",
  "workforce": "employment",
  "annex_iii_4": "employment",
  "annex3_4": "employment",
  // essential services
  "essential_services": "essential_services",
  "essential": "essential_services",
  "credit": "essential_services",
  "insurance": "essential_services",
  "benefits": "essential_services",
  "annex_iii_5": "essential_services",
  "annex3_5": "essential_services",
  // law enforcement
  "law_enforcement": "law_enforcement",
  "police": "law_enforcement",
  "annex_iii_6": "law_enforcement",
  "annex3_6": "law_enforcement",
  // migration
  "migration": "migration",
  "asylum": "migration",
  "border": "migration",
  "border_control": "migration",
  "annex_iii_7": "migration",
  "annex3_7": "migration",
  // justice & democratic
  "justice": "justice",
  "democratic": "justice",
  "elections": "justice",
  "administration_of_justice": "justice",
  "annex_iii_8": "justice",
  "annex3_8": "justice",
};

export function mapAnnexAreaToDomain(annexArea: string | null | undefined): string | null {
  if (!annexArea) return null;
  const normalised = annexArea.trim().toLowerCase().replace(/[\s\-]+/g, "_");

  // Direct canonical match
  if (ANNEX3_DOMAINS.some((d) => d.code === normalised)) return normalised;

  // Alias match
  if (AREA_ALIASES[normalised]) return AREA_ALIASES[normalised];

  // Substring heuristic as last resort
  for (const [alias, code] of Object.entries(AREA_ALIASES)) {
    if (normalised.includes(alias) || alias.includes(normalised)) return code;
  }

  return null;
}
