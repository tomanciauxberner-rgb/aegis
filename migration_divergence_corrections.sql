-- ═══════════════════════════════════════════════════════════════
-- Aegis Divergence Engine — VERIFICATION CORRECTIONS
-- Source re-check pass. Fixes one weakly-sourced position and two
-- imprecise dates. Each change verified against a primary/quality source.
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- 1. RBI / law enforcement: the Dutch-DPA position as worded was not cleanly
--    sourced and is complicated by CJEU C-621/22 (4 Oct 2024), which rejected
--    the Netherlands' strict reading of legitimate interest. Replace it with a
--    precisely-sourced statement of that tension.
UPDATE rg_positions
SET stance = 'Has historically applied a strict reading of legitimate interest (Art. 6(1)(f) GDPR), rejecting purely commercial or loosely-defined third-party interests — a stricter line than peer authorities. The CJEU in C-621/22 (4 Oct 2024) rejected that strict interpretation, leaving the lawful scope for biometric processing contested.',
    source_url = 'https://www.aoshearman.com/en/insights/ao-shearman-on-data/cjeu-commercial-interests-of-controller-can-serve-as-a-legitimate-interest',
    stated_at = '2024-10-04'
WHERE topic = 'Legal basis for biometric identification by law enforcement'
  AND authority = 'Dutch DPA (Autoriteit Persoonsgegevens)';

-- 2. Emotion recognition: EDPB/EDPS Joint Opinion 5/2021 adopted 18 June 2021.
UPDATE rg_positions
SET stated_at = '2021-06-18'
WHERE topic = 'Scope of the emotion-recognition prohibition'
  AND authority = 'EDPB / EDPS (Joint Opinion 5/2021)';

-- 3. Age verification: CNIL deliberation on the Arcom framework was 26 Sep 2024.
UPDATE rg_positions
SET stated_at = '2024-09-26'
WHERE topic = 'Age verification approach for minors online'
  AND authority = 'CNIL (France)';

SELECT topic, authority, stated_at, left(stance, 60) AS stance_start
FROM rg_positions
WHERE topic IN ('Legal basis for biometric identification by law enforcement',
                'Scope of the emotion-recognition prohibition',
                'Age verification approach for minors online')
ORDER BY topic, authority;
