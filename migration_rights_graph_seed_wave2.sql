-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — VERIFIED SEED, WAVE 2
-- Extends the graph across employment, education and biometrics.
-- Conservative classifications. Each system carries a primary source.
-- Run after migration_rights_graph.sql + wave-1 seed. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_providers (id, name, country, provenance) VALUES
  ('a1000000-0000-0000-0000-000000000010', 'HireVue', 'US', 'verified'),
  ('a1000000-0000-0000-0000-000000000011', 'Workday', 'US', 'verified'),
  ('a1000000-0000-0000-0000-000000000012', 'Clearview AI', 'US', 'verified'),
  ('a1000000-0000-0000-0000-000000000013', 'Skellefteå municipality (Anderstorp school)', 'SE', 'verified')
ON CONFLICT DO NOTHING;

INSERT INTO rg_systems (id, name, provider_id, purpose, annex_area, risk_tier, deployment_status, countries, legal_basis, fria_known, affects_children, affects_migrants, provenance) VALUES
  (
    'b1000000-0000-0000-0000-000000000010',
    'HireVue AI video interview & assessment',
    'a1000000-0000-0000-0000-000000000010',
    'AI-driven assessment of recorded candidate video interviews, widely used by large employers for early-stage hiring. Originally analysed facial movements and tone; facial-analysis features dropped in 2021 after bias concerns raised by EPIC and an algorithmic audit. Remains in use for content/voice-based scoring.',
    'employment', 'high_risk', 'in_production',
    '["EU"]',
    'AI Act Annex III(4) — employment; classified high-risk for hiring use',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000011',
    'Workday AI applicant screening',
    'a1000000-0000-0000-0000-000000000011',
    'AI-enabled system that screens and ranks job applicants, used by employers across the EU as part of HR workflows. Subject of US litigation (Mobley v. Workday) testing whether an AI vendor can be liable as an employment agent; cited as illustrative of Annex III(4) high-risk hiring tools.',
    'employment', 'high_risk', 'in_production',
    '["EU"]',
    'AI Act Annex III(4) — employment; profiling of candidates likely forecloses Art. 6(3) exception',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000012',
    'Clearview AI facial recognition database',
    'a1000000-0000-0000-0000-000000000012',
    'Facial recognition service built on untargeted scraping of billions of facial images from the internet. Repeatedly found unlawful by EU DPAs; the Dutch DPA fined it €30.5M in 2024. Untargeted scraping to build facial-recognition databases is prohibited under AI Act Article 5.',
    'biometrics', 'prohibited', 'withdrawn',
    '["NL","IT","FR","GR"]',
    'GDPR Art. 9; AI Act Art. 5 (prohibited — untargeted scraping). Dutch DPA decision Sept 2024.',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000013',
    'Facial recognition for school attendance (Skellefteå)',
    'a1000000-0000-0000-0000-000000000013',
    'Pilot using facial recognition to register secondary-school student attendance. Found unlawful by the Swedish DPA (IMY), fined ~€20,000; decision upheld by the Stockholm Court of Appeal. Processing of children''s biometric data on a consent basis held invalid given the power imbalance.',
    'education', 'high_risk', 'withdrawn',
    '["SE"]',
    'GDPR Art. 9 (biometric data of children); IMY decision, upheld Case No. 5888-20',
    FALSE, TRUE, FALSE, 'verified'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rg_sources (entity_type, entity_id, title, url, publisher, published_at) VALUES
  ('system', 'b1000000-0000-0000-0000-000000000010', 'HireVue Drops Facial Analysis from Hiring Software', 'https://techcrunch.com/2021/01/12/hirevue-drops-facial-monitoring-amid-a-i-algorithm-audit/', 'TechCrunch', '2021-01-13'),
  ('system', 'b1000000-0000-0000-0000-000000000011', 'Europe Is Regulating AI Hiring — Mobley v. Workday', 'https://onlabor.org/europe-is-regulating-ai-hiring-why-isnt-america/', 'OnLabor', '2025-11-11'),
  ('system', 'b1000000-0000-0000-0000-000000000012', 'Red Lines under the EU AI Act: untargeted scraping of facial images', 'https://fpf.org/blog/red-lines-under-the-eu-ai-act-understanding-the-ban-of-the-untargeted-scraping-of-facial-images-and-facial-recognition-databases/', 'Future of Privacy Forum', '2026-03-17'),
  ('system', 'b1000000-0000-0000-0000-000000000013', 'KamR Stockholm — Case No. 5888-20 (facial recognition in school)', 'https://gdprhub.eu/index.php?title=KamR_Stockholm_-_Case_No._5888-20', 'GDPRhub', '2021-10-07')
ON CONFLICT DO NOTHING;

INSERT INTO rg_system_rights (system_id, right_id, impact_note, provenance) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'charter_21', 'Documented bias risk across ethnicity / disability in video scoring', 'verified'),
  ('b1000000-0000-0000-0000-000000000010', 'charter_8',  'Processing of candidate audio/video personal data', 'verified'),
  ('b1000000-0000-0000-0000-000000000011', 'charter_21', 'Alleged disparate impact on age, race, disability (Mobley)', 'verified'),
  ('b1000000-0000-0000-0000-000000000011', 'charter_47', 'Automated screening affecting access to employment', 'verified'),
  ('b1000000-0000-0000-0000-000000000012', 'charter_8',  'Mass biometric data processing without lawful basis', 'verified'),
  ('b1000000-0000-0000-0000-000000000012', 'charter_7',  'Untargeted scraping infringes private life', 'verified'),
  ('b1000000-0000-0000-0000-000000000013', 'charter_24', 'Biometric processing of children', 'verified'),
  ('b1000000-0000-0000-0000-000000000013', 'charter_8',  'Special-category data; consent held invalid', 'verified')
ON CONFLICT DO NOTHING;

SELECT s.annex_area, COUNT(*) AS systems,
       COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited')) AS high_risk
FROM rg_systems s GROUP BY s.annex_area ORDER BY systems DESC;
