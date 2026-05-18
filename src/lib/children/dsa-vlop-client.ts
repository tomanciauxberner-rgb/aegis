const USER_AGENT = "Aegis-Intelligence-Bot/1.0 (+https://aegis-eu.com)";

export interface VlopEntry {
  bundleId: string;
  name: string;
  designationDate: string;
  transparencyUrl: string | null;
  category: string;
}

const KNOWN_VLOPS_BUNDLE_MAP: Record<string, string> = {
  "TikTok": "com.zhiliaoapp.musically",
  "Instagram": "com.burbn.instagram",
  "Facebook": "com.facebook.Facebook",
  "Snapchat": "com.toyopagroup.picaboo",
  "YouTube": "com.google.ios.youtube",
  "X": "com.atebits.Tweetie2",
  "Pinterest": "pinterest",
  "LinkedIn": "com.linkedin.LinkedIn",
  "Booking.com": "com.booking.BookingApp",
  "Amazon Store": "com.amazon.Amazon",
  "AliExpress": "com.alibaba.iAliexpress",
  "Shein": "com.zzkko",
  "Temu": "com.einnovation.temu",
  "Zalando": "de.zalando.mobile",
  "Wikipedia": "org.wikimedia.wikipedia",
  "Google Play": null as unknown as string,
  "Google Search": null as unknown as string,
  "Google Maps": "comgooglemaps",
  "Bing": "com.microsoft.bing",
  "Pornhub": null as unknown as string,
  "Stripchat": null as unknown as string,
  "XVideos": null as unknown as string,
};

export async function fetchDsaVlopList(): Promise<VlopEntry[]> {
  const url = "https://digital-strategy.ec.europa.eu/en/policies/list-designated-vlops-and-vloses";
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`DSA VLOP list: HTTP ${res.status}`);
  }

  const html = await res.text();
  return parseVlopList(html);
}

function parseVlopList(html: string): VlopEntry[] {
  const entries: VlopEntry[] = [];
  const seen = new Set<string>();

  for (const [name, bundleId] of Object.entries(KNOWN_VLOPS_BUNDLE_MAP)) {
    if (!bundleId) continue;
    const escName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const mention = new RegExp(`\\b${escName}\\b`, "i");
    if (!mention.test(html)) continue;
    if (seen.has(bundleId)) continue;
    seen.add(bundleId);

    const dateMatch = html.match(new RegExp(`${escName}[\\s\\S]{0,500}?(\\d{1,2}\\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+\\d{4})`, "i"));
    const designationDate = dateMatch ? normalizeDate(dateMatch[1]) : "2023-04-25";

    const transparencyUrl = extractTransparencyUrl(html, name);

    entries.push({
      bundleId,
      name,
      designationDate,
      transparencyUrl,
      category: inferCategory(name),
    });
  }

  return entries;
}

function normalizeDate(s: string): string {
  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
  };
  const m = s.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!m) return "2023-04-25";
  const day = m[1].padStart(2, "0");
  const month = months[m[2].toLowerCase()] ?? "01";
  return `${m[3]}-${month}-${day}`;
}

function extractTransparencyUrl(html: string, name: string): string | null {
  const escName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escName}[\\s\\S]{0,800}?href="(https?://[^"]+transparenc[^"]+)"`, "i");
  return html.match(re)?.[1] ?? null;
}

function inferCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("tiktok") || lower.includes("snap") || lower.includes("instagram") || lower.includes("facebook") || lower.includes("linkedin") || lower.includes("pinterest") || lower.includes(" x")) return "social_media";
  if (lower.includes("youtube")) return "video_sharing";
  if (lower.includes("amazon") || lower.includes("aliexpress") || lower.includes("shein") || lower.includes("temu") || lower.includes("zalando") || lower.includes("booking")) return "marketplace";
  if (lower.includes("google") || lower.includes("bing")) return "search_engine";
  if (lower.includes("wikipedia")) return "knowledge";
  if (lower.includes("porn") || lower.includes("strip") || lower.includes("xvideos")) return "adult_content";
  return "other";
}
