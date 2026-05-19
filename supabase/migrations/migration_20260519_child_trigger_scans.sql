-- Migration: 20260519_child_trigger_scans
-- Privacy by design: raw text is NEVER stored, only SHA-256 hash

CREATE TABLE IF NOT EXISTS child_trigger_scans (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_hash         TEXT        NOT NULL,
  signals            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  obligations        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  jurisdiction_filter TEXT       NULL,
  obligations_count  INTEGER     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_child_trigger_scans_user_id    ON child_trigger_scans (user_id);
CREATE INDEX idx_child_trigger_scans_created_at ON child_trigger_scans (created_at DESC);
CREATE INDEX idx_child_trigger_scans_input_hash ON child_trigger_scans (input_hash);

ALTER TABLE child_trigger_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_scans_select"
  ON child_trigger_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_own_scans_insert"
  ON child_trigger_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_scans_delete"
  ON child_trigger_scans FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE child_trigger_scans IS
  'Trigger scan audit log. Raw input text is NEVER persisted — only its SHA-256 hash.';

COMMENT ON COLUMN child_trigger_scans.input_hash IS
  'SHA-256 of the scanned text. Used for deduplication, not for reversal.';

COMMENT ON COLUMN child_trigger_scans.signals IS
  'Array of detected signal objects: { type, matchedTerms, context, confidence }.';

COMMENT ON COLUMN child_trigger_scans.obligations IS
  'Array of regulatory obligation objects sorted by urgency and fine amount.';
