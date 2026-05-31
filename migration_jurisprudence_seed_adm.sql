-- ═══════════════════════════════════════════════════════════════
-- Aegis Jurisprudence — SEED: recent ADM / algorithmic rulings
-- Real, sourced cases that feed the Rights Precedent System.
-- Conforms to jurisprudence_cases schema. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO jurisprudence_cases
  (id, court, name, citation, year, country, summary, holding, relevance, rights_categories, ai_act_articles, sectors, keywords, url, ingest_source, is_active)
VALUES
  (
    'cjeu-dun-bradstreet-2025',
    'CJEU',
    'Dun & Bradstreet Austria',
    'C-203/22',
    2025,
    NULL,
    'A negative automated credit score led to refusal of a mobile contract. The CJEU clarified what a controller must disclose about an automated decision under Article 15(1)(h) GDPR and how this balances against trade secrets.',
    'A data subject is entitled to a concise, transparent and intelligible explanation of the procedure and principles of an automated decision, sufficient to exercise Article 22(3) rights (human intervention, contest). Trade secrets cannot, as a rule, justify withholding that explanation.',
    'binding',
    '["data_protection", "effective_remedy", "non_discrimination"]',
    '["Art. 13", "Art. 26", "Art. 86"]',
    '["essential_services", "employment"]',
    '["automated decision-making", "right to explanation", "credit scoring", "trade secrets", "Article 22"]',
    'https://cms.law/en/fra/news-information/cjeu-landmark-ruling-on-the-right-of-access-and-automated-decision-making',
    'manual',
    TRUE
  ),
  (
    'nl-uber-ola-adm-2023',
    'national',
    'Drivers v. Uber and Ola (Amsterdam Court of Appeal)',
    'Amsterdam Court of Appeal, 4 April 2023',
    2023,
    'NL',
    'Platform drivers sought access to how automated systems allocated work and pay. Uber and Ola resisted, citing trade secrets. The Court of Appeal largely sided with the drivers.',
    'Workers are entitled under Articles 15 and 22 GDPR to meaningful information about automated allocation and remuneration decisions; a generalised trade-secret objection does not override the right of access to one''s own data and to contest solely automated decisions with significant effects.',
    'persuasive',
    '["data_protection", "work", "effective_remedy"]',
    '["Art. 26", "Art. 86"]',
    '["employment"]',
    '["gig work", "algorithmic management", "automated decision-making", "right of access", "platform work"]',
    'https://www.workerinfoexchange.org/post/historic-digital-rights-win-for-wie-and-the-adcu-over-uber-and-ola-at-amsterdam-court-of-appeal',
    'manual',
    TRUE
  ),
  (
    'cjeu-schufa-scoring-2023',
    'CJEU',
    'SCHUFA Holding (Scoring)',
    'C-634/21',
    2023,
    NULL,
    'A credit reference agency generated a probability score relied upon by lenders. The CJEU addressed whether generating such a score is itself automated individual decision-making under Article 22 GDPR.',
    'Generating a credit score constitutes "automated individual decision-making" under Article 22(1) GDPR where a third party draws strongly on that score to establish, implement or terminate a contractual relationship — bringing the score provider within Article 22 obligations.',
    'binding',
    '["data_protection", "non_discrimination", "effective_remedy"]',
    '["Art. 13", "Art. 26", "Art. 86"]',
    '["essential_services", "employment"]',
    '["credit scoring", "automated decision-making", "profiling", "Article 22", "creditworthiness"]',
    'https://www.loc.gov/item/global-legal-monitor/2024-01-10/european-union-court-of-justice-rules-credit-scoring-constitutes-automated-individual-decision-making-under-gdpr/',
    'manual',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

SELECT court, COUNT(*) AS cases FROM jurisprudence_cases WHERE is_active = TRUE GROUP BY court ORDER BY cases DESC;
