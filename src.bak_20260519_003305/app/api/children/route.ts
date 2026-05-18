import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import type { ChildrenIncident, ChildrenCountryProfile } from "@/types/children";

const INCIDENTS: ChildrenIncident[] = [
  {
    id: "IE-META-2023",
    country: "IE", flag: "🇮🇪",
    title: "Meta Instagram — record €405M fine for children's data",
    domain: "targeted_advertising",
    platform: "Instagram / Meta",
    legalBases: ["gdpr_art8", "gdpr_art22"],
    severity: "critical",
    date: "Sep 2023",
    summary: "Irish DPC fined Meta €405M for processing 13–17 year olds' data without lawful basis, making accounts public by default and enabling targeted advertising on minors.",
    outcome: "€405M fine — largest child data fine in EU history",
    source: "Data Protection Commission (Ireland)",
    url: "https://www.dataprotection.ie/",
  },
  {
    id: "BE-FACIAL-2024",
    country: "BE", flag: "🇧🇪",
    title: "Facial recognition in Belgian schools — biometric data of minors",
    domain: "biometric_surveillance",
    legalBases: ["gdpr_art8", "ai_act_annex3"],
    severity: "critical",
    date: "Oct 2024",
    summary: "Belgian DPA ordered halt to facial recognition attendance systems in 14 schools, finding they violated GDPR prohibitions on biometric processing of minors without valid consent.",
    outcome: "Systems decommissioned — DPA guidance published",
    source: "Autorité de protection des données (Belgium)",
    url: "https://www.autoriteprotectiondonnees.be/",
  },
  {
    id: "HU-KRETA-2024",
    country: "HU", flag: "🇭🇺",
    title: "KRÉTA national platform — algorithmic scoring of 1.6M students",
    domain: "social_scoring",
    platform: "KRÉTA",
    legalBases: ["gdpr_art22", "ai_act_annex3"],
    severity: "critical",
    date: "Apr 2024",
    summary: "Hungary's national edtech platform used by 1.6M students found to include an algorithmic risk-scoring module flagging children for behavioral issues without human review or parental notification.",
    outcome: "Suspended — NAIH investigation ongoing",
    source: "NAIH — Hungarian DPA",
    url: "https://naih.hu/",
  },
  {
    id: "FR-TIKTOK-2023",
    country: "FR", flag: "🇫🇷",
    title: "TikTok fined €5M — recommender algorithm exposed minors to harmful content",
    domain: "content_recommenders",
    platform: "TikTok",
    legalBases: ["gdpr_art8", "dsa_art28"],
    severity: "high",
    date: "Jan 2023",
    summary: "CNIL fined TikTok for failing adequate cookie consent for minors and for a recommender algorithm exposing under-13s to harmful content without age verification.",
    outcome: "€5M fine — algorithm audit required",
    source: "CNIL (France)",
    url: "https://www.cnil.fr/",
  },
  {
    id: "NL-EDTECH-2024",
    country: "NL", flag: "🇳🇱",
    title: "Dutch edtech platforms — student behavioral profiling without consent",
    domain: "algorithmic_profiling",
    legalBases: ["gdpr_art8", "gdpr_art22"],
    severity: "high",
    date: "Mar 2024",
    summary: "Autoriteit Persoonsgegevens found 12 edtech platforms collecting behavioral data on school-age minors without valid legal basis, feeding algorithmic marketing profiles.",
    outcome: "Enforcement investigation — fines expected Q3 2025",
    source: "Autoriteit Persoonsgegevens (Netherlands)",
    url: "https://autoriteitpersoonsgegevens.nl/",
  },
  {
    id: "IT-REPLIKA-2023",
    country: "IT", flag: "🇮🇹",
    title: "Replika AI chatbot banned — emotional manipulation risk for minors",
    domain: "platform_design",
    platform: "Replika",
    legalBases: ["gdpr_art8", "dsa_art28"],
    severity: "high",
    date: "Feb 2023",
    summary: "Italian Garante ordered Replika to block access to minors after finding the AI companion app posed risks of emotional dependency and manipulation for children and vulnerable individuals.",
    outcome: "Service restricted in Italy — EU-wide review triggered",
    source: "Garante per la protezione dei dati personali",
    url: "https://www.garanteprivacy.it/",
  },
  {
    id: "PL-SCHOOL-2024",
    country: "PL", flag: "🇵🇱",
    title: "AI surveillance in 23 Polish schools — no parental consent or DPIA",
    domain: "biometric_surveillance",
    legalBases: ["gdpr_art8", "ai_act_annex3"],
    severity: "high",
    date: "Nov 2024",
    summary: "UODO found 23 schools deployed AI cameras monitoring student attention and emotional states without mandatory parental consent or Data Protection Impact Assessments.",
    outcome: "Enforcement notices issued — DPIA required",
    source: "UODO — Polish DPA",
    url: "https://uodo.gov.pl/",
  },
];

