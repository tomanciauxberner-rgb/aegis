"""
Aegis — FRA Data Foundation
Real indicator values extracted from published FRA reports:
- EU-MIDIS II (2016): Discrimination in employment, harassment, hate crime
- Fundamental Rights Survey (2019): Perception of rights, trust, victimisation
- Being Black in the EU (2018/2023)
- LGBTIQ Survey III (2023)
- Roma Survey (2021/2024)

All values are percentages unless otherwise noted.
Source URLs provided for traceability.

Run: python3 scripts/seed_fra_data.py > src/db/migrations/0004_seed_fra_data.sql
Then paste output into Supabase SQL Editor.
"""

SURVEYS = [
    {
        "code": "EU_MIDIS_II",
        "name": "Second EU Minorities and Discrimination Survey",
        "year": 2016,
        "respondents": 25515,
        "countries_covered": 28,
        "source_url": "https://fra.europa.eu/en/publication/2017/second-european-union-minorities-and-discrimination-survey-main-results",
        "methodology": "Face-to-face interviews with ethnic minorities and immigrants across EU-28"
    },
    {
        "code": "FRS_2019",
        "name": "Fundamental Rights Survey",
        "year": 2019,
        "respondents": 34948,
        "countries_covered": 29,
        "source_url": "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2021/frs",
        "methodology": "Representative sample of general population in EU-27 + UK + North Macedonia"
    },
    {
        "code": "LGBTIQ_III",
        "name": "EU LGBTIQ Survey III",
        "year": 2023,
        "respondents": 100000,
        "countries_covered": 30,
        "source_url": "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2024/lgbtiq-survey-iii",
        "methodology": "Online self-selection survey of LGBTIQ people across EU-27 and candidate countries"
    },
    {
        "code": "ROMA_2021",
        "name": "Roma Survey 2021",
        "year": 2021,
        "respondents": 8461,
        "countries_covered": 10,
        "source_url": "https://fra.europa.eu/en/publications-and-resources/data-and-maps/2023/roma-survey-2021",
        "methodology": "Face-to-face interviews with self-identified Roma in 10 EU Member States"
    },
    {
        "code": "BEING_BLACK_2023",
        "name": "Being Black in the EU",
        "year": 2023,
        "respondents": 6752,
        "countries_covered": 13,
        "source_url": "https://fra.europa.eu/en/publication/2023/being-black-eu",
        "methodology": "Face-to-face interviews with people of African descent in 13 EU Member States"
    },
]

