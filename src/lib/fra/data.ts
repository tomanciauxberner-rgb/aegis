import type { DataSource, FraDataPoint } from "@/types/signals";

export const FRA_SOURCES: Record<string, DataSource> = {
  fra_being_black: {
    id: "fra_being_black",
    label: "Being Black in the EU (2023)",
    url: "https://fra.europa.eu/en/publication/2023/being-black-eu",
    year: 2023,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_eumidis2: {
    id: "fra_eumidis2",
    label: "EU-MIDIS II — Minorities & Discrimination Survey (2017)",
    url: "https://fra.europa.eu/en/publication/2017/second-european-union-minorities-and-discrimination-survey-main-results",
    year: 2017,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_muslims: {
    id: "fra_muslims",
    label: "Being Muslim in the EU (2023)",
    url: "https://fra.europa.eu/en/publication/2023/being-muslim-eu",
    year: 2023,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_lgbtiq3: {
    id: "fra_lgbtiq3",
    label: "EU LGBTIQ Survey III (2024)",
    url: "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2024/eu-lgbtiq-survey-iii",
    year: 2024,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_roma2: {
    id: "fra_roma2",
    label: "Roma Survey II (2021)",
    url: "https://fra.europa.eu/en/publication/2022/roma-survey-2021-main-results",
    year: 2021,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_online_hate: {
    id: "fra_online_hate",
    label: "Online Content Moderation Study (2023)",
    url: "https://fra.europa.eu/en/publication/2023/online-content-moderation",
    year: 2023,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_roma3: {
    id: "fra_roma3",
    label: "Roma Survey 2024 — Rights of Roma and Travellers in 13 European Countries",
    url: "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2025/roma-survey-2024",
    year: 2024,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_antisemitism: {
    id: "fra_antisemitism",
    label: "Experiences and Perceptions of Antisemitism (2024)",
    url: "https://fra.europa.eu/en/publication/2024/antisemitism-overview-2024",
    year: 2024,
    publisher: "European Union Agency for Fundamental Rights",
  },
  fra_frr2025: {
    id: "fra_frr2025",
    label: "Fundamental Rights Report 2025",
    url: "https://fra.europa.eu/en/publication/2025/fundamental-rights-report-2025-fra-opinions",
    year: 2025,
    publisher: "European Union Agency for Fundamental Rights",
  },
};

/**
 * Curated FRA discrimination rates by country, group, and sector.
 * Source: FRA survey publications (see FRA_SOURCES above).
 * All values are percentages of respondents reporting discrimination
 * in the past 5 years unless otherwise noted.
 *
 * Last updated: 2024. Refresh from FRA data explorer XLS exports.
 */
export const FRA_DATA: FraDataPoint[] = [
  // --- AFRICAN DESCENT / EMPLOYMENT ---
  { country: "AT", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 52, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "BE", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 44, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "DE", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 48, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "FR", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 40, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "IT", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 38, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "NL", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 42, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "SE", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 36, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "FI", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 57, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "IE", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 35, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "PT", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 30, unit: "percent", year: 2023, source: "fra_being_black" },

  // --- AFRICAN DESCENT / RACIAL HARASSMENT ---
  { country: "AT", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 45, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "BE", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 41, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "DE", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 44, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "FR", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 39, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "FI", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 63, unit: "percent", year: 2023, source: "fra_being_black" },
  { country: "IT", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 36, unit: "percent", year: 2023, source: "fra_being_black" },

  // --- MUSLIMS / EMPLOYMENT ---
  { country: "AT", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 35, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "BE", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 40, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "DE", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 32, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "FR", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 45, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "NL", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 38, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "SE", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 34, unit: "percent", year: 2023, source: "fra_muslims" },

  // --- MUSLIMS / HOUSING ---
  { country: "AT", group: "muslims", sector: "housing", indicator: "discrimination_housing", value: 28, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "BE", group: "muslims", sector: "housing", indicator: "discrimination_housing", value: 31, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "FR", group: "muslims", sector: "housing", indicator: "discrimination_housing", value: 33, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "NL", group: "muslims", sector: "housing", indicator: "discrimination_housing", value: 29, unit: "percent", year: 2023, source: "fra_muslims" },
  { country: "DE", group: "muslims", sector: "housing", indicator: "discrimination_housing", value: 26, unit: "percent", year: 2023, source: "fra_muslims" },

  // --- ROMA / EMPLOYMENT (Roma Survey 2024 — fieldwork June-Dec 2024) ---
  // Job search discrimination (12 months): EU avg 36%, doubled from 16% in 2016
  { country: "BG", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 34, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "RO", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 42, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "HU", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 38, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "CZ", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 40, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "ES", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 30, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "GR", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 35, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "FR", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 33, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "IT", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 37, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "PT", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 28, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "IE", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 39, unit: "percent", year: 2024, source: "fra_roma3" },

  // --- ROMA / HOUSING (Roma Survey 2024 — 35% EU avg, down from 41% in 2016) ---
  { country: "BG", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 38, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "RO", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 40, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "HU", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 37, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "CZ", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 32, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "ES", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 28, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "GR", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 42, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "FR", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 36, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "IT", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 39, unit: "percent", year: 2024, source: "fra_roma3" },

  // --- ROMA / POVERTY (Roma Survey 2024 — 70% EU avg at-risk-of-poverty) ---
  { country: "BG", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 82, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "RO", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 76, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "HU", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 72, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "GR", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 78, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "ES", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 65, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "IT", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 68, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "CZ", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 58, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "FR", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 55, unit: "percent", year: 2024, source: "fra_roma3" },

  // --- ROMA / EDUCATION (Roma Survey 2024 — 46% school segregation) ---
  { country: "BG", group: "roma", sector: "education", indicator: "school_segregation", value: 60, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "HU", group: "roma", sector: "education", indicator: "school_segregation", value: 61, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "RO", group: "roma", sector: "education", indicator: "school_segregation", value: 52, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "GR", group: "roma", sector: "education", indicator: "school_segregation", value: 55, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "CZ", group: "roma", sector: "education", indicator: "school_segregation", value: 48, unit: "percent", year: 2024, source: "fra_roma3" },
  { country: "ES", group: "roma", sector: "education", indicator: "school_segregation", value: 28, unit: "percent", year: 2024, source: "fra_roma3", note: "Significant improvement from 45% in 2019/2021" },
  { country: "IT", group: "roma", sector: "education", indicator: "school_segregation", value: 44, unit: "percent", year: 2024, source: "fra_roma3" },

  // --- ANTISEMITISM (FRA Jewish Experiences Survey 2024 — 13 MS, 8000+ respondents) ---
  { country: "DE", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 80, unit: "percent", year: 2024, source: "fra_antisemitism", note: "80% perceived discrimination in at least one life domain" },
  { country: "FR", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 85, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "BE", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 79, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "NL", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 73, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "AT", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 78, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "HU", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 82, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "SE", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 75, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "IT", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 71, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "ES", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 68, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "PL", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 77, unit: "percent", year: 2024, source: "fra_antisemitism" },
  { country: "DK", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 70, unit: "percent", year: 2024, source: "fra_antisemitism" },

  // --- LGBTIQ / EMPLOYMENT ---
  { country: "PL", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 31, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "HU", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 28, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "LT", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 29, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "RO", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 27, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "DE", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 17, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "FR", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 19, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "SE", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 14, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "NL", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 15, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
  { country: "BE", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 18, unit: "percent", year: 2024, source: "fra_lgbtiq3" },

  // --- ONLINE HATE ---
  { country: "EU", group: "african_descent", sector: "online", indicator: "hateful_posts_passing_moderation", value: 50, unit: "percent", year: 2023, source: "fra_online_hate", note: "FRA study: >50% of assessed posts still considered hateful after platform moderation" },

  // --- EU AVERAGES (from FRA survey aggregate reports) ---
  // Being Black in the EU 2023: 45% EU-wide racial discrimination in past 5 years
  { country: "EU", group: "african_descent", sector: "employment", indicator: "experienced_discrimination_employment", value: 45, unit: "percent", year: 2023, source: "fra_being_black" },
  // Being Black in the EU 2023: 30% EU-wide racist harassment
  { country: "EU", group: "african_descent", sector: "online", indicator: "experienced_racial_harassment", value: 30, unit: "percent", year: 2023, source: "fra_being_black" },
  // Being Muslim in the EU 2023: ~36% EU-wide employment discrimination
  { country: "EU", group: "muslims", sector: "employment", indicator: "experienced_discrimination_employment", value: 36, unit: "percent", year: 2023, source: "fra_muslims" },
  // Being Muslim in the EU 2023: ~28% EU-wide housing discrimination
  { country: "EU", group: "muslims", sector: "housing", indicator: "discrimination_housing", value: 28, unit: "percent", year: 2023, source: "fra_muslims" },
  // Roma Survey 2024: 36% EU-wide job search discrimination (doubled from 16% in 2016)
  { country: "EU", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 36, unit: "percent", year: 2024, source: "fra_roma3" },
  // Roma Survey 2024: 35% EU-wide housing discrimination
  { country: "EU", group: "roma", sector: "housing", indicator: "discrimination_housing", value: 35, unit: "percent", year: 2024, source: "fra_roma3" },
  // Roma Survey 2024: 70% EU-wide poverty rate
  { country: "EU", group: "roma", sector: "essential_services", indicator: "poverty_risk", value: 70, unit: "percent", year: 2024, source: "fra_roma3" },
  // Roma Survey 2024: 46% EU-wide school segregation
  { country: "EU", group: "roma", sector: "education", indicator: "school_segregation", value: 46, unit: "percent", year: 2024, source: "fra_roma3" },
  // Antisemitism Survey 2024: ~96% encountered antisemitic attitudes or incidents
  { country: "EU", group: "jews", sector: "online", indicator: "experienced_antisemitic_incident", value: 76, unit: "percent", year: 2024, source: "fra_antisemitism" },
  // LGBTIQ Survey III 2024: ~21% EU-wide employment discrimination
  { country: "EU", group: "lgbtiq", sector: "employment", indicator: "experienced_discrimination_employment", value: 21, unit: "percent", year: 2024, source: "fra_lgbtiq3" },
];

/**
 * Returns all data points matching the given filters.
 * Any filter left undefined matches all values.
 */
export function getFraData(filters: {
  country?: string;
  group?: string;
  sector?: string;
}): FraDataPoint[] {
  return FRA_DATA.filter((d) => {
    if (filters.country && d.country !== filters.country && d.country !== "EU") return false;
    if (filters.group && d.group !== filters.group) return false;
    if (filters.sector && d.sector !== filters.sector) return false;
    return true;
  });
}

/**
 * Returns available groups for a given country.
 */
export function getAvailableGroups(countryCode: string): string[] {
  const groups = new Set(
    FRA_DATA
      .filter((d) => d.country === countryCode || d.country === "EU")
      .map((d) => d.group)
  );
  return Array.from(groups);
}
