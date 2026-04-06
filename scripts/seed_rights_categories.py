"""
Aegis — EU Charter of Fundamental Rights Categories Seed
Maps to the Charter articles relevant for FRIA assessments
"""

RIGHTS_CATEGORIES = [
    ("dignity", "Human Dignity", "Art. 1", "Inviolability of human dignity"),
    ("life", "Right to Life", "Art. 2", "Right to life, prohibition of death penalty"),
    ("integrity", "Right to Integrity", "Art. 3", "Physical and mental integrity of the person"),
    ("torture", "Prohibition of Torture", "Art. 4", "Prohibition of torture and inhuman or degrading treatment"),
    ("slavery", "Prohibition of Slavery", "Art. 5", "Prohibition of slavery, forced labour, trafficking"),
    ("liberty", "Right to Liberty and Security", "Art. 6", "Right to liberty and security of person"),
    ("private_life", "Respect for Private Life", "Art. 7", "Respect for private and family life, home, communications"),
    ("data_protection", "Protection of Personal Data", "Art. 8", "Right to protection of personal data"),
    ("marriage", "Right to Marry", "Art. 9", "Right to marry and found a family"),
    ("thought", "Freedom of Thought", "Art. 10", "Freedom of thought, conscience and religion"),
    ("expression", "Freedom of Expression", "Art. 11", "Freedom of expression and information, media freedom"),
    ("assembly", "Freedom of Assembly", "Art. 12", "Freedom of assembly and association"),
    ("education", "Right to Education", "Art. 14", "Right to education, vocational and continuing training"),
    ("work", "Freedom to Choose Occupation", "Art. 15", "Right to engage in work, freedom to seek employment"),
    ("business", "Freedom to Conduct Business", "Art. 16", "Freedom to conduct a business"),
    ("property", "Right to Property", "Art. 17", "Right to own, use, dispose of property; IP protection"),
    ("asylum", "Right to Asylum", "Art. 18", "Right to asylum in compliance with Geneva Convention"),
    ("non_refoulement", "Protection from Removal", "Art. 19", "Protection from removal, expulsion, extradition"),
    ("equality", "Equality Before the Law", "Art. 20", "Everyone is equal before the law"),
    ("non_discrimination", "Non-Discrimination", "Art. 21", "Prohibition of discrimination on any ground"),
    ("cultural_diversity", "Cultural, Religious, Linguistic Diversity", "Art. 22", "Respect for cultural, religious and linguistic diversity"),
    ("gender_equality", "Equality Between Women and Men", "Art. 23", "Equality between women and men in all areas"),
    ("child_rights", "Rights of the Child", "Art. 24", "Protection and care of children, best interests"),
    ("elderly", "Rights of the Elderly", "Art. 25", "Right to lead a life of dignity and independence"),
    ("disability", "Integration of Persons with Disabilities", "Art. 26", "Right to benefit from measures ensuring autonomy"),
    ("workers_info", "Workers' Right to Information", "Art. 27", "Workers' right to information and consultation"),
    ("collective_bargaining", "Right of Collective Bargaining", "Art. 28", "Right to negotiate and conclude collective agreements"),
    ("fair_working", "Fair and Just Working Conditions", "Art. 31", "Right to working conditions respecting health, safety, dignity"),
    ("social_security", "Social Security and Assistance", "Art. 34", "Right to social security benefits and social services"),
    ("healthcare", "Health Care", "Art. 35", "Right to access preventive health care and medical treatment"),
    ("consumer_protection", "Consumer Protection", "Art. 38", "High level of consumer protection"),
    ("effective_remedy", "Right to Effective Remedy", "Art. 47", "Right to effective remedy and fair trial"),
    ("presumption_innocence", "Presumption of Innocence", "Art. 48", "Presumption of innocence and right of defence"),
    ("legality", "Principles of Legality", "Art. 49", "Principles of legality and proportionality of offences"),
    ("ne_bis_in_idem", "Right Not to Be Tried Twice", "Art. 50", "Right not to be tried or punished twice for same offence"),
]


def generate_sql():
    print("-- Aegis: EU Charter of Fundamental Rights Categories")
    print("-- Auto-generated — do not edit manually")
    print()
    print("INSERT INTO rights_categories (code, name, charter_article, description)")
    print("VALUES")

    lines = []
    for code, name, article, desc in RIGHTS_CATEGORIES:
        name_esc = name.replace("'", "''")
        desc_esc = desc.replace("'", "''")
        lines.append(f"  ('{code}', '{name_esc}', '{article}', '{desc_esc}')")

    print(",\n".join(lines))
    print("ON CONFLICT (code) DO UPDATE SET")
    print("  name = EXCLUDED.name,")
    print("  charter_article = EXCLUDED.charter_article,")
    print("  description = EXCLUDED.description;")


if __name__ == "__main__":
    generate_sql()
