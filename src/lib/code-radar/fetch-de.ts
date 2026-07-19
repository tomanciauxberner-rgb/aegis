import type { CodeRadarPayload } from "@/db/schema/code-radar";

const BASE = "https://gitlab.opencode.de/api/v4";
const TIMEOUT_MS = 20000;
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "aegis-code-radar/1.0 (+https://aegis-eu.com)",
};

async function countFromHeader(url: string): Promise<number | null> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`gitlab.opencode.de: HTTP ${res.status}`);
  const total = res.headers.get("x-total");
  if (total === null) return null;
  const n = Number(total);
  return Number.isFinite(n) ? n : null;
}

export async function fetchDeSnapshot(): Promise<CodeRadarPayload> {
  const repositories = await countFromHeader(
    `${BASE}/projects?per_page=1&simple=true`
  );
  if (repositories === null) {
    throw new Error("gitlab.opencode.de: X-Total header missing on /projects");
  }

  let owners = 0;
  try {
    owners =
      (await countFromHeader(`${BASE}/groups?per_page=1&top_level_only=true`)) ??
      0;
  } catch {
    owners = 0;
  }

  return {
    fetched_via: "gitlab_api",
    hosts: [
      {
        name: "GitLab — openCoDE (ZenDiS / BMDS)",
        kind: "gitlab",
        repositories,
        owners,
      },
    ],
    totals: { hosts: 1, repositories, owners },
  };
}
