import type { CodeRadarPayload, HostStat } from "@/db/schema/code-radar";

const BASE = "https://data.code.gouv.fr/api/v1";
const TIMEOUT_MS = 20000;
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "aegis-code-radar/1.0 (+https://aegis-eu.com)",
};

interface EcosystemsHost {
  name?: string;
  kind?: string | null;
  repositories_count?: number;
  owners_count?: number;
}

function isHost(x: unknown): x is EcosystemsHost {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as EcosystemsHost).repositories_count === "number"
  );
}

function buildPayload(
  hosts: EcosystemsHost[],
  fetchedVia: string
): CodeRadarPayload {
  const mapped: HostStat[] = hosts.map((h) => ({
    name: h.name ?? "unknown",
    kind: h.kind ?? null,
    repositories: h.repositories_count ?? 0,
    owners: h.owners_count ?? 0,
  }));

  return {
    fetched_via: fetchedVia,
    hosts: mapped,
    totals: {
      hosts: mapped.length,
      repositories: mapped.reduce((s, h) => s + h.repositories, 0),
      owners: mapped.reduce((s, h) => s + h.owners, 0),
    },
  };
}

export async function fetchFrSnapshot(): Promise<CodeRadarPayload> {
  try {
    const res = await fetch(`${BASE}/hosts`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: HEADERS,
    });
    if (res.ok) {
      const json: unknown = await res.json();
      if (Array.isArray(json) && json.length > 0 && json.every(isHost)) {
        return buildPayload(json as EcosystemsHost[], "hosts_index");
      }
    }
  } catch {
    // repli sur l'endpoint vérifié le 2026-07-18
  }

  const res = await fetch(`${BASE}/hosts/GitHub`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`data.code.gouv.fr: HTTP ${res.status}`);

  const host: unknown = await res.json();
  if (!isHost(host)) {
    throw new Error("data.code.gouv.fr: unexpected response shape");
  }
  return buildPayload([host], "host_github_fallback");
}
