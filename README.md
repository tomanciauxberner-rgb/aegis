# AEGIS
### Open infrastructure for contextual fundamental-rights risk assessment in AI deployments across the EU

> *Algorithmic systems do not operate in a vacuum. They land in societies already shaped by structural discrimination, civic space pressures, and unequal access to justice. AEGIS maps this terrain — before harm occurs.*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![EU AI Act](https://img.shields.io/badge/EU%20AI%20Act-Article%2027-green)](https://artificialintelligenceact.eu/)
[![Data: FRA](https://img.shields.io/badge/Data-EU%20Agency%20for%20Fundamental%20Rights-orange)](https://fra.europa.eu)
[![Status: Community](https://img.shields.io/badge/Status-Open%20to%20Collaboration-purple)]()

---

## Why AEGIS exists

Across the EU, high-risk AI systems are increasingly deployed in employment, access to services, law enforcement, and border management — precisely the contexts where FRA survey data consistently documents entrenched discrimination, civic space erosion, and vulnerability among specific groups.

The EU AI Act mandates Fundamental Rights Impact Assessments (FRIA) under Article 27. Yet today, most FRIA processes remain disconnected from the structural social conditions that determine whether an AI system becomes dangerous in practice.

**AEGIS bridges this gap.**

It is not a compliance checklist. It is a contextual intelligence layer that cross-references:

- **Discrimination signals** — drawn from FRA surveys, Eurostat, and EU equality body data across all 27 Member States
- **Civic space indicators** — civic freedoms, civil society constraints, rule of law deterioration
- **AI deployment contexts** — sector, target group, system type, and risk classification under the AI Act

When three signal types converge on the same `country × vulnerable group × deployment sector`, AEGIS surfaces an alert — not as a legal formality, but as an evidence-based early warning that a rights violation is structurally likely.

---

## What the platform covers today

**Vulnerable groups tracked across EU27**
Children and minors · Persons with disabilities · Racialised communities · Muslim communities · Migrants and asylum seekers · LGBTIQ+ persons · Older persons · Roma

**High-risk sectors**
Employment and recruitment · Education · Access to essential services · Law enforcement · Border management · Healthcare · Social benefits

**Signal types integrated**
FRA Fundamental Rights Survey data · ECRI country reports · Eurostat equality indicators · Media pluralism monitor · Civic space indices · DSA-relevant platform risk data

**FRIA generation**
Context-aware FRIA documents grounded in real EU Agency data — not generic templates — with structured outputs aligned to AI Act Article 27 requirements.

---

## How the convergence model works

```
Country signal     →  structural discrimination rate in target group × sector
Civic space signal →  civil society pressure, rule of law deterioration
AI deployment      →  system type, risk level, operator profile

If signals_converge(country, group, sector):
    → generate contextual risk alert
    → pre-populate FRIA with evidence from FRA/ECRI/Eurostat sources
    → flag specific fundamental rights at elevated risk
```

This is not a scoring model. It is a **sociotechnical early warning system** — designed to surface the conditions under which AI systems become rights-harming before they are deployed.

---

## Alignment with current EU priorities

AEGIS was built in direct response to challenges being actively addressed by European institutions:

| Priority | Institutional source | AEGIS response |
|----------|---------------------|----------------|
| AI governance and fundamental rights | FRA Director, Privacy Symposium 2026 | Contextual FRIA grounded in FRA data |
| Children's safety in algorithmic environments | FRA survey: 89% concerned about exploitation | Minor-specific risk profiling in education/platform sectors |
| Civic space under pressure | FRA civic space webinar 2026 | Civic space indicators integrated into convergence model |
| Encryption and data sovereignty | EDPS 2026 | No PII stored; EU-only data residency (Ireland) |
| Anti-Muslim hatred and racialised discrimination | FRA Director, Vienna meeting 2026 | Group-specific discrimination signal tracking |
| Disability rights and service access | FRA independent living focus | Persons with disabilities as primary tracked group |
| Labour exploitation of migrant workers | FRA, International Workers' Day 2026 | Migration × employment sector convergence alerts |
| GDPR and Digital Omnibus | EDPS, June 2026 conference | Privacy-by-design architecture, no profiling |

---

## Architecture principles

- **Public-interest by design** — no monetisation model, no vendor lock-in, no data brokering
- **Evidence-based** — every risk signal is traceable to a published EU institutional source
- **Transparent methodology** — convergence logic is fully documented and open to scrutiny
- **No PII** — FRIA assessments concern AI *systems*, not individuals
- **EU data residency** — all data processed and stored within the EU (Ireland)
- **Auditable** — append-only audit log, zero trust architecture, Row Level Security

---

## Current limitations (honest disclosure)

AEGIS is a working prototype, not a finished product. Known gaps:

- ETL pipeline covers a subset of available FRA datasets — significant expansion needed
- Convergence model is a first iteration — requires validation by domain experts
- FRIA outputs need review by legal experts specialised in AI Act and fundamental rights law
- Visualisation layer is functional but not yet publication-ready
- Coverage of civic space indicators is partial across Member States

These are open problems. Contributions are welcome.

---

## Invitation to collaborate

AEGIS was built as a foundation, not a finished answer. The methodology, data architecture, and convergence model are deliberately open so that researchers, institutions, and civic technologists can challenge, improve, and extend them.

We are specifically looking for:

- **Policy experts and legal scholars** — to validate FRIA methodology against AI Act requirements and fundamental rights law
- **Researchers** — to improve signal selection, convergence logic, and country-level data coverage
- **EU institutions and agencies** — to identify where AEGIS outputs could support existing monitoring or assessment workflows
- **Civic technologists and NGOs** — to extend coverage to sectors and groups currently underrepresented
- **Data journalists** — to build public-facing visualisations from the convergence model

If AEGIS surfaces something useful for your work, or if you see methodological gaps worth addressing, open an issue or reach out directly.

This is not a product looking for users. It is an open infrastructure looking for the people who understand why it matters.

---

## Technical setup

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

**Stack:** Next.js 15 · React 19 · Supabase PostgreSQL (EU-West-1) · Drizzle ORM · Supabase Auth with MFA · Claude API · Vercel

**Required environment variables:** See `.env.example` — Supabase project URL/keys and Anthropic API key.

---

## License

AGPL v3 — Any derivative work that is deployed publicly must remain open source under the same terms. This ensures that improvements made to AEGIS by any actor remain available to the commons.

---

## Live instance

[aegis-eu.com](https://aegis-eu.com) — deployed on Vercel, EU-region Supabase, open registration.

---

<img width="1423" height="707" alt="image" src="https://github.com/user-attachments/assets/2d7b482a-d512-4299-962d-2b1273370ed4" />

<img width="1153" height="671" alt="image" src="https://github.com/user-attachments/assets/8f8a034a-3286-42c4-9083-8e3d56030e44" />
<img width="1164" height="741" alt="image" src="https://github.com/user-attachments/assets/abf1274e-6195-42b7-8bdf-5895af2b1995" />
<img width="1167" height="663" alt="image" src="https://github.com/user-attachments/assets/f6c8119c-d0bf-4378-b2f3-d698cdd07692" />
<img width="1148" height="728" alt="image" src="https://github.com/user-attachments/assets/6fd7ead6-a4f1-4634-abba-2f8192e36a7a" />
<img width="1157" height="725" alt="image" src="https://github.com/user-attachments/assets/130dbff9-509a-4749-8421-eb1b9b4323e7" />









*Built by [ThinkLance AI](https://aegis-eu.com) · 2026 · Brussels*
