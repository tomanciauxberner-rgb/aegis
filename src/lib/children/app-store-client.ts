const USER_AGENT = "Aegis-Intelligence-Bot/1.0 (+https://aegis-eu.com)";
const TIMEOUT_MS = 15_000;

export interface AppStoreEntry {
  bundleId: string;
  name: string;
  publisher: string;
  category: string;
  declaredMinAge: number | null;
  rank: number;
  trackId?: number;
  url: string;
}

const ITUNES_GENRE_KIDS = "6020";
const ITUNES_GENRE_SOCIAL = "6005";
const ITUNES_GENRE_ENTERTAINMENT = "6016";
const ITUNES_GENRE_GAMES = "6014";

const CONTENT_RATING_AGE: Record<string, number> = {
  "4+": 4, "9+": 9, "12+": 12, "17+": 17,
};

export async function fetchItunesTopFree(
  countryCode: string,
  genreId: string,
  limit = 50,
): Promise<AppStoreEntry[]> {
  const country = countryCode.toLowerCase();
  const url = `https://itunes.apple.com/${country}/rss/topfreeapplications/limit=${limit}/genre=${genreId}/json`;

  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept": "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`iTunes ${country}/${genreId}: HTTP ${res.status}`);
  }

  const data = await res.json();
  const entries = data?.feed?.entry;
  if (!Array.isArray(entries)) return [];

  return entries.map((e: Record<string, unknown>, idx: number): AppStoreEntry | null => {
    try {
      const id = (e["id"] as Record<string, unknown>)?.["attributes"] as Record<string, string> | undefined;
      const bundleId = id?.["im:bundleId"];
      const trackId = id?.["im:id"];
      const name = ((e["im:name"] as Record<string, unknown>)?.["label"]) as string | undefined;
      const publisher = ((e["im:artist"] as Record<string, unknown>)?.["label"]) as string | undefined;
      const category = (((e["category"] as Record<string, unknown>)?.["attributes"]) as Record<string, string> | undefined)?.["label"];
      const contentRating = ((e["im:contentType"] as Record<string, unknown>)?.["attributes"]) as Record<string, string> | undefined;
      const ratingLabel = (e["im:rentalPrice"] === undefined && contentRating?.["label"]) || "";
      const link = (((e["link"] as Record<string, unknown> | undefined)?.["attributes"]) as Record<string, string> | undefined)?.["href"];

      const ratingMatch = JSON.stringify(e).match(/"contentAdvisoryRating"[^"]*"label":"([^"]+)"/);
      const advisoryLabel = ratingMatch?.[1] ?? ratingLabel;
      const declaredMinAge = advisoryLabel && CONTENT_RATING_AGE[advisoryLabel] !== undefined
        ? CONTENT_RATING_AGE[advisoryLabel]
        : null;

      if (!bundleId || !name) return null;
      return {
        bundleId,
        name,
        publisher: publisher ?? "Unknown",
        category: category ?? "unknown",
        declaredMinAge,
        rank: idx + 1,
        trackId: trackId ? parseInt(trackId, 10) : undefined,
        url: link ?? `https://apps.apple.com/${country}/app/id${trackId}`,
      };
    } catch {
      return null;
    }
  }).filter((x: AppStoreEntry | null): x is AppStoreEntry => x !== null);
}

export interface ItunesChartRequest {
  countryCode: string;
  category: "kids" | "social" | "entertainment" | "games";
  limit?: number;
}

export async function fetchItunesChart(req: ItunesChartRequest): Promise<AppStoreEntry[]> {
  const genreMap: Record<ItunesChartRequest["category"], string> = {
    kids: ITUNES_GENRE_KIDS,
    social: ITUNES_GENRE_SOCIAL,
    entertainment: ITUNES_GENRE_ENTERTAINMENT,
    games: ITUNES_GENRE_GAMES,
  };
  return fetchItunesTopFree(req.countryCode, genreMap[req.category], req.limit ?? 50);
}

export async function lookupItunesApp(trackId: number, countryCode: string): Promise<{
  contentAdvisoryRating?: string;
  trackContentRating?: string;
  bundleId?: string;
  trackName?: string;
  artistName?: string;
  primaryGenreName?: string;
} | null> {
  const url = `https://itunes.apple.com/lookup?id=${trackId}&country=${countryCode.toLowerCase()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) return null;
  return {
    contentAdvisoryRating: r.contentAdvisoryRating,
    trackContentRating: r.trackContentRating,
    bundleId: r.bundleId,
    trackName: r.trackName,
    artistName: r.artistName,
    primaryGenreName: r.primaryGenreName,
  };
}
