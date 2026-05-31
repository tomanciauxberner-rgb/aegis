-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — VERIFIED SEED, WAVE 4
-- Public-sector welfare scoring. Real, litigated/investigated systems.
-- Conservative classifications. Run after waves 1-3. Safe to re-run.
-- charter_* rights ids must already exist (seeded in wave 1).
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_providers (id, name, country, provenance) VALUES
  ('a1000000-0000-0000-0000-000000000030', 'CNAF — Caisse Nationale des Allocations Familiales', 'FR', 'verified'),
  ('a1000000-0000-0000-0000-000000000031', 'City of Rotterdam', 'NL', 'verified')
ON CONFLICT DO NOTHING;

INSERT INTO rg_systems (id, name, provider_id, purpose, annex_area, risk_tier, deployment_status, countries, legal_basis, fria_known, affects_children, affects_migrants, provenance) VALUES
  (
    'b1000000-0000-0000-0000-000000000030',
    'CAF benefits fraud scoring algorithm',
    'a1000000-0000-0000-0000-000000000030',
    'Risk-scoring algorithm assigning a suspicion score to recipients of French family welfare benefits (CAF), used monthly on the personal data of millions of beneficiaries to select who is audited. Challenged before the Conseil d''État in October 2024 by 15 civil-society organisations for breaching data-protection rights and the principle of non-discrimination, on grounds it disproportionately targets already-vulnerable beneficiaries.',
    'essential', 'high_risk', 'in_production',
    '["FR"]',
    'AI Act Annex III(5) — access to essential public benefits; contested under GDPR + non-discrimination',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000031',
    'Rotterdam welfare fraud prediction algorithm',
    'a1000000-0000-0000-0000-000000000031',
    'Machine-learning system ranking welfare recipients by estimated fraud risk, trained on extensive personal data. Investigated by Lighthouse Reports/Pulitzer Center, which documented bias against vulnerable groups despite the vendor''s claim of "unbiased citizen outcomes".',
    'essential', 'high_risk', 'withdrawn',
    '["NL"]',
    'AI Act Annex III(5) — access to essential public benefits; contested under GDPR + non-discrimination',
    FALSE, FALSE, FALSE, 'verified'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rg_sources (entity_type, entity_id, title, url, publisher, published_at) VALUES
  ('system', 'b1000000-0000-0000-0000-000000000030', 'French family welfare scoring algorithm challenged in court by 15 organisations', 'https://www.laquadrature.net/en/2024/10/16/french-family-welfare-scoring-algorithm-challenged-in-court-by-15-organisations/', 'La Quadrature du Net', '2024-10-16'),
  ('system', 'b1000000-0000-0000-0000-000000000031', 'How We Did It: Unlocking Europe''s Welfare Fraud Algorithms', 'https://pulitzercenter.org/how-we-did-it-unlocking-europes-welfare-fraud-algorithms', 'Pulitzer Center / Lighthouse Reports', '2023-03-06')
ON CONFLICT DO NOTHING;

INSERT INTO rg_system_rights (system_id, right_id, impact_note, provenance) VALUES
  ('b1000000-0000-0000-0000-000000000030', 'charter_8',  'Monthly processing of millions of beneficiaries'' personal data', 'verified'),
  ('b1000000-0000-0000-0000-000000000030', 'charter_21', 'Alleged discriminatory targeting of vulnerable beneficiaries', 'verified'),
  ('b1000000-0000-0000-0000-000000000031', 'charter_21', 'Documented bias against vulnerable groups', 'verified'),
  ('b1000000-0000-0000-0000-000000000031', 'charter_8',  'Large-scale profiling on welfare recipients', 'verified')
ON CONFLICT DO NOTHING;

SELECT s.annex_area, COUNT(*) AS systems,
       COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited')) AS high_risk
FROM rg_systems s GROUP BY s.annex_area ORDER BY systems DESC;
