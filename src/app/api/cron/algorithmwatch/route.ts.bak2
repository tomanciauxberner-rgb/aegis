import { NextRequest, NextResponse } from "next/server";
import { insertSignals, buildExternalId } from "@/lib/signal-inserter";

const RSS_URL = "https://algorithmwatch.org/en/feed/";

const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

const COUNTRY_NAMES: Record<string, string> = {
  austria:"AT", belgium:"BE", bulgaria:"BG", croatia:"HR", cyprus:"CY",
  czechia:"CZ", "czech republic":"CZ", denmark:"DK", estonia:"EE",
  finland:"FI", france:"FR", germany:"DE", greece:"GR", hungary:"HU",
  ireland:"IE", italy:"IT", latvia:"LV", lithuania:"LT", luxembourg:"LU",
  malta:"MT", netherlands:"NL", poland:"PL", portugal:"PT", romania:"RO",
  slovakia:"SK", slovenia:"SI", spain:"ES", sweden:"SE",
};

async function fetchRssItems(): Promise<{ title: string; link: string; description: string; pubDate: string }[]> {
  const res = await fetch(RSS_URL, {
    headers: { "User-Agent": "Aegis-Intelligence-Bot/1.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();

  const items: { title: string; link: string; description: string; pubDate: string }[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const match of itemMatches) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
      ?? block.match(/<guid>(.*?)<\/guid>/)?.[1] ?? "";
    const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/s)?.[1]
      ?? block.match(/<description>(.*?)<\/description>/s)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    if (title && link) items.push({ title, link, description: description.slice(0, 1000), pubDate });
  }

  return items.slice(0, 20);
}

async function parseWithClaude(items: { title: string; link: string; description: string; pubDate: string }[]): Promise<{
  country: string;
  group_id: string;
  sector: string;
  severity: "critical" | "elevated" | "watch";
  title: string;
  summary: string;
  year: number;
  url: string;
  external_id_suffix: string;
}[]> {
  const prompt = `You are an EU fundamental rights analyst. Analyze these news items from AlgorithmWatch and extract only those that describe a concrete algorithmic discrimination incident or bias case in an EU27 country.

EU27 countries: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden.

For each relevant item, extract:
- country: ISO 2-letter code (EU27 only — skip if not EU27 or unclear)
- group_id: one of: african_descent, roma, muslims, lgbtiq, women, disabilities, migrants, jews, general
- sector: one of: employment, education, housing, healthcare, law_enforcement, essential_services, online, justice
- severity: critical (rights violation ruled/documented), elevated (significant bias documented), watch (concern raised)
- title: concise factual title max 100 chars
- summary: 1-2 sentences, factual, max 200 chars
- year: publication year as integer
- url: the article link
- external_id_suffix: slug derived from title, lowercase, hyphens only, max 50 chars

Respond ONLY with a JSON array. Empty array if no relevant items. No markdown, no preamble.

ITEMS:
${items.map((i, idx) => `[${idx}] TITLE: ${i.title}\nURL: ${i.link}\nDATE: ${i.pubDate}\nDESC: ${i.description}`).join("\n\n")}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();
  const raw = data.content?.[0]?.text ?? "[]";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await fetchRssItems();
    if (items.length === 0) {
      return NextResponse.json({ processed: 0, inserted: 0, skipped: 0, errors: [], timestamp: new Date().toISOString() });
    }

    const parsed = await parseWithClaude(items);

    const valid = parsed.filter((p) => EU27.has(p.country));

    const signals = valid.map((p) => ({
      country: p.country,
      group_id: p.group_id,
      sector: p.sector,
      signal_type: "incident" as const,
      severity: p.severity,
      title: p.title,
      summary: p.summary,
      source_label: "AlgorithmWatch",
      source_url: p.url,
      year_observed: p.year,
      external_id: buildExternalId("aw", p.country, p.external_id_suffix),
    }));

    const result = await insertSignals(signals);

    return NextResponse.json({
      processed: items.length,
      extracted: valid.length,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[cron/algorithmwatch]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
