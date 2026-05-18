-- ═══════════════════════════════════════════════════════════════
-- Aegis Children v2 — Live intelligence schema
-- Run ONCE against Supabase. Safe to re-run (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$ BEGIN
  CREATE TYPE children_severity AS ENUM ('critical','high','medium','low','informational');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE dpa_decision_outcome AS ENUM (
    'fine','warning','injunction','dismissed','ongoing','settled','guidance'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE app_store_platform AS ENUM ('ios','android');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE edtech_risk_tier AS ENUM ('annex3','prohibited','limited','minimal','unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS children_gdpr_age (
  country_code   VARCHAR(2)  PRIMARY KEY,
  age_consent    INTEGER     NOT NULL,
  legal_source   TEXT        NOT NULL,
  source_url     TEXT        NOT NULL,
  last_verified  DATE        NOT NULL,
  notes          TEXT,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS children_dpa_registry (
  id                  VARCHAR(40)  PRIMARY KEY,
  country_code        VARCHAR(2)   NOT NULL,
  name_local          VARCHAR(200) NOT NULL,
  name_en             VARCHAR(200) NOT NULL,
  acronym             VARCHAR(20),
  language_code       VARCHAR(5)   NOT NULL,
  decisions_url       TEXT         NOT NULL,
  rss_url             TEXT,
  ingest_strategy     VARCHAR(20)  NOT NULL DEFAULT 'manual',
  ingest_selector     JSONB        NOT NULL DEFAULT '{}',
  last_ingested_at    TIMESTAMPTZ,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (ingest_strategy IN ('rss','html','pdf','sparql','manual'))
);

CREATE INDEX IF NOT EXISTS dpa_country_idx ON children_dpa_registry (country_code);
CREATE INDEX IF NOT EXISTS dpa_active_idx  ON children_dpa_registry (is_active);

CREATE TABLE IF NOT EXISTS children_dpa_decisions (
  id                  VARCHAR(120) PRIMARY KEY,
  dpa_id              VARCHAR(40)  NOT NULL REFERENCES children_dpa_registry(id),
  country_code        VARCHAR(2)   NOT NULL,
  decision_date       DATE         NOT NULL,
  published_date      DATE,
  title_original      TEXT         NOT NULL,
  title_en            TEXT         NOT NULL,
  summary_en          TEXT         NOT NULL,
  outcome             dpa_decision_outcome NOT NULL DEFAULT 'ongoing',
  fine_amount_eur     BIGINT,
  respondent_name     VARCHAR(400),
  respondent_sector   VARCHAR(100),
  legal_bases         JSONB        NOT NULL DEFAULT '[]',
  age_range_affected  VARCHAR(40),
  severity            children_severity NOT NULL DEFAULT 'medium',
  source_url          TEXT         NOT NULL,
  language_original   VARCHAR(5)   NOT NULL,
  ingest_source       VARCHAR(20)  NOT NULL DEFAULT 'auto',
  external_id         VARCHAR(200),
  is_verified         BOOLEAN      NOT NULL DEFAULT FALSE,
  search_vector       TSVECTOR,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (dpa_id, external_id)
);

CREATE INDEX IF NOT EXISTS dpa_dec_country_idx  ON children_dpa_decisions (country_code);
CREATE INDEX IF NOT EXISTS dpa_dec_date_idx     ON children_dpa_decisions (decision_date DESC);
CREATE INDEX IF NOT EXISTS dpa_dec_severity_idx ON children_dpa_decisions (severity);
CREATE INDEX IF NOT EXISTS dpa_dec_outcome_idx  ON children_dpa_decisions (outcome);
CREATE INDEX IF NOT EXISTS dpa_dec_bases_idx
  ON children_dpa_decisions USING GIN (legal_bases jsonb_path_ops);
CREATE INDEX IF NOT EXISTS dpa_dec_fts_idx
  ON children_dpa_decisions USING GIN (search_vector);

CREATE OR REPLACE FUNCTION dpa_dec_fts_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.title_en, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.respondent_name, ''))), 'A') ||
    setweight(to_tsvector('simple', unaccent(coalesce(NEW.summary_en, ''))), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS dpa_dec_fts_update ON children_dpa_decisions;
CREATE TRIGGER dpa_dec_fts_update
  BEFORE INSERT OR UPDATE ON children_dpa_decisions
  FOR EACH ROW EXECUTE FUNCTION dpa_dec_fts_trigger();

CREATE TABLE IF NOT EXISTS children_apps (
  id                    VARCHAR(120) PRIMARY KEY,
  bundle_id             VARCHAR(200) NOT NULL,
  name                  VARCHAR(300) NOT NULL,
  publisher             VARCHAR(300),
  platforms             JSONB        NOT NULL DEFAULT '[]',
  declared_min_age      INTEGER,
  is_vlop               BOOLEAN      NOT NULL DEFAULT FALSE,
  vlop_designation_date DATE,
  dsa_transparency_url  TEXT,
  category              VARCHAR(80),
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (bundle_id)
);

CREATE INDEX IF NOT EXISTS apps_vlop_idx ON children_apps (is_vlop);

CREATE TABLE IF NOT EXISTS children_app_rankings (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id          VARCHAR(120) NOT NULL REFERENCES children_apps(id),
  country_code    VARCHAR(2)   NOT NULL,
  platform        app_store_platform NOT NULL,
  chart_category  VARCHAR(80)  NOT NULL,
  rank            INTEGER      NOT NULL,
  observed_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (app_id, country_code, platform, chart_category, observed_at)
);

CREATE INDEX IF NOT EXISTS app_rank_country_idx ON children_app_rankings (country_code, observed_at DESC);
CREATE INDEX IF NOT EXISTS app_rank_app_idx     ON children_app_rankings (app_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS children_dsa_reports (
  id                 VARCHAR(120) PRIMARY KEY,
  app_id             VARCHAR(120) NOT NULL REFERENCES children_apps(id),
  period_start       DATE         NOT NULL,
  period_end         DATE         NOT NULL,
  report_url         TEXT         NOT NULL,
  pdf_hash           VARCHAR(64),
  metrics            JSONB        NOT NULL DEFAULT '{}',
  minors_specific    JSONB        NOT NULL DEFAULT '{}',
  ingested_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (app_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS dsa_rep_period_idx ON children_dsa_reports (period_end DESC);

CREATE TABLE IF NOT EXISTS children_edtech_systems (
  id                    VARCHAR(120) PRIMARY KEY,
  country_code          VARCHAR(2)   NOT NULL,
  system_name           VARCHAR(300) NOT NULL,
  vendor                VARCHAR(300),
  deployment_scope      VARCHAR(50)  NOT NULL,
  students_affected     INTEGER,
  ai_features           JSONB        NOT NULL DEFAULT '[]',
  annex3_categories     JSONB        NOT NULL DEFAULT '[]',
  risk_tier             edtech_risk_tier NOT NULL DEFAULT 'unknown',
  legal_status          VARCHAR(50),
  source_url            TEXT,
  description           TEXT         NOT NULL,
  last_verified         DATE         NOT NULL,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (deployment_scope IN ('national','regional','pilot','withdrawn'))
);

CREATE INDEX IF NOT EXISTS edtech_country_idx  ON children_edtech_systems (country_code);
CREATE INDEX IF NOT EXISTS edtech_risk_idx     ON children_edtech_systems (risk_tier);

CREATE TABLE IF NOT EXISTS children_ingest_log (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline      VARCHAR(40)  NOT NULL,
  started_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  inserted      INTEGER      NOT NULL DEFAULT 0,
  updated       INTEGER      NOT NULL DEFAULT 0,
  skipped       INTEGER      NOT NULL DEFAULT 0,
  errors        INTEGER      NOT NULL DEFAULT 0,
  error_details JSONB        DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS children_log_pipeline_idx ON children_ingest_log (pipeline, started_at DESC);

INSERT INTO children_gdpr_age (country_code, age_consent, legal_source, source_url, last_verified) VALUES
  ('AT', 14, 'Datenschutzgesetz §4 Abs. 4', 'https://www.ris.bka.gv.at/', '2025-01-15'),
  ('BE', 13, 'Loi du 30 juillet 2018, art. 7', 'https://www.autoriteprotectiondonnees.be/', '2025-01-15'),
  ('BG', 14, 'Personal Data Protection Act, art. 25h', 'https://www.cpdp.bg/', '2025-01-15'),
  ('HR', 16, 'Act on the Implementation of GDPR, art. 19', 'https://azop.hr/', '2025-01-15'),
  ('CY', 14, 'Law 125(I)/2018, art. 7', 'https://www.dataprotection.gov.cy/', '2025-01-15'),
  ('CZ', 15, 'Act 110/2019, §7', 'https://www.uoou.cz/', '2025-01-15'),
  ('DK', 13, 'Data Protection Act §6(3)', 'https://www.datatilsynet.dk/', '2025-01-15'),
  ('EE', 13, 'Personal Data Protection Act §8', 'https://www.aki.ee/', '2025-01-15'),
  ('FI', 13, 'Data Protection Act §5', 'https://tietosuoja.fi/', '2025-01-15'),
  ('FR', 15, 'Loi Informatique et Libertés art. 45', 'https://www.cnil.fr/', '2025-01-15'),
  ('DE', 16, 'BDSG §22 (GDPR default)', 'https://www.bfdi.bund.de/', '2025-01-15'),
  ('GR', 15, 'Law 4624/2019, art. 21', 'https://www.dpa.gr/', '2025-01-15'),
  ('HU', 16, 'Act CXII of 2011 (GDPR default)', 'https://naih.hu/', '2025-01-15'),
  ('IE', 16, 'Data Protection Act 2018 §31', 'https://www.dataprotection.ie/', '2025-01-15'),
  ('IT', 14, 'Decreto Legislativo 101/2018 art. 2-quinquies', 'https://www.garanteprivacy.it/', '2025-01-15'),
  ('LV', 13, 'Personal Data Processing Law §7', 'https://www.dvi.gov.lv/', '2025-01-15'),
  ('LT', 14, 'Law on Legal Protection of Personal Data art. 9', 'https://vdai.lrv.lt/', '2025-01-15'),
  ('LU', 16, 'Loi du 1er août 2018 art. 12 (GDPR default)', 'https://cnpd.public.lu/', '2025-01-15'),
  ('MT', 13, 'Data Protection Act Cap. 586 art. 4', 'https://idpc.org.mt/', '2025-01-15'),
  ('NL', 16, 'Uitvoeringswet AVG art. 5 (GDPR default)', 'https://autoriteitpersoonsgegevens.nl/', '2025-01-15'),
  ('PL', 16, 'Personal Data Protection Act art. 4 (GDPR default)', 'https://uodo.gov.pl/', '2025-01-15'),
  ('PT', 13, 'Lei 58/2019 art. 16', 'https://www.cnpd.pt/', '2025-01-15'),
  ('RO', 16, 'Law 190/2018 art. 7 (GDPR default)', 'https://www.dataprotection.ro/', '2025-01-15'),
  ('SK', 16, 'Act 18/2018 §15 (GDPR default)', 'https://dataprotection.gov.sk/', '2025-01-15'),
  ('SI', 15, 'Personal Data Protection Act ZVOP-2 art. 11', 'https://www.ip-rs.si/', '2025-01-15'),
  ('ES', 14, 'Ley Orgánica 3/2018 art. 7', 'https://www.aepd.es/', '2025-01-15'),
  ('SE', 13, 'Data Protection Act 2018:218 ch. 2 §3', 'https://www.imy.se/', '2025-01-15')
ON CONFLICT (country_code) DO UPDATE SET
  age_consent   = EXCLUDED.age_consent,
  legal_source  = EXCLUDED.legal_source,
  source_url    = EXCLUDED.source_url,
  last_verified = EXCLUDED.last_verified,
  updated_at    = NOW();

INSERT INTO children_dpa_registry (id, country_code, name_local, name_en, acronym, language_code, decisions_url, rss_url, ingest_strategy) VALUES
  ('dpa-at', 'AT', 'Datenschutzbehörde', 'Data Protection Authority', 'DSB', 'de', 'https://www.dsb.gv.at/', NULL, 'html'),
  ('dpa-be', 'BE', 'Autorité de protection des données', 'Data Protection Authority', 'APD/GBA', 'fr', 'https://www.autoriteprotectiondonnees.be/publications/decisions', NULL, 'html'),
  ('dpa-bg', 'BG', 'Комисия за защита на личните данни', 'Commission for Personal Data Protection', 'CPDP', 'bg', 'https://www.cpdp.bg/', NULL, 'html'),
  ('dpa-hr', 'HR', 'Agencija za zaštitu osobnih podataka', 'Personal Data Protection Agency', 'AZOP', 'hr', 'https://azop.hr/odluke/', NULL, 'html'),
  ('dpa-cy', 'CY', 'Επίτροπος Προστασίας Δεδομένων', 'Commissioner for Personal Data Protection', NULL, 'el', 'https://www.dataprotection.gov.cy/', NULL, 'html'),
  ('dpa-cz', 'CZ', 'Úřad pro ochranu osobních údajů', 'Office for Personal Data Protection', 'ÚOOÚ', 'cs', 'https://www.uoou.cz/rozhodovaci-praxe', NULL, 'html'),
  ('dpa-dk', 'DK', 'Datatilsynet', 'Data Protection Agency', NULL, 'da', 'https://www.datatilsynet.dk/afgoerelser', NULL, 'html'),
  ('dpa-ee', 'EE', 'Andmekaitse Inspektsioon', 'Data Protection Inspectorate', 'AKI', 'et', 'https://www.aki.ee/et/uudised', NULL, 'html'),
  ('dpa-fi', 'FI', 'Tietosuojavaltuutetun toimisto', 'Office of the Data Protection Ombudsman', NULL, 'fi', 'https://tietosuoja.fi/ratkaisut', NULL, 'html'),
  ('dpa-fr', 'FR', 'Commission Nationale de l''Informatique et des Libertés', 'CNIL', 'CNIL', 'fr', 'https://www.cnil.fr/fr/decisions', 'https://www.cnil.fr/fr/flux-rss', 'rss'),
  ('dpa-de', 'DE', 'Bundesbeauftragte für den Datenschutz', 'Federal Commissioner for Data Protection', 'BfDI', 'de', 'https://www.bfdi.bund.de/', NULL, 'html'),
  ('dpa-gr', 'GR', 'Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα', 'Hellenic Data Protection Authority', 'HDPA', 'el', 'https://www.dpa.gr/el/enimerwtiko/aposeisDPA', NULL, 'html'),
  ('dpa-hu', 'HU', 'Nemzeti Adatvédelmi és Információszabadság Hatóság', 'National Authority for Data Protection', 'NAIH', 'hu', 'https://naih.hu/dontesek-allasfoglalasok', NULL, 'html'),
  ('dpa-ie', 'IE', 'Data Protection Commission', 'Data Protection Commission', 'DPC', 'en', 'https://www.dataprotection.ie/en/news-media/decisions', NULL, 'html'),
  ('dpa-it', 'IT', 'Garante per la protezione dei dati personali', 'Italian Data Protection Authority', 'Garante', 'it', 'https://www.garanteprivacy.it/web/guest/home/provvedimenti-normativa/provvedimenti', 'https://www.garanteprivacy.it/feed', 'rss'),
  ('dpa-lv', 'LV', 'Datu valsts inspekcija', 'Data State Inspectorate', 'DVI', 'lv', 'https://www.dvi.gov.lv/lv/lemumi', NULL, 'html'),
  ('dpa-lt', 'LT', 'Valstybinė duomenų apsaugos inspekcija', 'State Data Protection Inspectorate', 'VDAI', 'lt', 'https://vdai.lrv.lt/lt/naujienos', NULL, 'html'),
  ('dpa-lu', 'LU', 'Commission nationale pour la protection des données', 'National Data Protection Commission', 'CNPD', 'fr', 'https://cnpd.public.lu/fr/decisions-sanctions.html', NULL, 'html'),
  ('dpa-mt', 'MT', 'Information and Data Protection Commissioner', 'Information and Data Protection Commissioner', 'IDPC', 'en', 'https://idpc.org.mt/', NULL, 'html'),
  ('dpa-nl', 'NL', 'Autoriteit Persoonsgegevens', 'Dutch Data Protection Authority', 'AP', 'nl', 'https://autoriteitpersoonsgegevens.nl/onderwerpen', NULL, 'html'),
  ('dpa-pl', 'PL', 'Urząd Ochrony Danych Osobowych', 'Personal Data Protection Office', 'UODO', 'pl', 'https://uodo.gov.pl/pl/138', NULL, 'html'),
  ('dpa-pt', 'PT', 'Comissão Nacional de Proteção de Dados', 'National Data Protection Commission', 'CNPD', 'pt', 'https://www.cnpd.pt/decisoes/', NULL, 'html'),
  ('dpa-ro', 'RO', 'Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal', 'Romanian DPA', 'ANSPDCP', 'ro', 'https://www.dataprotection.ro/?page=Decizii_ale_presedintelui', NULL, 'html'),
  ('dpa-sk', 'SK', 'Úrad na ochranu osobných údajov', 'Office for Personal Data Protection', NULL, 'sk', 'https://dataprotection.gov.sk/uoou/sk/content/rozhodnutia', NULL, 'html'),
  ('dpa-si', 'SI', 'Informacijski pooblaščenec', 'Information Commissioner', 'IP', 'sl', 'https://www.ip-rs.si/mnenja-gdpr', NULL, 'html'),
  ('dpa-es', 'ES', 'Agencia Española de Protección de Datos', 'Spanish DPA', 'AEPD', 'es', 'https://www.aepd.es/informes-y-resoluciones', 'https://www.aepd.es/rss-feeds.xml', 'rss'),
  ('dpa-se', 'SE', 'Integritetsskyddsmyndigheten', 'Swedish Authority for Privacy Protection', 'IMY', 'sv', 'https://www.imy.se/beslut/', NULL, 'html')
ON CONFLICT (id) DO UPDATE SET
  name_local      = EXCLUDED.name_local,
  name_en         = EXCLUDED.name_en,
  decisions_url   = EXCLUDED.decisions_url,
  rss_url         = EXCLUDED.rss_url,
  ingest_strategy = EXCLUDED.ingest_strategy;
