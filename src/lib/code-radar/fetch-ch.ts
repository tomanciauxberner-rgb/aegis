import type { CodeRadarPayload } from "@/db/schema/code-radar";

const TIMEOUT_MS = 20000;
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "aegis-code-radar/1.0 (+https://aegis-eu.com)",
  "X-GitHub-Api-Version": "2022-11-28",
};

interface GithubOrg {
  login?: string;
  name?: string;
  public_repos?: number;
}

export async function fetchChSnapshot(): Promise<CodeRadarPayload> {
  const res = await fetch("https://api.github.com/orgs/swiss", {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: HEADERS,
  });
  if (!res.ok) {
    throw new Error(`api.github.com/orgs/swiss: HTTP ${res.status}`);
  }

  const org: unknown = await res.json();
  const repos = (org as GithubOrg)?.public_repos;
  if (typeof repos !== "number") {
    throw new Error("api.github.com: unexpected response shape");
  }

  return {
    fetched_via: "github_org",
    hosts: [
      {
        name: "GitHub — swiss (Swiss Federal Chancellery)",
        kind: "github",
        repositories: repos,
        owners: 1,
      },
    ],
    totals: { hosts: 1, repositories: repos, owners: 1 },
  };
}
