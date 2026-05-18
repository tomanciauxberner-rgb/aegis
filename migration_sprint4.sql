-- Sprint 4: Jurisprudence engine — production schema
-- Run ONCE against your Supabase Postgres instance
-- Safe to re-run: all statements use IF NOT EXISTS / DO $$ blocks

CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$ BEGIN
  CREATE TYPE jurisprudence_court AS ENUM ('CJEU','ECHR','national','DPA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE jurisprudence_relevance AS ENUM ('binding','persuasive','illustrative');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE jurisprudence_ingest_source AS ENUM ('manual','eurlex','hudoc','dpa_feed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS jurisprudence_cases (
  id                VARCHAR(120)                 PRIMARY KEY,
  court             jurisprudence_court          NOT NULL,
  name              VARCHAR(400)                 NOT NULL,
  citation          VARCHAR(200)                 NOT NULL,
  year              INTEGER                      NOT NULL,
  country           VARCHAR(2),
  summary           TEXT                         NOT NULL,
  holding           TEXT                         NOT NULL,
  relevance         jurisprudence_relevance      NOT NULL DEFAULT 'illustrative',
  rights_categories JSONB                        NOT NULL DEFAULT '[]',
  ai_act_articles   JSONB                        NOT NULL DEFAULT '[]',
  sectors           JSONB                        NOT NULL DEFAULT '[]',
  keywords          JSONB                        NOT NULL DEFAULT '[]',
  url               TEXT,
  ingest_source     jurisprudence_ingest_source  NOT NULL DEFAULT 'manual',
  external_id       VARCHAR(200),
  is_active         BOOLEAN                      NOT NULL DEFAULT TRUE,
  search_vector     TSVECTOR,
  created_at        TIMESTAMPTZ                  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ                  NOT NULL DEFAULT NOW(),
  UNIQUE (external_id, ingest_source)
);

CREATE TABLE IF NOT EXISTS jurisprudence_ingest_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source        jurisprudence_ingest_source NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  inserted      INTEGER     NOT NULL DEFAULT 0,
  updated       INTEGER     NOT NULL DEFAULT 0,
  skipped       INTEGER     NOT NULL DEFAULT 0,
  errors        INTEGER     NOT NULL DEFAULT 0,
  error_details JSONB       DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS jc_court_idx      ON jurisprudence_cases (court);
CREATE INDEX IF NOT EXISTS jc_year_idx       ON jurisprudence_cases (year);
CREATE INDEX IF NOT EXISTS jc_country_idx    ON jurisprudence_cases (country);
CREATE INDEX IF NOT EXISTS jc_relevance_idx  ON jurisprudence_cases (relevance);
CREATE INDEX IF NOT EXISTS jc_active_idx     ON jurisprudence_cases (is_active);

CREATE INDEX IF NOT EXISTS jc_fts_idx
  ON jurisprudence_cases USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS jc_rights_idx
  ON jurisprudence_cases USING GIN (rights_categories jsonb_path_ops);

CREATE INDEX IF NOT EXISTS jc_sectors_idx
  ON jurisprudence_cases USING GIN (sectors jsonb_path_ops);

CREATE OR REPLACE FUNCTION jc_search_vector_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.citation, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.holding, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.summary, ''))), 'C') ||
    setweight(to_tsvector('simple', unaccent(
      coalesce(array_to_string(ARRAY(SELECT jsonb_array_elements_text(NEW.keywords)), ' '), '')
    )), 'B');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS jc_search_vector_update ON jurisprudence_cases;
CREATE TRIGGER jc_search_vector_update
  BEFORE INSERT OR UPDATE ON jurisprudence_cases
  FOR EACH ROW EXECUTE FUNCTION jc_search_vector_trigger();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS jc_updated_at ON jurisprudence_cases;
CREATE TRIGGER jc_updated_at
  BEFORE UPDATE ON jurisprudence_cases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
