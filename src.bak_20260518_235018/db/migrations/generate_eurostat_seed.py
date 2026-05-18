#!/usr/bin/env python3
import json
import urllib.request
import urllib.error
import sys
import time
from datetime import datetime

OUTPUT_FILE = "0005_seed_eurostat.sql"

EU27 = ["AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK"]

DATASETS = [
    {
        "eurostat_code": "ilc_di08",
        "indicator_code": "poverty_risk_migrant",
        "indicator_name": "At-risk-of-poverty rate — non-EU born (vs native born)",
        "topic": "discrimination",
        "subtopic": "socioeconomic",
        "unit": "percent",
        "population_code": "non_eu_born",
        "params": "na_item=ARP_NON_EU&age=TOTAL&sex=T&unit=PC",
        "year_filter": 2022,
        "description": "Share of non-EU born population at risk of poverty, Eurostat ilc_di08",
    },
    {
        "eurostat_code": "lfsa_ergacob",
        "indicator_code": "employment_gap_migrant",
        "indicator_name": "Employment rate gap — non-EU born vs native born",
        "topic": "discrimination",
        "subtopic": "employment",
        "unit": "percent",
        "population_code": "non_eu_born",
        "params": "citizen=NON_EU&age=Y20-64&sex=T&unit=PC",
        "year_filter": 2022,
        "description": "Employment rate of non-EU born persons aged 20-64, Eurostat lfsa_ergacob",
    },
]

def fetch_eurostat(dataset_code: str, extra_params: str, year_filter: int) -> dict:
    base = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data"
    geos = ",".join(EU27)
    url = f"{base}/{dataset_code}?format=JSON&geo={geos}&{extra_params}&lang=EN"
    print(f"  Fetching {dataset_code}...", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Aegis-DataPipeline/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} for {dataset_code} — skipping", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"  Error fetching {dataset_code}: {e}", file=sys.stderr)
        return {}

    values_map = raw.get("value", {})
    dims = raw.get("dimension", {})
    geo_dim = dims.get("geo", {}).get("category", {}).get("index", {})
    time_dim = dims.get("time", {}).get("category", {}).get("index", {})

    target_year = str(year_filter)
    if target_year not in time_dim:
        available = list(time_dim.keys())
        available.sort(reverse=True)
        target_year = available[0] if available else None
        if target_year:
            print(f"  Year {year_filter} not found, using {target_year}", flush=True)
        else:
            return {}

    year_idx = time_dim[target_year]
    n_geo = len(geo_dim)

    result = {}
    for country, geo_idx in geo_dim.items():
        flat_idx = str(geo_idx * len(time_dim) + year_idx)
        if flat_idx in values_map and values_map[flat_idx] is not None:
            result[country] = {"value": round(float(values_map[flat_idx]), 2), "year": int(target_year)}

    print(f"  Got {len(result)} countries for {dataset_code} ({target_year})", flush=True)
    return result


def escape(s: str) -> str:
    return s.replace("'", "''")


def generate_sql(datasets_data: list) -> str:
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    lines = [
        "-- Aegis: Eurostat Data Layer",
        f"-- Generated: {ts}",
        "-- Source: Eurostat REST API — https://ec.europa.eu/eurostat/api/dissemination",
        "-- Datasets: " + ", ".join(d["eurostat_code"] for d in DATASETS),
        "-- DO NOT EDIT MANUALLY — regenerate with generate_eurostat_seed.py",
        "",
        "-- === SURVEY ===",
        "INSERT INTO surveys (code, name, year, countries_covered, source_url, methodology)",
        "VALUES (",
        "  'EUROSTAT_2022',",
        "  'Eurostat — Migration & Integration Statistics',",
        "  2022,",
        "  27,",
        "  'https://ec.europa.eu/eurostat/web/migration-asylum/data/database',",
        "  'Eurostat Labour Force Survey and EU-SILC — annual administrative data collection'",
        ")",
        "ON CONFLICT (code) DO UPDATE SET",
        "  name = EXCLUDED.name, source_url = EXCLUDED.source_url;",
        "",
        "-- === POPULATION ===",
        "INSERT INTO populations (code, name, category, description)",
        "VALUES (",
        "  'non_eu_born',",
        "  'Non-EU born population',",
        "  'migration',",
        "  'Persons born outside the European Union, as classified by Eurostat'",
        ")",
        "ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;",
        "",
        "-- === INDICATORS ===",
    ]

    for ds in DATASETS:
        lines += [
            "INSERT INTO indicators (code, name, description, unit, survey_id, topic, subtopic)",
            "SELECT",
            f"  '{escape(ds['indicator_code'])}',",
            f"  '{escape(ds['indicator_name'])}',",
            f"  '{escape(ds['description'])}',",
            f"  '{escape(ds['unit'])}',",
            "  s.id,",
            f"  '{escape(ds['topic'])}',",
            f"  '{escape(ds['subtopic'])}'",
            "FROM surveys s WHERE s.code = 'EUROSTAT_2022'",
            "ON CONFLICT (code) DO UPDATE SET",
            "  name = EXCLUDED.name, description = EXCLUDED.description;",
            "",
        ]

    lines += ["-- === VALUES ==="]

    for ds, data in zip(DATASETS, datasets_data):
        if not data:
            lines.append(f"-- No data retrieved for {ds['eurostat_code']}")
            continue
        lines.append(f"-- {ds['indicator_code']} ({ds['eurostat_code']}) — {len(data)} countries")
        for country_code, entry in sorted(data.items()):
            if country_code not in EU27:
                continue
            lines += [
                "INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)",
                "SELECT",
                "  i.id,",
                "  c.id,",
                "  p.id,",
                f"  {entry['year']},",
                f"  {entry['value']},",
                f"  '{{\"source\": \"Eurostat {ds['eurostat_code']}\", \"year\": {entry['year']}}}'::jsonb",
                "FROM indicators i",
                f"JOIN countries c ON c.code = '{country_code}'",
                "JOIN populations p ON p.code = 'non_eu_born'",
                f"WHERE i.code = '{ds['indicator_code']}'",
                "ON CONFLICT (indicator_id, country_id, population_id, year)",
                "DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;",
                "",
            ]

    return "\n".join(lines)


def main():
    print("Aegis — Eurostat seed generator", flush=True)
    print(f"Target: {OUTPUT_FILE}", flush=True)
    print("", flush=True)

    datasets_data = []
    for ds in DATASETS:
        data = fetch_eurostat(ds["eurostat_code"], ds["params"], ds["year_filter"])
        datasets_data.append(data)
        time.sleep(0.5)

    sql = generate_sql(datasets_data)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(sql)

    total = sum(len(d) for d in datasets_data)
    print(f"\nDone — {total} values written to {OUTPUT_FILE}", flush=True)
    print("Run it in Supabase SQL Editor to populate the DB.", flush=True)


if __name__ == "__main__":
    main()
