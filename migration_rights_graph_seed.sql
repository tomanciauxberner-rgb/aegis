-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — VERIFIED SEED
-- Real, documented AI systems deployed in Europe. Each carries a
-- primary source. Conservative classifications. Run after the
-- rights-graph migration. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- Providers / operators
INSERT INTO rg_providers (id, name, country, provenance) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'eu-LISA', 'EU', 'verified'),
  ('a1000000-0000-0000-0000-000000000002', 'Udbetaling Danmark (UDK)', 'DK', 'verified'),
  ('a1000000-0000-0000-0000-000000000003', 'Dutch State (Ministry of Social Affairs)', 'NL', 'verified'),
  ('a1000000-0000-0000-0000-000000000004', 'BAMF (Federal Office for Migration and Refugees)', 'DE', 'verified'),
  ('a1000000-0000-0000-0000-000000000005', 'Hellenic Police / Greek authorities', 'GR', 'verified')
ON CONFLICT DO NOTHING;

-- Systems (conservative, documented)
INSERT INTO rg_systems (id, name, provider_id, purpose, annex_area, risk_tier, deployment_status, countries, legal_basis, fria_known, affects_children, affects_migrants, provenance) VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'Eurodac (biometric asylum database, expanded)',
    'a1000000-0000-0000-0000-000000000001',
    'EU-wide biometric database storing and processing fingerprints and facial images of asylum applicants and irregular migrants; expanded under Regulation 2024/1358 to collect biometric data from six migrant categories and link records to track individuals across EU territory.',
    'migration', 'high_risk', 'in_production',
    '["EU"]',
    'Regulation (EU) 2024/1358 (recast Eurodac Regulation)',
    FALSE, TRUE, TRUE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'ETIAS (European Travel Information and Authorisation System)',
    'a1000000-0000-0000-0000-000000000001',
    'Pre-travel screening system for visa-exempt third-country nationals to 30 European countries; assesses whether a traveller poses a security or irregular-migration risk prior to arrival.',
    'migration', 'high_risk', 'announced',
    '["EU"]',
    'Regulation (EU) 2018/1240',
    FALSE, FALSE, TRUE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'Udbetaling Danmark fraud-detection models',
    'a1000000-0000-0000-0000-000000000002',
    'More than 60 AI and machine-learning models analysing data from millions of residents (income, family structure, residency) to flag individuals for social-benefits fraud investigation. Documented by Amnesty International as risking discrimination against people with disabilities, low-income individuals, migrants and racialised groups.',
    'essential', 'high_risk', 'in_production',
    '["DK"]',
    'Danish welfare administration law; contested under EU AI Act / GDPR',
    FALSE, FALSE, TRUE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000004',
    'SyRI (System Risk Indication)',
    'a1000000-0000-0000-0000-000000000003',
    'Algorithmic risk-scoring system profiling citizens to predict likelihood of social-security or tax fraud, targeted at low-income and minority neighbourhoods. Ruled unlawful by a Dutch court in 2020 for breaching Article 8 ECHR (right to private life).',
    'essential', 'prohibited', 'withdrawn',
    '["NL"]',
    'SyRI legislation — struck down, District Court of The Hague, 5 Feb 2020',
    FALSE, FALSE, TRUE, 'verified'
  ),
  (
    'b1000000-0000-0000-0000-000000000005',
    'BAMF asylum decision-support (dialect/voice & document analysis)',
    'a1000000-0000-0000-0000-000000000004',
    'AI tools used by the German Federal Office for Migration and Refugees to support asylum adjudications, including dialect/voice analysis to assess claimed origin and document/identity analysis, aimed at reducing processing times.',
    'migration', 'high_risk', 'in_production',
    '["DE"]',
    'German asylum procedure law; AI Act Annex III(7)',
    FALSE, FALSE, TRUE, 'verified'
  )
ON CONFLICT DO NOTHING;

-- Primary sources (provenance for each system)
INSERT INTO rg_sources (entity_type, entity_id, title, url, publisher, published_at) VALUES
  ('system', 'b1000000-0000-0000-0000-000000000001', 'Criminalisation at European Borders and the Role of Artificial Intelligence', 'https://blogs.law.ox.ac.uk/border-criminologies-blog/blog-post/2025/12/criminalisation-european-borders-and-role-artificial', 'Oxford Law Blogs', '2025-12-08'),
  ('system', 'b1000000-0000-0000-0000-000000000002', 'The Use of Artificial Intelligence Technologies in Border and Migration Control', 'https://www.cambridge.org/core/journals/international-and-comparative-law-quarterly/article/use-of-artificial-intelligence-technologies-in-border-and-migration-control-and-the-subtle-erosion-of-human-rights/6E71C6E5C47770C9BA0A0045D785E450', 'Cambridge — ICLQ', '2025-04-04'),
  ('system', 'b1000000-0000-0000-0000-000000000003', 'Denmark: AI-powered welfare system fuels mass surveillance — Coded Injustice', 'https://www.amnesty.org/en/latest/news/2024/11/denmark-ai-powered-welfare-system-fuels-mass-surveillance-and-risks-discriminating-against-marginalized-groups-report/', 'Amnesty International', '2024-11-13'),
  ('system', 'b1000000-0000-0000-0000-000000000004', 'Blackbox welfare fraud detection system breaches human rights, Dutch court rules', 'https://iapp.org/news/a/digital-welfare-fraud-detection-and-the-dutch-syri-judgment', 'IAPP', '2026-02-17'),
  ('system', 'b1000000-0000-0000-0000-000000000005', 'Global National Security, Immigration and AI', 'https://www.americanbar.org/groups/international_law/resources/international-law-news/2025-spring-summer/global-national-security-immigration-ai-brave-new-world/', 'American Bar Association', '2025-09-09')
ON CONFLICT DO NOTHING;

-- System → rights impact edges
INSERT INTO rg_system_rights (system_id, right_id, impact_note, provenance) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'charter_8',  'Mass processing of biometric data', 'verified'),
  ('b1000000-0000-0000-0000-000000000001', 'charter_18', 'Affects access to asylum procedure', 'verified'),
  ('b1000000-0000-0000-0000-000000000001', 'charter_24', 'Six categories include minors', 'verified'),
  ('b1000000-0000-0000-0000-000000000002', 'charter_8',  'Pre-travel data processing and risk scoring', 'verified'),
  ('b1000000-0000-0000-0000-000000000002', 'charter_21', 'Risk of discriminatory profiling', 'verified'),
  ('b1000000-0000-0000-0000-000000000003', 'charter_21', 'Documented discrimination risk against marginalised groups', 'verified'),
  ('b1000000-0000-0000-0000-000000000003', 'charter_8',  'Mass data analysis of millions of residents', 'verified'),
  ('b1000000-0000-0000-0000-000000000004', 'charter_7',  'Court found breach of Art. 8 ECHR / private life', 'verified'),
  ('b1000000-0000-0000-0000-000000000004', 'charter_21', 'Targeted low-income and minority neighbourhoods', 'verified'),
  ('b1000000-0000-0000-0000-000000000005', 'charter_47', 'Affects fairness of asylum adjudication / effective remedy', 'verified'),
  ('b1000000-0000-0000-0000-000000000005', 'charter_18', 'Used within the asylum procedure', 'verified')
ON CONFLICT DO NOTHING;

SELECT s.name, s.annex_area, s.risk_tier, s.provenance,
       (SELECT COUNT(*) FROM rg_sources src WHERE src.entity_id = s.id) AS sources
FROM rg_systems s ORDER BY s.created_at;
