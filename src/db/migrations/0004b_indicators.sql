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

