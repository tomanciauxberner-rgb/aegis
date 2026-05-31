-- ═══════════════════════════════════════════════════════════════
-- Aegis Divergence Engine — SEED WAVE 3
-- Age assurance: a real, sourced divergence on the children terrain.
-- Run after seed waves 1 & 2. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO rg_positions (topic, authority, stance, source_url, stated_at, provenance) VALUES
  ('Age verification approach for minors online',
   'CNIL (France)',
   'Favours a "double-blind" model (the verifier does not learn the site, the site does not learn the identity); but notes in its 2024 deliberation that double-anonymity solutions are not yet fully mature and the requirement could limit short-term availability.',
   'https://dsa-observatory.eu/2025/07/31/do-the-dsa-guidelines-on-protecting-minors-online-strike-the-right-balance/',
   '2024-10-11', 'verified'),
  ('Age verification approach for minors online',
   'European Commission (DSA Guidelines, 2025)',
   'Encourages — but does not mandate — double-blind age verification; promotes an interim EU-wide age-verification system, leaving whether verification is voluntary or mandatory unsettled under the DSA.',
   'https://fpf.org/blog/the-eu-commissions-approach-to-age-verification-mobile-apps-dsa-enforcement-and-challenging-national-social-media-bans/',
   '2025-10-01', 'verified'),
  ('Age verification approach for minors online',
   'EDPB (Statement on Age Assurance)',
   'Sets high-level GDPR-derived principles (best interests of the child, data minimisation, proportionality, risk-based design) without endorsing a specific technical method — a principles-first rather than method-first stance.',
   'https://connectontech.bakermckenzie.com/online-age-assurance-update-about-eu-and-french-frameworks/',
   '2025-02-11', 'verified'),
  ('Age verification approach for minors online',
   'Meta (deployer position)',
   'Argues the obligation should fall on app stores and operating systems to verify age, rather than each platform building its own system — shifting responsibility up the stack.',
   'https://euperspectives.eu/2026/05/age-verification-over-platform-accountability/',
   '2026-05-01', 'verified')
ON CONFLICT DO NOTHING;

SELECT topic, COUNT(DISTINCT authority) AS authorities
FROM rg_positions GROUP BY topic ORDER BY authorities DESC;
