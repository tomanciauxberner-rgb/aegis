import type { RssItem } from "@/types/children-v2";

const USER_AGENT = "Mozilla/5.0 (compatible; AegisBot/1.0; +https://aegis-eu.com/bot)";

export async function fetchRssFeed(url: string, timeoutMs = 15_000): Promise<RssItem[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`RSS fetch ${url} failed: HTTP ${res.status}`);
  }

  const xml = await res.text();
  return parseRssXml(xml);
}

function parseRssXml(xml: string): RssItem[] {
  const items: RssItem[] = [];

  const itemMatches = xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi);
  for (const match of itemMatches) {
    const block = match[1];
    const item = extractRssItem(block);
    if (item) items.push(item);
  }

  if (items.length === 0) {
    const entryMatches = xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi);
    for (const match of entryMatches) {
      const block = match[1];
      const item = extractAtomEntry(block);
      if (item) items.push(item);
    }
  }

  return items;
}

function extractRssItem(block: string): RssItem | null {
  const title = extractTag(block, "title");
  const link = extractTag(block, "link") || extractTag(block, "guid");
  const description = extractTag(block, "description") || extractTag(block, "content:encoded") || "";
  const pubDate = extractTag(block, "pubDate") || extractTag(block, "dc:date") || "";
  if (!title || !link) return null;
  return { title, link, description: description.slice(0, 2000), pubDate };
}

function extractAtomEntry(block: string): RssItem | null {
  const title = extractTag(block, "title");
  const linkHref = block.match(/<link\b[^>]*href=["']([^"']+)["']/i)?.[1] || "";
  const description = extractTag(block, "summary") || extractTag(block, "content") || "";
  const pubDate = extractTag(block, "updated") || extractTag(block, "published") || "";
  if (!title || !linkHref) return null;
  return { title, link: linkHref, description: description.slice(0, 2000), pubDate };
}

function extractTag(block: string, tag: string): string {
  const escTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cdataRe = new RegExp(`<${escTag}\\b[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escTag}>`, "i");
  const cdata = block.match(cdataRe)?.[1];
  if (cdata) return decodeEntities(cdata.trim());

  const plainRe = new RegExp(`<${escTag}\\b[^>]*>([\\s\\S]*?)<\\/${escTag}>`, "i");
  const plain = block.match(plainRe)?.[1];
  if (plain) return decodeEntities(stripHtml(plain).trim());

  return "";
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}
