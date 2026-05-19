import type { ResolvedJurisdiction, Jurisdiction } from "./types";
import { KNOWN_JURISDICTIONS } from "./types";

interface JurisdictionRule {
  jurisdiction: Jurisdiction;
  patterns: RegExp[];
  confidence: number;
  reason: string;
}

const JURISDICTION_RULES: JurisdictionRule[] = [
  {
    jurisdiction: "us",
    confidence: 0.95,
    reason: "US regulator or law detected",
    patterns: [
      /\b(ftc|coppa|ccpa|ferpa|hipaa)\b/i,
      /\b(united\s*states|u\.s\.|usa|american?\s*(law|regulation|market))\b/i,
      /\b(federal\s*trade\s*commission|california\s*consumer)\b/i,
      /\b(youth\s*ai\s*privacy\s*act|senator\s*markey)\b/i,
    ],
  },
  {
    jurisdiction: "gb",
    confidence: 0.93,
    reason: "UK regulator or law detected",
    patterns: [
      /\b(ico|ofcom|age\s*appropriate\s*design\s*code|children'?s?\s*code)\b/i,
      /\b(united\s*kingdom|uk\s*(law|regulation|market)|britain|british)\b/i,
      /\b(online\s*safety\s*act|online\s*safety\s*bill)\b/i,
    ],
  },
  {
    jurisdiction: "eu",
    confidence: 0.92,
    reason: "EU framework or regulator detected",
    patterns: [
      /\b(gdpr|rgpd|dsa|dma|ai\s*act|edpb|edps|cnil|garante|aepd|bfdi)\b/i,
      /\b(european?\s*(union|commission|parliament|court|data\s*protection))\b/i,
      /\b(eu\s*(law|regulation|directive|market)|article\s*\d+\s*(gdpr|dsa|ai\s*act))\b/i,
      /\b(fra|fundamental\s*rights\s*agency|eu\s*charter)\b/i,
      /\b(annex\s*iii|ai\s*act\s*art\.?\s*\d+|dsa\s*art\.?\s*\d+)\b/i,
    ],
  },
];

const EU_LANGUAGE_CODES = new Set([
  "fr", "de", "es", "it", "pt", "nl", "pl", "sv", "da", "fi",
  "el", "cs", "ro", "hu", "bg", "hr", "sk", "sl", "et", "lv",
  "lt", "mt", "ga",
]);

function detectLanguage(text: string): string | null {
  const frScore = (text.match(/\b(le|la|les|de|du|des|un|une|et|est|pour|dans|avec|sur|au|aux|ce|cette|qui|que|pas|plus|tout|être|avoir)\b/gi) ?? []).length;
  const deScore = (text.match(/\b(der|die|das|den|dem|des|ein|eine|und|ist|für|mit|auf|bei|von|zu|nicht|auch|sich|aber|werden)\b/gi) ?? []).length;
  const esScore = (text.match(/\b(el|la|los|las|un|una|de|del|en|con|por|para|que|es|son|está|tiene|como|más|pero)\b/gi) ?? []).length;

  const max = Math.max(frScore, deScore, esScore);
  if (max < 3) return null;
  if (max === frScore) return "fr";
  if (max === deScore) return "de";
  return "es";
}

export function resolveJurisdictions(
  text: string,
  contextJurisdiction?: string,
): ResolvedJurisdiction[] {
  const results: ResolvedJurisdiction[] = [];
  const seen = new Set<Jurisdiction>();

  if (contextJurisdiction) {
    const ctx = contextJurisdiction.toLowerCase() as Jurisdiction;
    const isKnown = (KNOWN_JURISDICTIONS as readonly string[]).includes(ctx);
    results.push({ jurisdiction: ctx, confidence: isKnown ? 1.0 : 0.90, reason: "Explicit context override" });
    seen.add(ctx);
  }

  for (const rule of JURISDICTION_RULES) {
    if (seen.has(rule.jurisdiction)) continue;
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        results.push({
          jurisdiction: rule.jurisdiction,
          confidence: rule.confidence,
          reason: rule.reason,
        });
        seen.add(rule.jurisdiction);
        break;
      }
    }
  }

  if (results.length === 0) {
    const lang = detectLanguage(text);
    if (lang && EU_LANGUAGE_CODES.has(lang)) {
      results.push({
        jurisdiction: "eu",
        confidence: 0.60,
        reason: `EU language detected (${lang}), defaulting to EU jurisdiction`,
      });
    } else {
      results.push({
        jurisdiction: "eu",
        confidence: 0.50,
        reason: "No jurisdiction signal found, defaulting to EU",
      });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}
