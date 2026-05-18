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

-- === INDICATORS ===
INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'disc_employment_5y', 'Discrimination in employment (last 5 years)', 'Percentage who felt discriminated against when looking for work in the past 5 years', 'percent',
  s.id, rc.id, 'discrimination', 'employment'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'disc_employment_12m', 'Discrimination at work (last 12 months)', 'Percentage who experienced discrimination at work in the past 12 months', 'percent',
  s.id, rc.id, 'discrimination', 'employment'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'harassment_12m', 'Hate-motivated harassment (last 12 months)', 'Percentage who experienced hate-motivated harassment in the past 12 months', 'percent',
  s.id, rc.id, 'hate_crime', 'harassment'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'violence_12m', 'Physical violence (last 12 months)', 'Percentage who experienced physical violence in the past 12 months', 'percent',
  s.id, rc.id, 'violence', 'physical'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'integrity'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'police_stop_12m', 'Police stops (last 12 months)', 'Percentage stopped by police in the past 12 months', 'percent',
  s.id, rc.id, 'policing', 'profiling'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'disc_reporting_rate', 'Discrimination reporting rate', 'Percentage who reported their most recent discrimination experience', 'percent',
  s.id, rc.id, 'reporting', 'discrimination'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'effective_remedy'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'rights_awareness', 'Rights awareness', 'Percentage aware of laws prohibiting discrimination based on ethnicity', 'percent',
  s.id, rc.id, 'awareness', 'rights'
FROM surveys s, rights_categories rc
WHERE s.code = 'EU_MIDIS_II' AND rc.code = 'equality'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'trust_police', 'Trust in police', 'Percentage who trust the police (7-10 on 0-10 scale)', 'percent',
  s.id, rc.id, 'trust', 'institutions'
FROM surveys s, rights_categories rc
WHERE s.code = 'FRS_2019' AND rc.code = 'effective_remedy'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'trust_justice', 'Trust in justice system', 'Percentage who trust the justice system (7-10 on 0-10 scale)', 'percent',
  s.id, rc.id, 'trust', 'institutions'
FROM surveys s, rights_categories rc
WHERE s.code = 'FRS_2019' AND rc.code = 'effective_remedy'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'disc_lgbtiq_employment', 'LGBTIQ discrimination in employment', 'Percentage of LGBTIQ people discriminated against when looking for work', 'percent',
  s.id, rc.id, 'discrimination', 'employment'
FROM surveys s, rights_categories rc
WHERE s.code = 'LGBTIQ_III' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'lgbtiq_harassment_12m', 'LGBTIQ harassment (last 12 months)', 'Percentage of LGBTIQ people who experienced harassment in the past 12 months', 'percent',
  s.id, rc.id, 'hate_crime', 'harassment'
FROM surveys s, rights_categories rc
WHERE s.code = 'LGBTIQ_III' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'roma_poverty_rate', 'Roma at-risk-of-poverty rate', 'Percentage of Roma living below national at-risk-of-poverty threshold', 'percent',
  s.id, rc.id, 'poverty', 'socioeconomic'
FROM surveys s, rights_categories rc
WHERE s.code = 'ROMA_2021' AND rc.code = 'equality'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'roma_disc_employment', 'Roma discrimination in employment', 'Percentage of Roma discriminated against when looking for work (last 5 years)', 'percent',
  s.id, rc.id, 'discrimination', 'employment'
FROM surveys s, rights_categories rc
WHERE s.code = 'ROMA_2021' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'roma_education_early_leaving', 'Roma early school leaving', 'Percentage of Roma aged 18-24 not in education or training', 'percent',
  s.id, rc.id, 'education', 'early_leaving'
FROM surveys s, rights_categories rc
WHERE s.code = 'ROMA_2021' AND rc.code = 'education'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'black_disc_employment_5y', 'Discrimination against people of African descent (employment, 5y)', 'Percentage of people of African descent discriminated when looking for work in 5 years', 'percent',
  s.id, rc.id, 'discrimination', 'employment'
FROM surveys s, rights_categories rc
WHERE s.code = 'BEING_BLACK_2023' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT 'black_racial_profiling', 'Racial profiling of people of African descent', 'Percentage of people of African descent who believe their most recent police stop was racial profiling', 'percent',
  s.id, rc.id, 'policing', 'profiling'
FROM surveys s, rights_categories rc
WHERE s.code = 'BEING_BLACK_2023' AND rc.code = 'non_discrimination'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;

