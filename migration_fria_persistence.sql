-- ═══════════════════════════════════════════════════════════════
-- Aegis FRIA persistence — enable draft save/load
-- Run ONCE in Supabase. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- Allow a FRIA draft to exist before a real AI system is registered
-- (e.g. started from the EdTech Risk Atlas bridge).
ALTER TABLE fria_assessments
  ALTER COLUMN ai_system_id DROP NOT NULL;

-- Store the full wizard state for lossless draft round-trip.
-- Normalisation into fria_risks / fria_mitigations happens on finalisation.
ALTER TABLE fria_assessments
  ADD COLUMN IF NOT EXISTS draft_state JSONB;

-- Optional human-readable title and source linkage (e.g. edtech system id)
ALTER TABLE fria_assessments
  ADD COLUMN IF NOT EXISTS title VARCHAR(300);

ALTER TABLE fria_assessments
  ADD COLUMN IF NOT EXISTS source_ref VARCHAR(200);

CREATE INDEX IF NOT EXISTS fria_updated_idx ON fria_assessments (updated_at DESC);