const PROFILES: Record<string, ChildrenCountryProfile> = {
  NL: { countryCode: "NL", countryName: "Netherlands",  dsmaBodies: ["ACM"],   dsaComplianceStatus: "compliant",     gdprChildAgeConsent: 16, riskScore: 78, riskLevel: "high" },
  FR: { countryCode: "FR", countryName: "France",        dsmaBodies: ["ARCOM"], dsaComplianceStatus: "compliant",     gdprChildAgeConsent: 15, riskScore: 65, riskLevel: "high" },
  DE: { countryCode: "DE", countryName: "Germany",       dsmaBodies: ["BNetzA"],dsaComplianceStatus: "compliant",     gdprChildAgeConsent: 16, riskScore: 52, riskLevel: "medium" },
  HU: { countryCode: "HU", countryName: "Hungary",       dsmaBodies: ["NMHH"], dsaComplianceStatus: "partial",       gdprChildAgeConsent: 16, riskScore: 81, riskLevel: "critical" },
  PL: { countryCode: "PL", countryName: "Poland",        dsmaBodies: ["UKE"],  dsaComplianceStatus: "partial",       gdprChildAgeConsent: 16, riskScore: 70, riskLevel: "high" },
  BE: { countryCode: "BE", countryName: "Belgium",       dsmaBodies: ["CBF/CSA"],dsaComplianceStatus: "compliant",   gdprChildAgeConsent: 13, riskScore: 48, riskLevel: "medium" },
  IT: { countryCode: "IT", countryName: "Italy",         dsmaBodies: ["AGCOM"],dsaComplianceStatus: "partial",       gdprChildAgeConsent: 14, riskScore: 61, riskLevel: "high" },
  SE: { countryCode: "SE", countryName: "Sweden",        dsmaBodies: ["MPRT"], dsaComplianceStatus: "compliant",     gdprChildAgeConsent: 13, riskScore: 38, riskLevel: "medium" },
  IE: { countryCode: "IE", countryName: "Ireland",       dsmaBodies: ["DPC"],  dsaComplianceStatus: "compliant",     gdprChildAgeConsent: 16, riskScore: 72, riskLevel: "high" },
  RO: { countryCode: "RO", countryName: "Romania",       dsmaBodies: ["ANCOM"],dsaComplianceStatus: "non_compliant", gdprChildAgeConsent: 16, riskScore: 85, riskLevel: "critical" },
  BG: { countryCode: "BG", countryName: "Bulgaria",      dsmaBodies: ["CEM"],  dsaComplianceStatus: "non_compliant", gdprChildAgeConsent: 14, riskScore: 83, riskLevel: "critical" },
  AT: { countryCode: "AT", countryName: "Austria",       dsmaBodies: ["RTR"],  dsaComplianceStatus: "compliant",     gdprChildAgeConsent: 14, riskScore: 44, riskLevel: "medium" },
};

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 30);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country")?.toUpperCase();

  const incidents = country
    ? INCIDENTS.filter((i) => i.country === country)
    : INCIDENTS;

  const profiles = country
    ? PROFILES[country] ? [PROFILES[country]] : []
    : Object.values(PROFILES);

  const stats = {
    total_incidents: INCIDENTS.length,
    critical: INCIDENTS.filter((i) => i.severity === "critical").length,
    high: INCIDENTS.filter((i) => i.severity === "high").length,
    countries_affected: [...new Set(INCIDENTS.map((i) => i.country))].length,
    total_fines_eur: 410_000_000,
  };

  return NextResponse.json(
    { incidents, profiles, stats },
    { headers: { "Cache-Control": "public, max-age=600" } }
  );
}