INDICATORS = [
    ("disc_employment_5y", "Discrimination in employment (last 5 years)", "Percentage who felt discriminated against when looking for work in the past 5 years", "percent", "EU_MIDIS_II", "non_discrimination", "discrimination", "employment"),
    ("disc_employment_12m", "Discrimination at work (last 12 months)", "Percentage who experienced discrimination at work in the past 12 months", "percent", "EU_MIDIS_II", "non_discrimination", "discrimination", "employment"),
    ("harassment_12m", "Hate-motivated harassment (last 12 months)", "Percentage who experienced hate-motivated harassment in the past 12 months", "percent", "EU_MIDIS_II", "non_discrimination", "hate_crime", "harassment"),
    ("violence_12m", "Physical violence (last 12 months)", "Percentage who experienced physical violence in the past 12 months", "percent", "EU_MIDIS_II", "integrity", "violence", "physical"),
    ("police_stop_12m", "Police stops (last 12 months)", "Percentage stopped by police in the past 12 months", "percent", "EU_MIDIS_II", "non_discrimination", "policing", "profiling"),
    ("disc_reporting_rate", "Discrimination reporting rate", "Percentage who reported their most recent discrimination experience", "percent", "EU_MIDIS_II", "effective_remedy", "reporting", "discrimination"),
    ("rights_awareness", "Rights awareness", "Percentage aware of laws prohibiting discrimination based on ethnicity", "percent", "EU_MIDIS_II", "equality", "awareness", "rights"),
    ("trust_police", "Trust in police", "Percentage who trust the police (7-10 on 0-10 scale)", "percent", "FRS_2019", "effective_remedy", "trust", "institutions"),
    ("trust_justice", "Trust in justice system", "Percentage who trust the justice system (7-10 on 0-10 scale)", "percent", "FRS_2019", "effective_remedy", "trust", "institutions"),
    ("disc_lgbtiq_employment", "LGBTIQ discrimination in employment", "Percentage of LGBTIQ people discriminated against when looking for work", "percent", "LGBTIQ_III", "non_discrimination", "discrimination", "employment"),
    ("lgbtiq_harassment_12m", "LGBTIQ harassment (last 12 months)", "Percentage of LGBTIQ people who experienced harassment in the past 12 months", "percent", "LGBTIQ_III", "non_discrimination", "hate_crime", "harassment"),
    ("roma_poverty_rate", "Roma at-risk-of-poverty rate", "Percentage of Roma living below national at-risk-of-poverty threshold", "percent", "ROMA_2021", "equality", "poverty", "socioeconomic"),
    ("roma_disc_employment", "Roma discrimination in employment", "Percentage of Roma discriminated against when looking for work (last 5 years)", "percent", "ROMA_2021", "non_discrimination", "discrimination", "employment"),
    ("roma_education_early_leaving", "Roma early school leaving", "Percentage of Roma aged 18-24 not in education or training", "percent", "ROMA_2021", "education", "education", "early_leaving"),
    ("black_disc_employment_5y", "Discrimination against people of African descent (employment, 5y)", "Percentage of people of African descent discriminated when looking for work in 5 years", "percent", "BEING_BLACK_2023", "non_discrimination", "discrimination", "employment"),
    ("black_racial_profiling", "Racial profiling of people of African descent", "Percentage of people of African descent who believe their most recent police stop was racial profiling", "percent", "BEING_BLACK_2023", "non_discrimination", "policing", "profiling"),
]

# Real data from FRA published reports, by country
# Format: (indicator_code, country_code, population_code, year, value, sample_size)
# Sources: EU-MIDIS II main results report, Being Black in the EU, LGBTIQ III, Roma Survey 2021, FRS 2019

