-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — VERIFIED SEED, WAVE 6
-- Berlin Suedkreuz FRT pilot: a named, heavily documented deployment,
-- incl. a European Parliament primary source. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_providers (id, name, country, provenance) VALUES
  ('a1000000-0000-0000-0000-000000000050', 'Bundespolizei / Deutsche Bahn (Suedkreuz consortium)', 'DE', 'verified')
ON CONFLICT DO NOTHING;

INSERT INTO rg_systems (id, name, provider_id, purpose, annex_area, risk_tier, deployment_status, countries, legal_basis, fria_known, affects_children, affects_migrants, provenance) VALUES
  (
    'b1000000-0000-0000-0000-000000000050',
    'Berlin Suedkreuz facial-recognition pilot (Sicherheitsbahnhof)',
    'a1000000-0000-0000-0000-000000000050',
    'Live facial-recognition trial at Berlin Suedkreuz station (Aug 2017 - Jul 2018; a 2019 second phase tested behaviour detection), run by the Federal Police with Deutsche Bahn, the Interior Ministry and the BKA, testing systems including Herta Security BioSurveillance and IDEMIA Morpho Video Investigator on consenting volunteers. Authorities rated it successful; critics documented false-match concerns, and a European Parliament question challenged its fundamental-rights basis. Real-time FRT modelled on the pilot has not been rolled out in Germany.',
    'biometrics', 'high_risk', 'withdrawn',
    '["DE"]',
    'Pilot on consent basis, pre-AI Act; permanent use would engage AI Act Art. 5 RBI restrictions. EP question E-005282/2017.',
    FALSE, FALSE, FALSE, 'verified'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rg_sources (entity_type, entity_id, title, url, publisher, published_at) VALUES
  ('system', 'b1000000-0000-0000-0000-000000000050', 'Parliamentary question E-005282/2017 - Facial recognition project in Berlin Suedkreuz station', 'https://www.europarl.europa.eu/doceo/document/E-8-2017-005282_EN.html', 'European Parliament', '2017-08-01'),
  ('system', 'b1000000-0000-0000-0000-000000000050', 'Facial Recognition Technologies in the Public Sector (Ch. 13)', 'https://www.cambridge.org/core/books/cambridge-handbook-of-facial-recognition-in-the-modern-state/facial-recognition-technologies-in-the-public-sector/F62BC3D7147EBED04239D020AF245412', 'Cambridge University Press', '2024-01-01')
ON CONFLICT DO NOTHING;

INSERT INTO rg_system_rights (system_id, right_id, impact_note, provenance) VALUES
  ('b1000000-0000-0000-0000-000000000050', 'charter_8', 'Automated processing of biometric data in a public space', 'verified'),
  ('b1000000-0000-0000-0000-000000000050', 'charter_7', 'Continuous surveillance of a public transit hub engages private life', 'verified')
ON CONFLICT DO NOTHING;

SELECT COUNT(*) AS systems FROM rg_systems;
