-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — VERIFIED SEED, WAVE 3
-- Law enforcement / justice (Annex III(6),(8)) and credit (III(5)).
-- Conservative classifications. Each system carries a primary source.
-- Run after waves 1 & 2. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_providers (id, name, country, provenance) VALUES
  ('a1000000-0000-0000-0000-000000000020', 'Dutch National Police', 'NL', 'verified'),
  ('a1000000-0000-0000-0000-000000000021', 'Polizia di Stato (Italy)', 'IT', 'verified'),
  ('a1000000-0000-0000-0000-000000000022', 'Land NRW police (Germany)', 'DE', 'verified'),
  ('a1000000-0000-0000-0000-000000000023', 'Ministry of the Interior (Spain)', 'ES', 'verified'),
  ('a1000000-0000-0000-0000-000000000024', 'SCHUFA Holding AG', 'DE', 'verified')
ON CONFLICT DO NOTHING;

INSERT INTO rg_systems (id, name, provider_id, purpose, annex_area, risk_tier, deployment_status, countries, legal_basis, fria_known, affects_children, affects_migrants, provenance) VALUES
  (
    'b1000000-0000-0000-0000-000000000020',
    'CAS (Crime Anticipation System)',
    'a1000000-0000-0000-0000-000000000020',
    'Geographic crime-prediction system used by Dutch police to forecast where crimes may occur. Piloted from 2015, rolled out nationwide 2017. The Netherlands Court of Audit (2022) found it failed basic standards and that reliance on historical neighbourhood data likely produced systematic bias. Discontinued mid-December 2025.',
    'law_enforcement', 'high_risk', 'withdrawn',
    '["NL"]',
    'AI Act Annex III(6); location-based prediction. Court of Audit findings 2022.',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000021',
    'Delia crime analysis & prediction',
    'a1000000-0000-0000-0000-000000000021',
    'Crime analysis and prediction system used by police in Italy, documented by Fair Trials as producing discriminatory profiling outcomes. Profiling-based crime prediction of individuals is prohibited under AI Act Article 5; location/analysis uses fall under high-risk Annex III(6).',
    'law_enforcement', 'high_risk', 'in_production',
    '["IT"]',
    'AI Act Annex III(6) / Art. 5 boundary depending on profiling use',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000022',
    'SKALA geographic crime prediction',
    'a1000000-0000-0000-0000-000000000022',
    'Geographic crime-prediction tool used by German (North Rhine-Westphalia) authorities to anticipate where crimes are likely to occur, documented by Fair Trials among European predictive-policing systems.',
    'law_enforcement', 'high_risk', 'in_production',
    '["DE"]',
    'AI Act Annex III(6) — location-based prediction',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000023',
    'VioGén (gender-violence risk assessment)',
    'a1000000-0000-0000-0000-000000000023',
    'Algorithmic risk-assessment system used by Spanish authorities to score the risk faced by victims of gender-based violence and allocate protection. Co-developed by law enforcement and academics; widely studied for the consequences of risk misclassification on victims'' safety.',
    'law_enforcement', 'high_risk', 'in_production',
    '["ES"]',
    'AI Act Annex III(6) — risk assessment of natural persons',
    FALSE, FALSE, FALSE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000024',
    'SCHUFA credit scoring',
    'a1000000-0000-0000-0000-000000000024',
    'Credit-scoring system used by the leading German credit reference agency, holding data on ~70M people; scores are relied on by banks for lending decisions. The CJEU ruled (Case C-634/21, 7 Dec 2023) that generating such a score is "automated individual decision-making" under GDPR Article 22 where it plays a decisive role in lending.',
    'essential', 'high_risk', 'in_production',
    '["DE"]',
    'GDPR Art. 22 (CJEU C-634/21); AI Act Annex III(5) — creditworthiness',
    FALSE, FALSE, FALSE, 'verified'
  )
ON CONFLICT DO NOTHING;

INSERT INTO rg_sources (entity_type, entity_id, title, url, publisher, published_at) VALUES
  ('system', 'b1000000-0000-0000-0000-000000000020', 'Dutch police discontinue controversial crime-predicting algorithm CAS', 'https://nltimes.nl/2026/02/27/dutch-police-discontinue-controversial-crime-predicting-algorithm-cas', 'NL Times', '2026-02-27'),
  ('system', 'b1000000-0000-0000-0000-000000000021', 'NGO Fair Trials calls on EU to ban predictive policing systems', 'https://www.computerweekly.com/news/252506851/NGO-Fair-Trials-calls-on-EU-to-ban-predictive-policing-systems', 'Computer Weekly', '2021-09-20'),
  ('system', 'b1000000-0000-0000-0000-000000000022', 'Police prediction and profiling systems across Europe', 'https://www.statewatch.org/news/2025/june/police-racism-and-criminalisation-across-europe-increasingly-fuelled-by-digital-prediction-and-profiling-systems/', 'Statewatch', '2025-06-30'),
  ('system', 'b1000000-0000-0000-0000-000000000023', 'The Promises and Perils of Predictive Policing (VioGén)', 'https://www.cigionline.org/articles/the-promises-and-perils-of-predictive-policing/', 'CIGI', '2025-05-22'),
  ('system', 'b1000000-0000-0000-0000-000000000024', 'CJEU rules a credit score constitutes automated decision-making under the GDPR', 'https://www.loc.gov/item/global-legal-monitor/2024-01-10/european-union-court-of-justice-rules-credit-scoring-constitutes-automated-individual-decision-making-under-gdpr/', 'Library of Congress', '2024-01-10')
ON CONFLICT DO NOTHING;

INSERT INTO rg_system_rights (system_id, right_id, impact_note, provenance) VALUES
  ('b1000000-0000-0000-0000-000000000020', 'charter_21', 'Court of Audit: historical data produces systematic bias', 'verified'),
  ('b1000000-0000-0000-0000-000000000020', 'charter_8',  'Profiling on location/neighbourhood data', 'verified'),
  ('b1000000-0000-0000-0000-000000000021', 'charter_21', 'Documented discriminatory profiling outcomes', 'verified'),
  ('b1000000-0000-0000-0000-000000000021', 'charter_47', 'Affects fairness in the criminal process', 'verified'),
  ('b1000000-0000-0000-0000-000000000022', 'charter_21', 'Geographic prediction risks reinforcing over-policing', 'verified'),
  ('b1000000-0000-0000-0000-000000000023', 'charter_1',  'Misclassification can leave victims unprotected', 'verified'),
  ('b1000000-0000-0000-0000-000000000023', 'charter_47', 'Risk score shapes protective measures', 'verified'),
  ('b1000000-0000-0000-0000-000000000024', 'charter_8',  'Automated processing of personal data (Art. 22)', 'verified'),
  ('b1000000-0000-0000-0000-000000000024', 'charter_21', 'Score can entrench socio-economic disadvantage', 'verified')
ON CONFLICT DO NOTHING;

SELECT s.annex_area, COUNT(*) AS systems,
       COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited')) AS high_risk,
       COUNT(*) FILTER (WHERE s.fria_known) AS with_fria
FROM rg_systems s GROUP BY s.annex_area ORDER BY systems DESC;
