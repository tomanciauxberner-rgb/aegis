-- ═══════════════════════════════════════════════════════════════
-- Aegis Rights Graph — DIVERGENCE SEED (Sprint 3)
-- Real, sourced regulatory positions grouped by topic. Where
-- authorities diverge on the SAME question, the engine surfaces it.
-- Nothing invented. Run after rights-graph migration. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_positions (topic, authority, stance, source_url, stated_at, provenance) VALUES
  -- Topic 1: Legal basis for AI training on personal data
  ('Legal basis for training AI on personal data',
   'EDPB',
   'Legitimate interest can be a valid basis for developing/deploying AI models, but only after a rigorous, case-by-case Legitimate Interest Assessment; no blanket permission.',
   'https://www.edpb.europa.eu/news/news/2024/edpb-opinion-ai-models-gdpr-principles-support-responsible-ai_en',
   '2024-12-18', 'verified'),
  ('Legal basis for training AI on personal data',
   'CNIL (France) / LfDI (Germany)',
   'List-based approach: name specific scenarios deemed sufficient for legitimate interest (fraud detection, threat prevention, scientific research) — more prescriptive than peer authorities.',
   'https://ppc.land/gdprs-ai-training-legal-battle-regulators-converge-but-still-clash/',
   '2026-03-30', 'verified'),
  ('Legal basis for training AI on personal data',
   'Other EU DPAs (broad-category approach)',
   'Use broader categories such as "improving the performance of a service or product" — described by researchers as lacking systematisation and risking inconsistency.',
   'https://ppc.land/gdprs-ai-training-legal-battle-regulators-converge-but-still-clash/',
   '2026-03-30', 'verified'),

  -- Topic 2: Role of consent for large-scale AI training
  ('Role of consent for large-scale AI training',
   'EDPB',
   'Consent retains a critical role in the lawfulness analysis for large-scale processing.',
   'https://ppc.land/gdprs-ai-training-legal-battle-regulators-converge-but-still-clash/',
   '2026-03-30', 'verified'),
  ('Role of consent for large-scale AI training',
   'EDPS / ICO (UK)',
   'Raise significant concerns about the feasibility of consent in large-scale processing — implying reliance on it is largely impractical.',
   'https://ppc.land/gdprs-ai-training-legal-battle-regulators-converge-but-still-clash/',
   '2026-03-30', 'verified'),

  -- Topic 3: Omnibus opt-out mechanism for AI training data
  ('Omnibus opt-out mechanism for AI training data',
   'European Commission',
   'The Digital Omnibus introduces an opt-out mechanism for individuals whose data is used in AI training, presented as a workable compromise.',
   'https://blog.imseankim.com/eu-digital-omnibus-gdpr-ai-amendments-2026/',
   '2025-11-19', 'verified'),
  ('Omnibus opt-out mechanism for AI training data',
   'EDPB / EDPS (Joint Opinion)',
   'Opt-out fundamentally does not work for data already scraped from the internet; warn the "disproportionate effort" standard is vague and could reclassify clearly personal data as non-personal.',
   'https://blog.imseankim.com/eu-digital-omnibus-gdpr-ai-amendments-2026/',
   '2026-02-11', 'verified'),

  -- Topic 4: When is an AI model "anonymous"
  ('When an AI model trained on personal data is anonymous',
   'EDPB',
   'A model is anonymous only if personal data cannot be extracted or regurgitated; explicitly rejected the broader "Hamburg thesis".',
   'https://privacymatters.dlapiper.com/2025/01/eu-edpb-opinion-on-ai-provides-important-guidance-though-many-questions-remain/',
   '2024-12-17', 'verified'),
  ('When an AI model trained on personal data is anonymous',
   'Hamburg DPA (thesis, rejected)',
   'Argued LLMs as such do not store personal data (the "Hamburg thesis") — a more permissive position the EDPB declined to adopt.',
   'https://privacymatters.dlapiper.com/2025/01/eu-edpb-opinion-on-ai-provides-important-guidance-though-many-questions-remain/',
   '2024-12-17', 'verified')
ON CONFLICT DO NOTHING;

SELECT topic, COUNT(*) AS positions, COUNT(DISTINCT authority) AS authorities
FROM rg_positions GROUP BY topic ORDER BY positions DESC;
