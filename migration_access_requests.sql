-- ═══════════════════════════════════════════════════════════════
-- Aegis — Contributor access requests
-- Stores requests submitted from the public landing page.
-- Run ONCE in Supabase. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE access_request_status AS ENUM ('pending', 'approved', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS access_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(160) NOT NULL,
  role_title    VARCHAR(200),
  organisation  VARCHAR(200),
  email         VARCHAR(254) NOT NULL,
  message       TEXT,
  status        access_request_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS access_requests_status_idx ON access_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS access_requests_email_idx  ON access_requests (email);
