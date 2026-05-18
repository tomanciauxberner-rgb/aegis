-- Aegis: FRA Data Foundation — Sprint 1
-- Real indicator values from published FRA reports
-- Auto-generated — do not edit manually

-- === SURVEYS ===
INSERT INTO surveys (code, name, year, respondents, countries_covered, source_url, methodology)
VALUES
  ('EU_MIDIS_II', 'Second EU Minorities and Discrimination Survey', 2016, 25515, 28, 'https://fra.europa.eu/en/publication/2017/second-european-union-minorities-and-discrimination-survey-main-results', 'Face-to-face interviews with ethnic minorities and immigrants across EU-28'),
  ('FRS_2019', 'Fundamental Rights Survey', 2019, 34948, 29, 'https://fra.europa.eu/en/publications-and-resources/data-and-maps/2021/frs', 'Representative sample of general population in EU-27 + UK + North Macedonia'),
  ('LGBTIQ_III', 'EU LGBTIQ Survey III', 2023, 100000, 30, 'https://fra.europa.eu/en/publications-and-resources/data-and-maps/2024/lgbtiq-survey-iii', 'Online self-selection survey of LGBTIQ people across EU-27 and candidate countries'),
  ('ROMA_2021', 'Roma Survey 2021', 2021, 8461, 10, 'https://fra.europa.eu/en/publications-and-resources/data-and-maps/2023/roma-survey-2021', 'Face-to-face interviews with self-identified Roma in 10 EU Member States'),
  ('BEING_BLACK_2023', 'Being Black in the EU', 2023, 6752, 13, 'https://fra.europa.eu/en/publication/2023/being-black-eu', 'Face-to-face interviews with people of African descent in 13 EU Member States')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, respondents = EXCLUDED.respondents,
  source_url = EXCLUDED.source_url;

