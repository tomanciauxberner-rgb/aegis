const DASHES = /[\u2010-\u2015\u2212]/g;
const QUOTES = /[\u2018\u2019\u201A\u201B\u2032]/g;
const DQUOTES = /[\u201C\u201D\u201E\u201F\u2033]/g;

export function normalizeForMatch(input: string): string {
  return input
    .replace(DASHES, "-")
    .replace(QUOTES, "'")
    .replace(DQUOTES, '"')
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function findLiteral(haystack: string, needle: string): number {
  if (!needle || needle.trim().length < 20) return -1;
  return normalizeForMatch(haystack).indexOf(normalizeForMatch(needle));
}

export function quoteContainsValue(quote: string, value: number): boolean {
  const q = normalizeForMatch(quote).replace(/,/g, ".");
  const asInt = String(Math.round(value));
  const asDec = String(value);
  const re = new RegExp(`(?<![0-9.])(${asDec.replace(".", "\\.")}|${asInt})(?![0-9])`);
  return re.test(q);
}

export type VerificationResult =
  | { ok: true; offset: number }
  | { ok: false; reason: "quote_too_short" | "quote_not_found" | "value_not_in_quote" };

export function verifyAgainstSource(
  sourceText: string,
  quote: string,
  value: number | null,
): VerificationResult {
  if (!quote || quote.trim().length < 20) return { ok: false, reason: "quote_too_short" };
  const offset = findLiteral(sourceText, quote);
  if (offset < 0) return { ok: false, reason: "quote_not_found" };
  if (value !== null && !quoteContainsValue(quote, value)) {
    return { ok: false, reason: "value_not_in_quote" };
  }
  return { ok: true, offset };
}

const AUTHORITY_DOMAINS = [
  "edpb.europa.eu", "edps.europa.eu", "europa.eu", "curia.europa.eu",
  "fra.europa.eu", "eur-lex.europa.eu", "cnil.fr", "garanteprivacy.it",
  "aepd.es", "autoriteitpersoonsgegevens.nl", "datatilsynet.dk",
  "datenschutz-hamburg.de", "dataprotection.ie", "ico.org.uk",
];

export function classifySourceTier(
  url: string | undefined | null,
): "primary" | "secondary" | "unknown" {
  if (!url) return "unknown";
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "unknown";
  }
  const isAuthority = AUTHORITY_DOMAINS.some(
    (d) => host === d || host.endsWith("." + d),
  );
  return isAuthority ? "primary" : "secondary";
}
