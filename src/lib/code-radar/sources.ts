export type SourceKind =
  | "ecosystems_api"
  | "gitlab_api"
  | "github_org"
  | "custom";

export interface RadarSource {
  id: string;
  country: string;
  label: string;
  kind: SourceKind;
  enabled: boolean;
  note: string;
}

/**
 * Une source ne passe enabled: true qu'après vérification réelle de son
 * endpoint (shape JSON confirmée). Les sources éteintes restent visibles
 * ici pour documenter la couverture cible du radar.
 */
export const RADAR_SOURCES: RadarSource[] = [
  {
    id: "fr_codegouv",
    country: "FR",
    label: "code.gouv.fr — data.code.gouv.fr (Ecosyste.ms)",
    kind: "ecosystems_api",
    enabled: true,
    note: "Vérifiée live le 2026-07-18 — agrégats servis par forge (repositories_count, owners_count).",
  },
  {
    id: "ch_github_swiss",
    country: "CH",
    label: "github.com/swiss — Swiss Federal Chancellery",
    kind: "github_org",
    enabled: true,
    note: "Endpoint api.github.com/orgs/swiss vérifié le 2026-07-18 (public_repos: 55). Hors UE27 — ancre narrative EMBAG.",
  },
  {
    id: "de_opencode",
    country: "DE",
    label: "openCoDE — gitlab.opencode.de",
    kind: "gitlab_api",
    enabled: false,
    note: "Instance GitLab — endpoint à vérifier avant activation.",
  },
  {
    id: "it_developers_italia",
    country: "IT",
    label: "Developers Italia — catalogue publiccode.yml",
    kind: "custom",
    enabled: false,
    note: "Endpoint API à épingler avant activation.",
  },
  {
    id: "nl_oss_register",
    country: "NL",
    label: "developer.overheid.nl — OSS-register",
    kind: "custom",
    enabled: false,
    note: "Clé lecture X-Api-Key à demander avant activation.",
  },
];