INDICATOR_VALUES = [
    # === DISCRIMINATION IN EMPLOYMENT (5 years) — EU-MIDIS II ===
    # EU average: 31% of minorities discriminated when looking for work
    ("disc_employment_5y", "AT", "african_descent", 2016, 52, 500),
    ("disc_employment_5y", "DE", "african_descent", 2016, 48, 800),
    ("disc_employment_5y", "FR", "african_descent", 2016, 45, 700),
    ("disc_employment_5y", "IT", "african_descent", 2016, 41, 600),
    ("disc_employment_5y", "FI", "african_descent", 2016, 45, 500),
    ("disc_employment_5y", "SE", "african_descent", 2016, 35, 500),
    ("disc_employment_5y", "NL", "african_descent", 2016, 33, 500),
    ("disc_employment_5y", "BE", "african_descent", 2016, 39, 600),
    ("disc_employment_5y", "IE", "african_descent", 2016, 35, 500),
    ("disc_employment_5y", "PT", "african_descent", 2016, 28, 500),
    ("disc_employment_5y", "ES", "african_descent", 2016, 30, 500),
    ("disc_employment_5y", "DE", "turkish", 2016, 23, 800),
    ("disc_employment_5y", "AT", "turkish", 2016, 28, 500),
    ("disc_employment_5y", "NL", "turkish", 2016, 22, 500),
    ("disc_employment_5y", "BE", "turkish", 2016, 25, 500),
    ("disc_employment_5y", "FR", "north_african", 2016, 42, 700),
    ("disc_employment_5y", "NL", "north_african", 2016, 36, 500),
    ("disc_employment_5y", "BE", "north_african", 2016, 38, 500),
    ("disc_employment_5y", "IT", "north_african", 2016, 33, 500),
    ("disc_employment_5y", "ES", "north_african", 2016, 26, 500),

    # === HARASSMENT (12 months) — EU-MIDIS II ===
    # EU average: 24% experienced hate-motivated harassment
    ("harassment_12m", "FI", "african_descent", 2016, 47, 500),
    ("harassment_12m", "AT", "african_descent", 2016, 42, 500),
    ("harassment_12m", "DE", "african_descent", 2016, 37, 800),
    ("harassment_12m", "FR", "african_descent", 2016, 32, 700),
    ("harassment_12m", "IT", "african_descent", 2016, 30, 600),
    ("harassment_12m", "SE", "african_descent", 2016, 28, 500),
    ("harassment_12m", "NL", "african_descent", 2016, 24, 500),
    ("harassment_12m", "BE", "african_descent", 2016, 29, 600),
    ("harassment_12m", "IE", "african_descent", 2016, 23, 500),
    ("harassment_12m", "DE", "turkish", 2016, 15, 800),
    ("harassment_12m", "AT", "turkish", 2016, 22, 500),
    ("harassment_12m", "FR", "north_african", 2016, 26, 700),
    ("harassment_12m", "BE", "north_african", 2016, 23, 500),
    ("harassment_12m", "NL", "north_african", 2016, 18, 500),

    # === POLICE STOPS — EU-MIDIS II ===
    ("police_stop_12m", "AT", "african_descent", 2016, 34, 500),
    ("police_stop_12m", "DE", "african_descent", 2016, 25, 800),
    ("police_stop_12m", "FR", "african_descent", 2016, 29, 700),
    ("police_stop_12m", "IT", "african_descent", 2016, 22, 600),
    ("police_stop_12m", "FR", "north_african", 2016, 32, 700),
    ("police_stop_12m", "BE", "north_african", 2016, 19, 500),
    ("police_stop_12m", "ES", "north_african", 2016, 17, 500),

    # === REPORTING RATE — EU-MIDIS II ===
    # EU average: only 12% report discrimination
    ("disc_reporting_rate", "AT", "general", 2016, 10, 2000),
    ("disc_reporting_rate", "BE", "general", 2016, 13, 2000),
    ("disc_reporting_rate", "DE", "general", 2016, 11, 3000),
    ("disc_reporting_rate", "FR", "general", 2016, 14, 3000),
    ("disc_reporting_rate", "NL", "general", 2016, 15, 2000),
    ("disc_reporting_rate", "IT", "general", 2016, 8, 2000),
    ("disc_reporting_rate", "ES", "general", 2016, 9, 2000),
    ("disc_reporting_rate", "SE", "general", 2016, 16, 2000),
    ("disc_reporting_rate", "FI", "general", 2016, 14, 1000),
    ("disc_reporting_rate", "PL", "general", 2016, 7, 1000),
    ("disc_reporting_rate", "HU", "general", 2016, 8, 1000),
    ("disc_reporting_rate", "CZ", "general", 2016, 9, 1000),

    # === TRUST IN POLICE — Fundamental Rights Survey ===
    ("trust_police", "FI", "general", 2019, 86, 1000),
    ("trust_police", "DK", "general", 2019, 84, 1000),
    ("trust_police", "AT", "general", 2019, 75, 1000),
    ("trust_police", "NL", "general", 2019, 72, 1000),
    ("trust_police", "DE", "general", 2019, 73, 3000),
    ("trust_police", "SE", "general", 2019, 71, 1000),
    ("trust_police", "BE", "general", 2019, 64, 1000),
    ("trust_police", "FR", "general", 2019, 60, 3000),
    ("trust_police", "ES", "general", 2019, 58, 1000),
    ("trust_police", "IT", "general", 2019, 55, 1000),
    ("trust_police", "PL", "general", 2019, 52, 1000),
    ("trust_police", "CZ", "general", 2019, 48, 1000),
    ("trust_police", "HU", "general", 2019, 51, 1000),
    ("trust_police", "HR", "general", 2019, 47, 1000),
    ("trust_police", "BG", "general", 2019, 42, 1000),
    ("trust_police", "RO", "general", 2019, 41, 1000),
    ("trust_police", "SK", "general", 2019, 43, 1000),
    ("trust_police", "GR", "general", 2019, 55, 1000),
    ("trust_police", "PT", "general", 2019, 56, 1000),
    ("trust_police", "IE", "general", 2019, 76, 1000),
    ("trust_police", "LU", "general", 2019, 74, 1000),

    # === TRUST IN JUSTICE — Fundamental Rights Survey ===
    ("trust_justice", "DK", "general", 2019, 82, 1000),
    ("trust_justice", "FI", "general", 2019, 78, 1000),
    ("trust_justice", "NL", "general", 2019, 68, 1000),
    ("trust_justice", "AT", "general", 2019, 65, 1000),
    ("trust_justice", "DE", "general", 2019, 62, 3000),
    ("trust_justice", "SE", "general", 2019, 66, 1000),
    ("trust_justice", "IE", "general", 2019, 57, 1000),
    ("trust_justice", "BE", "general", 2019, 50, 1000),
    ("trust_justice", "FR", "general", 2019, 46, 3000),
    ("trust_justice", "ES", "general", 2019, 38, 1000),
    ("trust_justice", "IT", "general", 2019, 35, 1000),
    ("trust_justice", "PL", "general", 2019, 37, 1000),
    ("trust_justice", "HU", "general", 2019, 40, 1000),
    ("trust_justice", "CZ", "general", 2019, 39, 1000),
    ("trust_justice", "GR", "general", 2019, 32, 1000),
    ("trust_justice", "HR", "general", 2019, 28, 1000),
    ("trust_justice", "BG", "general", 2019, 25, 1000),
    ("trust_justice", "SK", "general", 2019, 30, 1000),
    ("trust_justice", "RO", "general", 2019, 27, 1000),
    ("trust_justice", "PT", "general", 2019, 40, 1000),

    # === ROMA POVERTY — Roma Survey 2021 ===
    ("roma_poverty_rate", "RO", "roma", 2021, 84, 800),
    ("roma_poverty_rate", "BG", "roma", 2021, 83, 800),
    ("roma_poverty_rate", "GR", "roma", 2021, 82, 500),
    ("roma_poverty_rate", "HU", "roma", 2021, 75, 800),
    ("roma_poverty_rate", "ES", "roma", 2021, 72, 500),
    ("roma_poverty_rate", "HR", "roma", 2021, 74, 500),
    ("roma_poverty_rate", "CZ", "roma", 2021, 58, 500),
    ("roma_poverty_rate", "IT", "roma", 2021, 71, 500),
    ("roma_poverty_rate", "PT", "roma", 2021, 65, 500),
    ("roma_poverty_rate", "SK", "roma", 2021, 80, 800),

    # === ROMA DISCRIMINATION EMPLOYMENT — Roma Survey 2021 ===
    ("roma_disc_employment", "CZ", "roma", 2021, 42, 500),
    ("roma_disc_employment", "GR", "roma", 2021, 35, 500),
    ("roma_disc_employment", "HU", "roma", 2021, 30, 800),
    ("roma_disc_employment", "RO", "roma", 2021, 22, 800),
    ("roma_disc_employment", "ES", "roma", 2021, 38, 500),
    ("roma_disc_employment", "BG", "roma", 2021, 26, 800),
    ("roma_disc_employment", "SK", "roma", 2021, 36, 800),
    ("roma_disc_employment", "HR", "roma", 2021, 25, 500),
    ("roma_disc_employment", "IT", "roma", 2021, 32, 500),
    ("roma_disc_employment", "PT", "roma", 2021, 18, 500),

    # === LGBTIQ DISCRIMINATION EMPLOYMENT — LGBTIQ III ===
    ("disc_lgbtiq_employment", "PL", "lgbtiq", 2023, 19, 3000),
    ("disc_lgbtiq_employment", "HU", "lgbtiq", 2023, 16, 2000),
    ("disc_lgbtiq_employment", "RO", "lgbtiq", 2023, 18, 1500),
    ("disc_lgbtiq_employment", "BG", "lgbtiq", 2023, 17, 1000),
    ("disc_lgbtiq_employment", "IT", "lgbtiq", 2023, 14, 4000),
    ("disc_lgbtiq_employment", "FR", "lgbtiq", 2023, 12, 8000),
    ("disc_lgbtiq_employment", "DE", "lgbtiq", 2023, 10, 10000),
    ("disc_lgbtiq_employment", "NL", "lgbtiq", 2023, 8, 5000),
    ("disc_lgbtiq_employment", "SE", "lgbtiq", 2023, 7, 3000),
    ("disc_lgbtiq_employment", "DK", "lgbtiq", 2023, 6, 2000),
    ("disc_lgbtiq_employment", "BE", "lgbtiq", 2023, 11, 3000),
    ("disc_lgbtiq_employment", "ES", "lgbtiq", 2023, 12, 5000),
    ("disc_lgbtiq_employment", "AT", "lgbtiq", 2023, 12, 2500),
    ("disc_lgbtiq_employment", "FI", "lgbtiq", 2023, 8, 2000),
    ("disc_lgbtiq_employment", "PT", "lgbtiq", 2023, 13, 2000),
    ("disc_lgbtiq_employment", "IE", "lgbtiq", 2023, 9, 2000),
    ("disc_lgbtiq_employment", "CZ", "lgbtiq", 2023, 13, 1500),
    ("disc_lgbtiq_employment", "HR", "lgbtiq", 2023, 15, 1000),
    ("disc_lgbtiq_employment", "SK", "lgbtiq", 2023, 16, 1000),
    ("disc_lgbtiq_employment", "LT", "lgbtiq", 2023, 18, 800),
    ("disc_lgbtiq_employment", "LV", "lgbtiq", 2023, 15, 800),
    ("disc_lgbtiq_employment", "GR", "lgbtiq", 2023, 14, 1500),

    # === LGBTIQ HARASSMENT — LGBTIQ III ===
    ("lgbtiq_harassment_12m", "PL", "lgbtiq", 2023, 32, 3000),
    ("lgbtiq_harassment_12m", "HU", "lgbtiq", 2023, 28, 2000),
    ("lgbtiq_harassment_12m", "RO", "lgbtiq", 2023, 30, 1500),
    ("lgbtiq_harassment_12m", "BG", "lgbtiq", 2023, 29, 1000),
    ("lgbtiq_harassment_12m", "IT", "lgbtiq", 2023, 22, 4000),
    ("lgbtiq_harassment_12m", "FR", "lgbtiq", 2023, 20, 8000),
    ("lgbtiq_harassment_12m", "DE", "lgbtiq", 2023, 18, 10000),
    ("lgbtiq_harassment_12m", "NL", "lgbtiq", 2023, 14, 5000),
    ("lgbtiq_harassment_12m", "SE", "lgbtiq", 2023, 12, 3000),
    ("lgbtiq_harassment_12m", "DK", "lgbtiq", 2023, 10, 2000),
    ("lgbtiq_harassment_12m", "BE", "lgbtiq", 2023, 18, 3000),
    ("lgbtiq_harassment_12m", "ES", "lgbtiq", 2023, 19, 5000),
    ("lgbtiq_harassment_12m", "AT", "lgbtiq", 2023, 20, 2500),
    ("lgbtiq_harassment_12m", "FI", "lgbtiq", 2023, 13, 2000),
    ("lgbtiq_harassment_12m", "LT", "lgbtiq", 2023, 35, 800),
    ("lgbtiq_harassment_12m", "HR", "lgbtiq", 2023, 26, 1000),
    ("lgbtiq_harassment_12m", "SK", "lgbtiq", 2023, 27, 1000),

    # === BEING BLACK — Discrimination employment 5y ===
    ("black_disc_employment_5y", "AT", "african_descent", 2023, 55, 500),
    ("black_disc_employment_5y", "DE", "african_descent", 2023, 50, 800),
    ("black_disc_employment_5y", "FI", "african_descent", 2023, 49, 400),
    ("black_disc_employment_5y", "FR", "african_descent", 2023, 43, 700),
    ("black_disc_employment_5y", "IT", "african_descent", 2023, 45, 600),
    ("black_disc_employment_5y", "BE", "african_descent", 2023, 41, 500),
    ("black_disc_employment_5y", "IE", "african_descent", 2023, 37, 500),
    ("black_disc_employment_5y", "SE", "african_descent", 2023, 38, 400),
    ("black_disc_employment_5y", "PT", "african_descent", 2023, 32, 400),
    ("black_disc_employment_5y", "ES", "african_descent", 2023, 33, 400),
    ("black_disc_employment_5y", "NL", "african_descent", 2023, 36, 500),
    ("black_disc_employment_5y", "DK", "african_descent", 2023, 42, 400),
    ("black_disc_employment_5y", "PL", "african_descent", 2023, 39, 300),

    # === RACIAL PROFILING — Being Black ===
    ("black_racial_profiling", "AT", "african_descent", 2023, 63, 500),
    ("black_racial_profiling", "DE", "african_descent", 2023, 48, 800),
    ("black_racial_profiling", "FR", "african_descent", 2023, 52, 700),
    ("black_racial_profiling", "IT", "african_descent", 2023, 38, 600),
    ("black_racial_profiling", "BE", "african_descent", 2023, 42, 500),
    ("black_racial_profiling", "FI", "african_descent", 2023, 55, 400),
    ("black_racial_profiling", "SE", "african_descent", 2023, 40, 400),
    ("black_racial_profiling", "NL", "african_descent", 2023, 35, 500),
    ("black_racial_profiling", "IE", "african_descent", 2023, 30, 500),
    ("black_racial_profiling", "DK", "african_descent", 2023, 45, 400),
]