-- === INDICATOR VALUES ===
INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 52, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'AT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 48, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'DE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 45, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'FR' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 41, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'IT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 45, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'FI' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 35, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'SE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 33, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'NL' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 39, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'BE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 35, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'IE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 28, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'PT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 30, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'ES' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 23, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'DE' AND p.code = 'turkish'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 28, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'AT' AND p.code = 'turkish'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 22, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'NL' AND p.code = 'turkish'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 25, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'BE' AND p.code = 'turkish'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 42, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'FR' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 36, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'NL' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 38, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'BE' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 33, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'IT' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 26, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_employment_5y' AND c.code = 'ES' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 47, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'FI' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 42, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'AT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 37, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'DE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 32, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'FR' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 30, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'IT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 28, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'SE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 24, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'NL' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 29, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'BE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 23, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'IE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 15, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'DE' AND p.code = 'turkish'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 22, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'AT' AND p.code = 'turkish'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 26, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'FR' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 23, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'BE' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 18, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'harassment_12m' AND c.code = 'NL' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 34, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'AT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 25, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'DE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 29, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'FR' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 22, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'IT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 32, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'FR' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 19, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'BE' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 17, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'police_stop_12m' AND c.code = 'ES' AND p.code = 'north_african'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 10, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'AT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 13, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'BE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 11, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'DE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 14, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'FR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 15, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'NL' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 8, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'IT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 9, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'ES' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 16, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'SE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 14, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'FI' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 7, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'PL' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 8, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'HU' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2016, 9, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_reporting_rate' AND c.code = 'CZ' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 86, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'FI' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 84, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'DK' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 75, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'AT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 72, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'NL' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 73, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'DE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 71, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'SE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 64, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'BE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 60, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'FR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 58, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'ES' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 55, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'IT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 52, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'PL' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 48, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'CZ' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 51, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'HU' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 47, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'HR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 42, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'BG' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 41, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'RO' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 43, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'SK' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 55, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'GR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 56, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'PT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 76, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'IE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 74, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_police' AND c.code = 'LU' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 82, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'DK' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 78, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'FI' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 68, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'NL' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 65, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'AT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 62, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'DE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 66, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'SE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 57, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'IE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 50, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'BE' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 46, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'FR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 38, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'ES' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 35, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'IT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 37, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'PL' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 40, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'HU' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 39, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'CZ' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 32, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'GR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 28, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'HR' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 25, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'BG' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 30, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'SK' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 27, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'RO' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2019, 40, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'trust_justice' AND c.code = 'PT' AND p.code = 'general'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 84, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'RO' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 83, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'BG' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 82, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'GR' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 75, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'HU' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 72, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'ES' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 74, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'HR' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 58, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'CZ' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 71, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'IT' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 65, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'PT' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 80, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_poverty_rate' AND c.code = 'SK' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 42, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'CZ' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 35, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'GR' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 30, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'HU' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 22, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'RO' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 38, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'ES' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 26, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'BG' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 36, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'SK' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 25, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'HR' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 32, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'IT' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2021, 18, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'roma_disc_employment' AND c.code = 'PT' AND p.code = 'roma'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 19, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'PL' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 16, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'HU' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 18, 1500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'RO' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 17, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'BG' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 14, 4000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'IT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 12, 8000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'FR' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 10, 10000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'DE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 8, 5000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'NL' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 7, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'SE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 6, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'DK' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 11, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'BE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 12, 5000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'ES' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 12, 2500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'AT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 8, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'FI' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 13, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'PT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 9, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'IE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 13, 1500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'CZ' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 15, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'HR' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 16, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'SK' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 18, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'LT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 15, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'LV' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 14, 1500
FROM indicators i, countries c, populations p
WHERE i.code = 'disc_lgbtiq_employment' AND c.code = 'GR' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 32, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'PL' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 28, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'HU' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 30, 1500
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'RO' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 29, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'BG' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 22, 4000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'IT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 20, 8000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'FR' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 18, 10000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'DE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 14, 5000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'NL' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 12, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'SE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 10, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'DK' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 18, 3000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'BE' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 19, 5000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'ES' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 20, 2500
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'AT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 13, 2000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'FI' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 35, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'LT' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 26, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'HR' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 27, 1000
FROM indicators i, countries c, populations p
WHERE i.code = 'lgbtiq_harassment_12m' AND c.code = 'SK' AND p.code = 'lgbtiq'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 55, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'AT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 50, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'DE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 49, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'FI' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 43, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'FR' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 45, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'IT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 41, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'BE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 37, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'IE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 38, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'SE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 32, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'PT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 33, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'ES' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 36, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'NL' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 42, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'DK' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 39, 300
FROM indicators i, countries c, populations p
WHERE i.code = 'black_disc_employment_5y' AND c.code = 'PL' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 63, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'AT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 48, 800
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'DE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 52, 700
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'FR' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 38, 600
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'IT' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 42, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'BE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 55, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'FI' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 40, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'SE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 35, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'NL' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 30, 500
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'IE' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, 2023, 45, 400
FROM indicators i, countries c, populations p
WHERE i.code = 'black_racial_profiling' AND c.code = 'DK' AND p.code = 'african_descent'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;

