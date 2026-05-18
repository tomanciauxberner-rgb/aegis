#!/usr/bin/env python3
import json, ssl, certifi, urllib.request, urllib.error, sys, time
from datetime import datetime

OUTPUT_FILE = "0005_seed_eurostat.sql"
EU27 = {"AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK"}

DATASETS = [
    {
        "eurostat_code": "lfsa_ergacob",
        "indicator_code": "employment_rate_non_eu_born",
        "indicator_name": "Employment rate — non-EU born (15-64)",
        "topic": "discrimination", "subtopic": "employment", "unit": "percent",
        "description": "Employment rate of persons born outside the EU27, aged 15-64. Source: Eurostat LFS (lfsa_ergacob).",
        "dim_filters": {"c_birth": "NEU27_2020_FOR", "sex": "T", "age": "Y15-64", "unit": "PC"},
    },
    {
        "eurostat_code": "lfsa_urgacob",
        "indicator_code": "unemployment_rate_non_eu_born",
        "indicator_name": "Unemployment rate — non-EU born (15-74)",
        "topic": "discrimination", "subtopic": "employment", "unit": "percent",
        "description": "Unemployment rate of persons born outside the EU27, aged 15-74. Source: Eurostat LFS (lfsa_urgacob).",
        "dim_filters": {"c_birth": "NEU27_2020_FOR", "sex": "T", "age": "Y15-74", "unit": "PC"},
    },
]

def get_ctx():
    return ssl.create_default_context(cafile=certifi.where())

def probe(code, ssl_ctx):
    url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{code}?format=JSON&lang=EN&geo=FR"
    req = urllib.request.Request(url, headers={"User-Agent": "Aegis/1.0"})
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=20) as r:
            data = json.loads(r.read())
        return {dim: list(val.get("category",{}).get("index",{}).keys())
                for dim, val in data.get("dimension",{}).items()}
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()[:200]}", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
        return {}

def fetch(code, filters, ssl_ctx):
    geos = ",".join(sorted(EU27))
    fstr = "&".join(f"{k}={v}" for k,v in filters.items())
    url = f"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{code}?format=JSON&lang=EN&geo={geos}&{fstr}"
    print(f"  {url[:120]}...", flush=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Aegis/1.0"})
    try:
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=30) as r:
            data = json.loads(r.read())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()[:400]}", file=sys.stderr)
        return {}
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)
        return {}

    dims = data.get("dimension", {})
    vals = data.get("value", {})
    geo_idx = dims.get("geo",{}).get("category",{}).get("index",{})
    time_idx = dims.get("time",{}).get("category",{}).get("index",{})
    if not geo_idx or not time_idx:
        print("  Missing geo/time dims", file=sys.stderr)
        return {}

    yr = sorted(time_idx.keys(), reverse=True)[0]
    y_i = time_idx[yr]
    n_t = len(time_idx)
    result = {}
    for cc, g_i in geo_idx.items():
        if cc not in EU27: continue
        k = str(g_i * n_t + y_i)
        if k in vals and vals[k] is not None:
            result[cc] = {"value": round(float(vals[k]), 2), "year": int(yr)}
    print(f"  {len(result)} EU27 values (year {yr})", flush=True)
    return result

def q(s):
    return s.replace("'", "''")

def build_sql(all_data):
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    out = [
        f"-- Aegis: Eurostat Data Layer — {ts}",
        "-- Source: Eurostat REST Statistics API v1",
        "-- https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/",
        "",
        "INSERT INTO surveys (code, name, year, countries_covered, source_url, methodology) VALUES (",
        "  'EUROSTAT_LFS', 'Eurostat Labour Force Survey — Migration indicators', 2023, 27,",
        "  'https://ec.europa.eu/eurostat/web/microdata/european-union-labour-force-survey',",
        "  'Eurostat LFS — annual harmonised survey on employment by country of birth'",
        ") ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, source_url = EXCLUDED.source_url;",
        "",
        "INSERT INTO populations (code, name, category, description) VALUES (",
        "  'non_eu_born', 'Non-EU born population', 'migration',",
        "  'Persons born outside the EU27 (2020 composition), Eurostat LFS classification'",
        ") ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;",
        "",
    ]
    for ds in DATASETS:
        out += [
            "INSERT INTO indicators (code, name, description, unit, survey_id, topic, subtopic)",
            f"SELECT '{q(ds['indicator_code'])}', '{q(ds['indicator_name'])}',",
            f"  '{q(ds['description'])}', '{ds['unit']}', s.id,",
            f"  '{ds['topic']}', '{ds['subtopic']}'",
            "FROM surveys s WHERE s.code = 'EUROSTAT_LFS'",
            "ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;",
            "",
        ]
    out.append("-- VALUES")
    for ds, data in zip(DATASETS, all_data):
        if not data:
            out.append(f"-- No data retrieved for {ds['eurostat_code']}\n")
            continue
        out.append(f"-- {ds['indicator_code']} — {len(data)} countries")
        for cc, e in sorted(data.items()):
            out += [
                "INSERT INTO indicator_values (indicator_id, country_id, population_id, year, value, metadata)",
                f"SELECT i.id, c.id, p.id, {e['year']}, {e['value']},",
                f"  '{{\"source\": \"Eurostat {ds['eurostat_code']}\", \"year\": {e['year']}}}'::jsonb",
                f"FROM indicators i JOIN countries c ON c.code = '{cc}'",
                "JOIN populations p ON p.code = 'non_eu_born'",
                f"WHERE i.code = '{ds['indicator_code']}'",
                "ON CONFLICT (indicator_id, country_id, population_id, year)",
                "DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata;",
                "",
            ]
    return "\n".join(out)

def main():
    ssl_ctx = get_ctx()
    print("Aegis — Eurostat seed generator v3\n", flush=True)

    for ds in DATASETS:
        print(f"Probing {ds['eurostat_code']}...", flush=True)
        dims = probe(ds["eurostat_code"], ssl_ctx)
        for d, cats in dims.items():
            print(f"  {d}: {cats[:8]}", flush=True)
        time.sleep(0.5)

    print("\nFetching data...", flush=True)
    all_data = []
    for ds in DATASETS:
        print(f"\n{ds['eurostat_code']}:", flush=True)
        all_data.append(fetch(ds["eurostat_code"], ds["dim_filters"], ssl_ctx))
        time.sleep(1)

    with open(OUTPUT_FILE, "w") as f:
        f.write(build_sql(all_data))

    total = sum(len(d) for d in all_data)
    print(f"\nDone — {total} values → {OUTPUT_FILE}", flush=True)

if __name__ == "__main__":
    main()
