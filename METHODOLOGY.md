# AEGIS — Methodology

This document describes how AEGIS produces signals, how it computes convergence, and where every figure comes from. It is written so that a policy expert, legal scholar, or statistician can challenge the logic without reading the source code. Where the implementation has limits, those limits are stated plainly rather than smoothed over.

The convergence logic described here corresponds directly to the `recompute_convergence` SQL function and the cron ingestion routes in the repository. Nothing in this document describes a capability that is not implemented.

---

## 1. The unit of analysis

Every signal and every alert in AEGIS is anchored to a triple:

```
country × vulnerable group × deployment sector
```

- **country** — an ISO two-letter code, restricted to the EU27.
- **group** — one of the tracked vulnerable groups (e.g. migrants, Roma, Muslims, people of African descent, LGBTIQ people, persons with disabilities, children).
- **sector** — a high-risk deployment context (employment, education, healthcare, law enforcement, essential services, housing, online, justice).

A signal that cannot be assigned to a valid two-letter country code is rejected at ingestion. This is enforced in code, not by convention.

---

## 2. Signal types

AEGIS recognises three signal types. Convergence depends on how many *distinct* types coincide on the same triple.

- **statistical** — a measured rate drawn from an institutional dataset (FRA surveys, Eurostat).
- **legislative** — a regulatory or legislative development relevant to the triple.
- **incident** — a documented event or enforcement action.

The signal type is stored on every record. The convergence model never invents a signal type; it only counts the ones present.

---

## 3. Where statistical signals come from

### 3.1 FRA survey data

Statistical signals attributed to the EU Agency for Fundamental Rights are seeded from a curated dataset in which **each data point carries an explicit source**: a publication label, a source URL, the publishing body, and the survey year. The sources currently wired in include:

- Being Black in the EU (2023)
- Being Muslim in the EU (2023)
- EU-MIDIS II — Minorities & Discrimination Survey (2017)
- EU LGBTIQ Survey III (2024)
- Roma Survey II (2021)
- Roma Survey 2024
- Online Content Moderation Study (2023)
- Experiences and Perceptions of Antisemitism (2024)

Every FRA-derived signal stored in the database retains its `source_label`, `source_url`, and `year_observed`. There are no anonymous statistics: if a figure cannot be traced to one of these published sources, it is not in the dataset.

### 3.2 Eurostat (live)

Eurostat signals are fetched live from the Eurostat dissemination API, not hand-copied. The current implementation queries the labour force series `lfsa_ergacob` (employment rate of the foreign-born population, aged 20–64), parses the JSON-stat response, and computes the gap between each Member State's value and the EU27 average. Severity is derived from that gap, not asserted.

---

## 4. How severity is assigned to a single signal

For statistical signals, severity is derived from the distance to a baseline, never set by hand:

- Where an EU27 average exists, severity reflects how far the observed value departs from it (in percentage points and as a ratio).
- Where no EU average is available, severity falls back to absolute thresholds on the observed value.

The exact thresholds are visible in the ingestion code and are deliberately conservative. This is a first iteration and is one of the things most in need of expert challenge (see §7).

---

## 5. How convergence is computed

Convergence is computed by a single, auditable database function (`recompute_convergence`) that runs after each successful ingestion. It does the following, and only the following:

1. Groups all active signals by `country × group × sector`.
2. Counts the number of **distinct signal types** present in each group. This count is the `convergence_score` (1, 2, or 3).
3. Derives an alert severity from the combination of (a) how many distinct signal types converge and (b) the severity distribution of the underlying signals:

   - **critical** — all three signal types present *and* at least two underlying signals are themselves critical.
   - **elevated** — all three types present with at least one critical/elevated signal, *or* at least two types present with at least one critical signal.
   - **watch** — at least two types present, but the conditions above are not met.

4. Records, for each alert, which signal types are present, the IDs of the contributing signals, and a structured detail object containing each contributing signal's type, title, summary, source, year, and (where computable) its delta in percentage points against the EU average.

Two consequences worth stating explicitly:

- An alert is **never** raised from a single isolated statistic. The minimum stored grouping requires at least one signal type, but a meaningful convergence alert requires at least two distinct types coinciding on the same triple.
- The severity logic was deliberately revised away from a naive "three types = critical" rule, because that produced uniformly critical output across all countries and was not defensible. The current logic weighs the actual severity of the underlying signals. This revision is recorded in the migration history.

This is **not** a predictive scoring model and does not claim to be. It is a structured way of surfacing where independent evidence streams overlap.

---

## 6. Traceability and integrity

- **Every signal is traceable.** Source label, source URL, and observation year travel with the signal from ingestion to the convergence detail object that the interface displays.
- **Ingestion is idempotent.** Each signal carries a deterministic `external_id`. Re-running an ingestion does not create duplicates; existing signals are skipped.
- **No personal data.** Signals concern aggregate, published, country-level statistics and AI *systems* — not individuals.

---

## 7. Known limitations and open questions

These are stated so that they can be challenged directly. They are not rhetorical.

- **Dataset coverage is partial.** The FRA dataset wired in covers a subset of published surveys; the live Eurostat integration currently covers one labour-market series. Broadening coverage is the single largest area of needed work, and it is a sourcing exercise, not a modelling one.
- **The severity thresholds are a first iteration.** The percentage-point and ratio cut-offs that map a value to watch/elevated/critical are reasonable defaults, not validated thresholds. A statistician or domain expert challenging these cut-offs would be genuinely useful.
- **The convergence rule is a hypothesis.** "Two or more independent evidence streams coinciding on the same country × group × sector indicates elevated structural risk" is a defensible starting position, not a proven one. It is open to revision.
- **Legislative and incident signals are thinner than statistical ones.** The model is strongest where statistical coverage is densest. Convergence quality depends on all three streams being populated.
- **FRIA outputs require legal review.** The assessment outputs are structured against Article 27's required elements, but they are not a substitute for review by a lawyer specialised in AI Act and fundamental rights law.

---

## 8. How to challenge this

If you work on AI governance, fundamental rights, or EU statistics and something here looks wrong — a threshold that is too blunt, a convergence assumption that does not hold, a source that should be added or removed — that feedback is the point of publishing this document. Open an issue describing the specific claim or rule you disagree with, and what you would replace it with.

AEGIS is open infrastructure under AGPL v3. The methodology is meant to be argued with.