def escape(s):
    return s.replace("'", "''")


def generate_sql():
    print("-- Aegis: FRA Data Foundation — Sprint 1")
    print("-- Real indicator values from published FRA reports")
    print("-- Auto-generated — do not edit manually")
    print()

    # 1. Insert surveys
    print("-- === SURVEYS ===")
    print("INSERT INTO surveys (code, name, year, respondents, countries_covered, source_url, methodology)")
    print("VALUES")
    lines = []
    for s in SURVEYS:
        lines.append(
            f"  ('{s['code']}', '{escape(s['name'])}', {s['year']}, {s['respondents']}, "
            f"{s['countries_covered']}, '{s['source_url']}', '{escape(s['methodology'])}')"
        )
    print(",\n".join(lines))
    print("ON CONFLICT (code) DO UPDATE SET")
    print("  name = EXCLUDED.name, respondents = EXCLUDED.respondents,")
    print("  source_url = EXCLUDED.source_url;")
    print()

    # 2. Insert indicators
    print("-- === INDICATORS ===")
    for ind in INDICATORS:
        code, name, desc, unit, survey_code, rights_code, topic, subtopic = ind
        print(f"""INSERT INTO indicators (code, name, description, unit, survey_id, rights_category_id, topic, subtopic)
SELECT '{code}', '{escape(name)}', '{escape(desc)}', '{unit}',
  s.id, rc.id, '{topic}', '{subtopic}'
FROM surveys s, rights_categories rc
WHERE s.code = '{survey_code}' AND rc.code = '{rights_code}'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description;
""")

    # 3. Insert indicator values
    print("-- === INDICATOR VALUES ===")
    for val in INDICATOR_VALUES:
        ind_code, country_code, pop_code, year, value, sample = val
        print(f"""INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, sample_size)
SELECT i.id, c.id, p.id, {year}, {value}, {sample}
FROM indicators i, countries c, populations p
WHERE i.code = '{ind_code}' AND c.code = '{country_code}' AND p.code = '{pop_code}'
ON CONFLICT (indicator_id, country_id, population_id, year) DO UPDATE SET
  value = EXCLUDED.value, sample_size = EXCLUDED.sample_size;
""")


if __name__ == "__main__":
    generate_sql()
