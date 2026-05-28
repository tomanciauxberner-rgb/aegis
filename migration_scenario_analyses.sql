-- ═══════════════════════════════════════════════════════════════
-- Aegis — Scenario analyses persistence (Sprint C)
-- Stores each generated regulatory scenario analysis + expert validation.
-- Anonymous: no user identifiers on public analyses, only the regulatory content.
-- Run ONCE in Supabase. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE scenario_review_status AS ENUM ('unreviewed', 'validated', 'corrected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS scenario_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role            VARCHAR(20)  NOT NULL,
  nature          VARCHAR(30)  NOT NULL,
  annex_area      VARCHAR(40)  NOT NULL,
  country         VARCHAR(2),
  description     TEXT,
  verdict         VARCHAR(40),
  profiling_flag  BOOLEAN      NOT NULL DEFAULT FALSE,
  analysis        JSONB        NOT NULL,
  model           VARCHAR(60),
  review_status   scenario_review_status NOT NULL DEFAULT 'unreviewed',
  reviewer_id     UUID,
  reviewer_note   TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS scenario_analyses_area_idx    ON scenario_analyses (annex_area, created_at DESC);
CREATE INDEX IF NOT EXISTS scenario_analyses_review_idx  ON scenario_analyses (review_status, created_at DESC);
CREATE INDEX IF NOT EXISTS scenario_analyses_created_idx ON scenario_analyses (created_at DESC);
