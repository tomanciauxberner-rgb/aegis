-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — VERIFIED SEED, WAVE 5
-- Municipal AI surveillance (sanctioned) + EU border-agency AI.
-- Conservative classifications. Run after waves 1-4. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_providers (id, name, country, provenance) VALUES
  ('a1000000-0000-0000-0000-000000000040', 'Municipality of Trento', 'IT', 'verified'),
  ('a1000000-0000-0000-0000-000000000041', 'Frontex — European Border and Coast Guard Agency', 'EU', 'verified')
ON CONFLICT DO NOTHING;

INSERT INTO rg_systems (id, name, provider_id, purpose, annex_area, risk_tier, deployment_status, countries, legal_basis, fria_known, affects_children, affects_migrants, provenance) VALUES
  (
    'b1000000-0000-0000-0000-000000000040',
    'Trento AI video & audio surveillance projects',
    'a1000000-0000-0000-0000-000000000040',
    'Municipal AI projects analysing public video and audio to detect events and process citizens'' data in public space. Sanctioned by the Italian DPA (Garante) on 11 January 2024 — among the first fines against a public authority for an AI urban-surveillance deployment.',
    'biometrics', 'high_risk', 'withdrawn',
    '["IT"]',
    'GDPR; Garante decision provvedimento 11 Jan 2024 [9977020]',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000041',
    'Frontex AI border surveillance (risk assessment & aerial)',
    'a1000000-0000-0000-0000-000000000041',
    'AI systems developed and operated by the EU border agency, including automated risk assessment of travellers and drone-based aerial surveillance at the external borders. Documented as engaging rights to data protection, non-discrimination and asylum.',
    'migration', 'high_risk', 'in_production',
    '["EU"]',
    'Regulation (EU) 2019/1896 (EBCG); AI Act Annex III(7) migration',
    FALSE, FALSE, TRUE, 'verified'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rg_sources (entity_type, entity_id, title, url, publisher, published_at) VALUES
  ('system', 'b1000000-0000-0000-0000-000000000040', 'Italy: Trento council fined for illegal AI video and audio surveillance projects', 'https://www.statewatch.org/news/2024/february/italy-trento-council-fined-for-illegal-ai-video-and-audio-surveillance-projects/', 'Statewatch', '2024-02-01'),
  ('system', 'b1000000-0000-0000-0000-000000000041', 'The EU''s Artificial Intelligence Laboratory and Fundamental Rights (Ch. 15)', 'https://www.cambridge.org/core/books/redressing-fundamental-rights-violations-by-the-eu/eus-artificial-intelligence-laboratory-and-fundamental-rights/01263D5C8CEF710B571EE03F920601A9', 'Cambridge University Press', '2024-12-21')
ON CONFLICT DO NOTHING;

INSERT INTO rg_system_rights (system_id, right_id, impact_note, provenance) VALUES
  ('b1000000-0000-0000-0000-000000000040', 'charter_8',  'Processing of citizens'' data in public space; DPA sanction', 'verified'),
  ('b1000000-0000-0000-0000-000000000040', 'charter_7',  'Public video/audio surveillance affects private life', 'verified'),
  ('b1000000-0000-0000-0000-000000000041', 'charter_8',  'Automated processing of travellers'' personal data', 'verified'),
  ('b1000000-0000-0000-0000-000000000041', 'charter_18', 'Affects the right to asylum at the border', 'verified'),
  ('b1000000-0000-0000-0000-000000000041', 'charter_21', 'Risk of discriminatory profiling at borders', 'verified')
ON CONFLICT DO NOTHING;

SELECT s.annex_area, COUNT(*) AS systems,
       COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited')) AS high_risk
FROM rg_systems s GROUP BY s.annex_area ORDER BY systems DESC;
