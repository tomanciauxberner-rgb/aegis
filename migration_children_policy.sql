-- ═══════════════════════════════════════════════════════════════
-- Aegis Children v2 — Forward Intelligence schema
-- Tracks upstream signals: research projects, opinions, consultations,
-- bills, parliamentary questions, position papers.
-- Run ONCE in Supabase. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE policy_signal_type AS ENUM (
    'research_project',
    'opinion_or_guidance',
    'consultation_open',
    'consultation_closed',
    'bill_introduced',
    'bill_adopted',
    'parliamentary_question',
    'position_paper',
    'work_programme',
    'stakeholder_event'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE policy_signal_status AS ENUM (
    'upcoming','open','in_progress','closed','adopted','withdrawn'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS children_policy_sources (
  id                VARCHAR(50)  PRIMARY KEY,
  name              VARCHAR(200) NOT NULL,
  acronym           VARCHAR(20),
  source_url        TEXT         NOT NULL,
  rss_url           TEXT,
  scope             VARCHAR(20)  NOT NULL DEFAULT 'eu',
  country_code      VARCHAR(2),
  language_code     VARCHAR(5)   NOT NULL DEFAULT 'en',
  ingest_strategy   VARCHAR(20)  NOT NULL DEFAULT 'manual',
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  last_ingested_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (scope IN ('eu','national','international')),
  CHECK (ingest_strategy IN ('rss','html','json_api','manual'))
);

CREATE INDEX IF NOT EXISTS policy_sources_active_idx ON children_policy_sources (is_active);
CREATE INDEX IF NOT EXISTS policy_sources_scope_idx  ON children_policy_sources (scope);

CREATE TABLE IF NOT EXISTS children_policy_signals (
  id                  VARCHAR(160) PRIMARY KEY,
  source_id           VARCHAR(50)  NOT NULL REFERENCES children_policy_sources(id),
  signal_type         policy_signal_type NOT NULL,
  status              policy_signal_status NOT NULL DEFAULT 'in_progress',
  title_original      TEXT         NOT NULL,
  title_en            TEXT         NOT NULL,
  summary_en          TEXT         NOT NULL,
  signal_date         DATE         NOT NULL,
  deadline_date       DATE,
  jurisdiction        VARCHAR(50)  NOT NULL DEFAULT 'eu',
  country_codes       JSONB        NOT NULL DEFAULT '[]',
  themes              JSONB        NOT NULL DEFAULT '[]',
  legal_frameworks    JSONB        NOT NULL DEFAULT '[]',
  relevance_score     INTEGER      NOT NULL DEFAULT 50,
  why_it_matters      TEXT,
  stakeholders        JSONB        NOT NULL DEFAULT '[]',
  source_url          TEXT         NOT NULL,
  language_original   VARCHAR(5)   NOT NULL,
  external_id         VARCHAR(200),
  is_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
  search_vector       TSVECTOR,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, external_id),
  CHECK (relevance_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS policy_sig_date_idx       ON children_policy_signals (signal_date DESC);
CREATE INDEX IF NOT EXISTS policy_sig_deadline_idx   ON children_policy_signals (deadline_date) WHERE deadline_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS policy_sig_type_idx       ON children_policy_signals (signal_type);
CREATE INDEX IF NOT EXISTS policy_sig_status_idx     ON children_policy_signals (status);
CREATE INDEX IF NOT EXISTS policy_sig_relevance_idx  ON children_policy_signals (relevance_score DESC);
CREATE INDEX IF NOT EXISTS policy_sig_themes_idx     ON children_policy_signals USING GIN (themes jsonb_path_ops);
CREATE INDEX IF NOT EXISTS policy_sig_countries_idx  ON children_policy_signals USING GIN (country_codes jsonb_path_ops);
CREATE INDEX IF NOT EXISTS policy_sig_fts_idx        ON children_policy_signals USING GIN (search_vector);

CREATE OR REPLACE FUNCTION policy_sig_fts_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.title_en, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.summary_en, ''))), 'B') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.why_it_matters, ''))), 'C');
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS policy_sig_fts_update ON children_policy_signals;
CREATE TRIGGER policy_sig_fts_update
  BEFORE INSERT OR UPDATE ON children_policy_signals
  FOR EACH ROW EXECUTE FUNCTION policy_sig_fts_trigger();

-- ═══════════════════════════════════════════════════════════════
-- Seed: verified EU policy sources with confirmed RSS endpoints
-- ═══════════════════════════════════════════════════════════════

INSERT INTO children_policy_sources (id, name, acronym, source_url, rss_url, scope, language_code, ingest_strategy) VALUES
  ('src-fra',  'EU Agency for Fundamental Rights',           'FRA',    'https://fra.europa.eu/en',                 'https://fra.europa.eu/en/news-feed',     'eu', 'en', 'rss'),
  ('src-edpb', 'European Data Protection Board',              'EDPB',   'https://www.edpb.europa.eu/edpb_en',       'https://www.edpb.europa.eu/feed/news_en','eu', 'en', 'rss'),
  ('src-edps', 'European Data Protection Supervisor',         'EDPS',   'https://www.edps.europa.eu/',              NULL,                                     'eu', 'en', 'manual'),
  ('src-bik',  'Better Internet for Kids',                    'BIK',    'https://www.betterinternetforkids.eu/',    NULL,                                     'eu', 'en', 'manual'),
  ('src-fra-research', 'FRA Research Projects',               NULL,     'https://fra.europa.eu/en/research-projects', NULL,                                   'eu', 'en', 'manual'),
  ('src-hys',  'EU Have Your Say (public consultations)',     NULL,     'https://have-your-say.ec.europa.eu/',      NULL,                                     'eu', 'en', 'manual'),
  ('src-edpb-work', 'EDPB Work Programme & Plenaries',        NULL,     'https://www.edpb.europa.eu/news/news_en',  NULL,                                     'eu', 'en', 'manual')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  source_url = EXCLUDED.source_url,
  rss_url = EXCLUDED.rss_url,
  ingest_strategy = EXCLUDED.ingest_strategy;
