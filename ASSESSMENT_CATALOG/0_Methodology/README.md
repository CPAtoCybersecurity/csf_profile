# 0_Methodology — Canon and Assessment Methodology

This directory is the **single source of truth** for the Alma Security training scenario. Everything else in `ASSESSMENT_CATALOG/` is downstream of these four documents.

**Precedence rule:** when any file in this repository conflicts with a 0_Methodology document, the 0_Methodology document wins and the other file gets corrected. Author new content *from* these documents, never from memory of older files.

## Reading order

| # | Document | What it locks | Resolves |
|---|---|---|---|
| 1 | [Alma-Fact-Sheet.md](Alma-Fact-Sheet.md) | Every fact about the fictional company: identity, timeline, cast, financials, tool stack, the ONE risk register, threat profile, the two 2024 incidents, assessment context, and the noncanon→canonical correction table | #234 |
| 2 | [Canonical-Schema.md](Canonical-Schema.md) | The shape of every artifact type: ID formats, risk-register columns, CSV contracts, SP 800-53 reference format, required fields for controls / test procedures / observations / artifacts | #233 |
| 3 | [Scoring-Rubric-and-Methodology.md](Scoring-Rubric-and-Methodology.md) | The ONE 0–10 scoring scale with per-score anchors, maturity bands, rating derivation, scope statement, sampling guide, and independence statement | #235 |
| 4 | [Observation-Template.md](Observation-Template.md) | The canonical structure for every `4_Observations/` file, with anti-boilerplate slot rules | #236 |
| 5 | [Instructor-Key.md](Instructor-Key.md) | Instructor-only material: SPQA lineage, compensation data, scenario design rationale | #234 |

## For contributors

Before authoring or editing any control description, test procedure, observation, or artifact:

1. Pull facts (names, tools, dates, risks, dollar figures) from the **Fact Sheet** — if the fact isn't there, propose adding it there first.
2. Match the file shape to the **Canonical Schema**.
3. Score only with the **Rubric**; respect the independence rules.

Known legacy inconsistencies awaiting correction are tracked in Fact Sheet §10.
