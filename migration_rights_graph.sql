-- ═══════════════════════════════════════════════════════════════
-- Aegis — Unified Rights Graph (Sprint 1)
-- Central node: a REAL deployed AI system, linked to providers,
-- countries, fundamental rights, regulatory positions and SOURCES.
-- Every node carries provenance. Nothing exists without a source.
-- Run ONCE in Supabase. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- Provenance status, shared across graph entities
DO $$ BEGIN
  CREATE TYPE rg_provenance AS ENUM ('verified', 'community', 'expert_validated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rg_risk_tier AS ENUM ('prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'undetermined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE rg_deployment_status AS ENUM ('in_production', 'piloted', 'procured', 'announced', 'withdrawn', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── PROVIDERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rg_providers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(200) NOT NULL,
  country       VARCHAR(2),
  description   TEXT,
  website       VARCHAR(300),
  provenance    rg_provenance NOT NULL DEFAULT 'community',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS rg_providers_name_idx ON rg_providers (lower(name));

-- ── AI SYSTEMS (central node) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS rg_systems (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(250) NOT NULL,
  provider_id       UUID REFERENCES rg_providers(id) ON DELETE SET NULL,
  purpose           TEXT NOT NULL,
  annex_area        VARCHAR(40) NOT NULL,
  risk_tier         rg_risk_tier NOT NULL DEFAULT 'undetermined',
  deployment_status rg_deployment_status NOT NULL DEFAULT 'unknown',
  countries         JSONB NOT NULL DEFAULT '[]',
  legal_basis       TEXT,
  fria_known        BOOLEAN NOT NULL DEFAULT FALSE,
  affects_children  BOOLEAN NOT NULL DEFAULT FALSE,
  affects_migrants  BOOLEAN NOT NULL DEFAULT FALSE,
  provenance        rg_provenance NOT NULL DEFAULT 'community',
  contributor_id    UUID,
  validated_by      UUID,
  validated_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rg_systems_area_idx       ON rg_systems (annex_area);
CREATE INDEX IF NOT EXISTS rg_systems_tier_idx       ON rg_systems (risk_tier);
CREATE INDEX IF NOT EXISTS rg_systems_provenance_idx ON rg_systems (provenance);
CREATE INDEX IF NOT EXISTS rg_systems_children_idx   ON rg_systems (affects_children) WHERE affects_children = TRUE;
CREATE INDEX IF NOT EXISTS rg_systems_migrants_idx   ON rg_systems (affects_migrants) WHERE affects_migrants = TRUE;

-- ── FUNDAMENTAL RIGHTS (reference) ──────────────────────────────
CREATE TABLE IF NOT EXISTS rg_rights (
  id            VARCHAR(60) PRIMARY KEY,
  label         VARCHAR(200) NOT NULL,
  instrument    VARCHAR(120) NOT NULL,
  article       VARCHAR(40)
);

-- ── SYSTEM → RIGHTS impact edges ────────────────────────────────
CREATE TABLE IF NOT EXISTS rg_system_rights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id     UUID NOT NULL REFERENCES rg_systems(id) ON DELETE CASCADE,
  right_id      VARCHAR(60) NOT NULL REFERENCES rg_rights(id) ON DELETE CASCADE,
  impact_note   TEXT,
  provenance    rg_provenance NOT NULL DEFAULT 'community',
  UNIQUE (system_id, right_id)
);

-- ── SOURCES (provenance — every node can be backed) ─────────────
CREATE TABLE IF NOT EXISTS rg_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   VARCHAR(20) NOT NULL,   -- 'system' | 'provider' | 'system_right' | 'position'
  entity_id     UUID NOT NULL,
  title         VARCHAR(400) NOT NULL,
  url           VARCHAR(600) NOT NULL,
  publisher     VARCHAR(200),
  published_at  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rg_sources_entity_idx ON rg_sources (entity_type, entity_id);

-- ── REGULATORY POSITIONS (for the Divergence Engine, Sprint 2) ──
CREATE TABLE IF NOT EXISTS rg_positions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic         VARCHAR(200) NOT NULL,
  authority     VARCHAR(160) NOT NULL,
  stance        TEXT NOT NULL,
  source_url    VARCHAR(600) NOT NULL,
  stated_at     DATE,
  provenance    rg_provenance NOT NULL DEFAULT 'verified',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rg_positions_topic_idx ON rg_positions (lower(topic));

-- ── Seed the fundamental-rights reference (Charter + key instruments) ──
INSERT INTO rg_rights (id, label, instrument, article) VALUES
  ('charter_1',  'Human dignity',                      'EU Charter', 'Art. 1'),
  ('charter_7',  'Respect for private and family life','EU Charter', 'Art. 7'),
  ('charter_8',  'Protection of personal data',        'EU Charter', 'Art. 8'),
  ('charter_11', 'Freedom of expression and information','EU Charter','Art. 11'),
  ('charter_18', 'Right to asylum',                    'EU Charter', 'Art. 18'),
  ('charter_19', 'Protection in removal/expulsion (non-refoulement)','EU Charter','Art. 19'),
  ('charter_21', 'Non-discrimination',                 'EU Charter', 'Art. 21'),
  ('charter_24', 'Rights of the child',                'EU Charter', 'Art. 24'),
  ('charter_47', 'Right to an effective remedy and fair trial','EU Charter','Art. 47'),
  ('uncrc_3',    'Best interests of the child',        'UN CRC',     'Art. 3')
ON CONFLICT (id) DO NOTHING;
