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

  // --- ROMA / EMPLOYMENT ---
  { country: "BG", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 51, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "RO", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 49, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "HU", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 47, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "SK", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 55, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "CZ", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 53, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "ES", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 38, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "GR", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 44, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "FR", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 42, unit: "percent", year: 2021, source: "fra_roma2" },
  { country: "IT", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 40, unit: "percent", year: 2021, source: "fra_roma2" },

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
  // Roma Survey II 2021: ~45% EU-wide employment discrimination
  { country: "EU", group: "roma", sector: "employment", indicator: "experienced_discrimination_employment", value: 45, unit: "percent", year: 2021, source: "fra_roma2" },
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
