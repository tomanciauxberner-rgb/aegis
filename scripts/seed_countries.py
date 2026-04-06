"""
Aegis — EU-27 Countries Seed Data
Generates SQL INSERT for all EU member states + candidate countries
Run: python scripts/seed_countries.py > src/db/migrations/seed_countries.sql
"""

EU_MEMBERS = [
    ("AT", "AUT", "Austria", "Österreich", "Western Europe", True, False, 1995, 9104772),
    ("BE", "BEL", "Belgium", "België", "Western Europe", True, False, 1958, 11686140),
    ("BG", "BGR", "Bulgaria", "България", "Eastern Europe", True, False, 2007, 6447710),
    ("HR", "HRV", "Croatia", "Hrvatska", "Southern Europe", True, False, 2013, 3862305),
    ("CY", "CYP", "Cyprus", "Κύπρος", "Southern Europe", True, False, 2004, 920987),
    ("CZ", "CZE", "Czechia", "Česko", "Eastern Europe", True, False, 2004, 10827529),
    ("DK", "DNK", "Denmark", "Danmark", "Northern Europe", True, False, 1973, 5932654),
    ("EE", "EST", "Estonia", "Eesti", "Northern Europe", True, False, 2004, 1373101),
    ("FI", "FIN", "Finland", "Suomi", "Northern Europe", True, False, 1995, 5563970),
    ("FR", "FRA", "France", "France", "Western Europe", True, False, 1958, 67897000),
    ("DE", "DEU", "Germany", "Deutschland", "Western Europe", True, False, 1958, 84482267),
    ("GR", "GRC", "Greece", "Ελλάδα", "Southern Europe", True, False, 1981, 10394055),
    ("HU", "HUN", "Hungary", "Magyarország", "Eastern Europe", True, False, 2004, 9597085),
    ("IE", "IRL", "Ireland", "Éire", "Western Europe", True, False, 1973, 5194336),
    ("IT", "ITA", "Italy", "Italia", "Southern Europe", True, False, 1958, 58850717),
    ("LV", "LVA", "Latvia", "Latvija", "Northern Europe", True, False, 2004, 1830211),
    ("LT", "LTU", "Lithuania", "Lietuva", "Northern Europe", True, False, 2004, 2857279),
    ("LU", "LUX", "Luxembourg", "Lëtzebuerg", "Western Europe", True, False, 1958, 672050),
    ("MT", "MLT", "Malta", "Malta", "Southern Europe", True, False, 2004, 542051),
    ("NL", "NLD", "Netherlands", "Nederland", "Western Europe", True, False, 1958, 17811291),
    ("PL", "POL", "Poland", "Polska", "Eastern Europe", True, False, 2004, 36753736),
    ("PT", "PRT", "Portugal", "Portugal", "Southern Europe", True, False, 1986, 10467366),
    ("RO", "ROU", "Romania", "România", "Eastern Europe", True, False, 2007, 19038098),
    ("SK", "SVK", "Slovakia", "Slovensko", "Eastern Europe", True, False, 2004, 5428792),
    ("SI", "SVN", "Slovenia", "Slovenija", "Southern Europe", True, False, 2004, 2116792),
    ("ES", "ESP", "Spain", "España", "Southern Europe", True, False, 1986, 48059777),
    ("SE", "SWE", "Sweden", "Sverige", "Northern Europe", True, False, 1995, 10551707),
]

CANDIDATES = [
    ("AL", "ALB", "Albania", "Shqipëria", "Southern Europe", False, True, None, 2793592),
    ("ME", "MNE", "Montenegro", "Crna Gora", "Southern Europe", False, True, None, 616177),
    ("MK", "MKD", "North Macedonia", "Северна Македонија", "Southern Europe", False, True, None, 1836713),
    ("RS", "SRB", "Serbia", "Србија", "Southern Europe", False, True, None, 6647003),
    ("TR", "TUR", "Turkey", "Türkiye", "Western Asia", False, True, None, 85279553),
    ("UA", "UKR", "Ukraine", "Україна", "Eastern Europe", False, True, None, 36744636),
    ("MD", "MDA", "Moldova", "Moldova", "Eastern Europe", False, True, None, 2512758),
    ("BA", "BIH", "Bosnia and Herzegovina", "Bosna i Hercegovina", "Southern Europe", False, True, None, 3210847),
    ("GE", "GEO", "Georgia", "საქართველო", "Western Asia", False, True, None, 3728573),
]


def generate_sql():
    print("-- Aegis: EU-27 + Candidate Countries Seed")
    print("-- Auto-generated — do not edit manually")
    print()
    print("INSERT INTO countries (code, code3, name, name_local, region, is_eu_member, is_candidate, joined_eu, population)")
    print("VALUES")

    all_countries = EU_MEMBERS + CANDIDATES
    lines = []
    for c in all_countries:
        code, code3, name, name_local, region, is_eu, is_cand, joined, pop = c
        joined_str = str(joined) if joined else "NULL"
        lines.append(
            f"  ('{code}', '{code3}', '{name}', '{name_local}', '{region}', "
            f"{'true' if is_eu else 'false'}, {'true' if is_cand else 'false'}, "
            f"{joined_str}, {pop})"
        )

    print(",\n".join(lines))
    print("ON CONFLICT (code) DO UPDATE SET")
    print("  name = EXCLUDED.name,")
    print("  name_local = EXCLUDED.name_local,")
    print("  population = EXCLUDED.population,")
    print("  is_candidate = EXCLUDED.is_candidate;")


if __name__ == "__main__":
    generate_sql()
