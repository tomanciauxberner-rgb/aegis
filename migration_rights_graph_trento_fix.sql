-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — CORRECTION PATCH (audit pass)
-- Sharpen the Trento entry (id ...040) with verified detail:
-- €50,000 fine, projects MARVEL & PROTECTOR, partner FBK.
-- Cross-checked: Statewatch, Reuters, Garante provv. 11 Jan 2024 [9977020].
-- Touches ONLY the Trento row. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

UPDATE rg_systems
SET
  name = 'Trento AI urban surveillance (MARVEL & PROTECTOR)',
  purpose = 'Two EU-funded municipal research projects — MARVEL and PROTECTOR — using AI to analyse public video, audio and social-media data to detect security threats in urban space (including around places of worship), run with Fondazione Bruno Kessler. The Italian DPA (Garante) fined Trento EUR 50,000 on 11 January 2024 (provvedimento [9977020]) — the first Italian local authority sanctioned over AI data use — and ordered the collected data deleted.',
  legal_basis = 'GDPR; Garante decision provvedimento 11 Jan 2024 [9977020], EUR 50,000 fine'
WHERE id = 'b1000000-0000-0000-0000-000000000040';

SELECT id, name, legal_basis FROM rg_systems
WHERE id = 'b1000000-0000-0000-0000-000000000040';
