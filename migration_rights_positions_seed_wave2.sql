-- ═══════════════════════════════════════════════════════════════
-- Aegis Divergence Engine — SEED WAVE 2
-- Two more real, sourced topics where EU authorities diverge.
-- Run after migration_rights_positions_seed.sql. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_positions (topic, authority, stance, source_url, stated_at, provenance) VALUES
  -- Topic 5: Scope of the emotion-recognition prohibition
  ('Scope of the emotion-recognition prohibition',
   'EDPB / EDPS (Joint Opinion 5/2021)',
   'Inferring emotions of a natural person is highly undesirable and should be prohibited generally, with only narrow exceptions for health or research — a broader ban than the one finally enacted.',
   'https://fpf.org/blog/red-lines-under-eu-ai-act-unpacking-the-prohibition-of-emotion-recognition-in-the-workplace-and-education-institutions/',
   '2021-06-21', 'verified'),
  ('Scope of the emotion-recognition prohibition',
   'European Commission (Guidelines, Feb 2025)',
   'Prohibition limited to workplace and education contexts and to inference from biometric data; customer-facing use (e.g. call-centre sentiment) and inference from written text fall outside the ban.',
   'https://www.insideprivacy.com/artificial-intelligence/european-commission-guidelines-on-prohibited-ai-practices-under-the-eu-artificial-intelligence-act/',
   '2025-02-04', 'verified'),
  ('Scope of the emotion-recognition prohibition',
   'Hungarian DPA (Budapest Bank case)',
   'Treated emotion-recognition data as ordinary personal data rather than special-category biometric data, while still finding GDPR breaches — a narrower data-classification approach than treating it as Article 9 biometric data outright.',
   'https://fpf.org/blog/red-lines-under-eu-ai-act-unpacking-the-prohibition-of-emotion-recognition-in-the-workplace-and-education-institutions/',
   '2022-02-08', 'verified'),

  -- Topic 6: Legal basis for biometric identification by law enforcement
  ('Legal basis for biometric identification by law enforcement',
   'Dutch DPA (Autoriteit Persoonsgegevens)',
   'Rejected an alleged third-party interest in combating crime as a valid lawful basis for processing biometric data, resulting in enforcement action.',
   'https://fpf.org/blog/red-lines-under-the-eu-ai-act-restricting-real-time-remote-biometric-identification-systems-for-law-enforcement-purposes/',
   '2026-04-07', 'verified'),
  ('Legal basis for biometric identification by law enforcement',
   'Member-State implementation (structural divergence)',
   'Each Member State must legislate which exception categories it opts into and which offences it authorises; with no EU-wide definition of "serious criminal offence", lawful scope for the same technology varies significantly between countries.',
   'https://fpf.org/blog/red-lines-under-the-eu-ai-act-restricting-real-time-remote-biometric-identification-systems-for-law-enforcement-purposes/',
   '2026-04-07', 'verified')
ON CONFLICT DO NOTHING;

SELECT topic, COUNT(DISTINCT authority) AS authorities
FROM rg_positions GROUP BY topic ORDER BY authorities DESC;
