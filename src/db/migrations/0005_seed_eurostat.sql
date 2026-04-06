-- Aegis: Eurostat Data Layer — 2026-04-06 11:14 UTC
-- Source: Eurostat REST Statistics API v1
-- https://ec.europa.eu/eurostat/web/microdata/european-union-labour-force-survey

INSERT INTO surveys (code, name, year, countries_covered, source_url, methodology) VALUES (
  'EUROSTAT_LFS', 'Eurostat Labour Force Survey — Migration indicators', 2023, 27,
  'https://ec.europa.eu/eurostat/web/microdata/european-union-labour-force-survey',
  'Eurostat LFS — annual harmonised survey on employment by country of birth'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, source_url = EXCLUDED.source_url;

INSERT INTO populations (code, name, category, description) VALUES (
  'non_eu_born', 'Non-EU born population', 'migration',
  'Persons born outside the EU27 (2020 composition), Eurostat LFS classification'
) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO indicators (code, name, description, unit, survey_id, topic, subtopic)
SELECT 'employment_rate_non_eu_born', 'Employment rate — non-EU born (15-64)',
  'Employment rate of persons born outside the EU27, aged 15-64. Source: Eurostat LFS (lfsa_ergacob).', 'percent', s.id,
  'discrimination', 'employment'
FROM surveys s WHERE s.code = 'EUROSTAT_LFS'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO indicators (code, name, description, unit, survey_id, topic, subtopic)
SELECT 'unemployment_rate_non_eu_born', 'Unemployment rate — non-EU born (15-74)',
  'Unemployment rate of persons born outside the EU27, aged 15-74. Source: Eurostat LFS (lfsa_urgacob).', 'percent', s.id,
  'discrimination', 'employment'
FROM surveys s WHERE s.code = 'EUROSTAT_LFS'
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- VALUES
-- employment_rate_non_eu_born — 26 countries
INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 64.6,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'AT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 57.0,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'BE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 62.2,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'BG'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 72.8,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'CY'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 77.4,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'CZ'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 66.0,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'DE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 71.4,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'DK'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 72.2,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'EE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 64.3,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'ES'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 61.0,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'FI'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 61.4,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'FR'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 67.6,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'HR'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 69.9,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'HU'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 74.9,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'IE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 64.1,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'IT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 72.0,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'LT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 65.9,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'LU'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 69.2,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'LV'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 83.8,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'MT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 68.6,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'NL'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 78.6,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'PL'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 74.3,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'PT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 73.4,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'RO'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 66.1,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'SE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 73.7,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'SI'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 67.7,
  '{"source": "Eurostat lfsa_ergacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'SK'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'employment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

-- unemployment_rate_non_eu_born — 22 countries
INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 11.4,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'AT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 12.1,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'BE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 6.5,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'CY'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 3.9,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'CZ'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 7.2,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'DE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 11.0,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'DK'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 12.4,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'EE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 16.2,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'ES'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 18.5,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'FI'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 12.0,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'FR'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 3.7,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'HR'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 5.8,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'IE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 9.0,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'IT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 8.0,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'LT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 12.1,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'LU'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 7.6,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'LV'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 4.6,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'MT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 6.3,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'NL'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 3.6,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'PL'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 10.1,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'PT'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 19.3,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'SE'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;

INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)
SELECT i.id, c.id, p.id, 2024, 4.5,
  '{"source": "Eurostat lfsa_urgacob", "year": 2024}'::jsonb
FROM indicators i JOIN countries c ON c.code = 'SI'
JOIN populations p ON p.code = 'non_eu_born'
WHERE i.code = 'unemployment_rate_non_eu_born'
ON CONFLICT (indicator_id, country_id, population_id, year)
DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;
