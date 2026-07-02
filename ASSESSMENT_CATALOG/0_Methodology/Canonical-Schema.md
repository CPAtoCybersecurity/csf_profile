# Canonical Schema — Alma Security Assessment Catalog

**Status:** Authoritative (resolves issue #233)
**Precedence:** When any file in this catalog conflicts with this schema or with the [Alma Fact Sheet](Alma-Fact-Sheet.md), the 0_Methodology documents win. Fix the other file.

This schema locks the shape of every artifact type in the catalog so that scenario content is authored once, in single-source-of-truth form, and never restructured after the fact.

---

## 1. Canonical Identifier Formats

| Entity | Format | Example | Defined In |
|---|---|---|---|
| Company goal | `G#` | G1 | Alma Fact Sheet |
| Security team goal | `SG#` | SG3 | Alma Fact Sheet |
| Security KPI | `SK#` | SK1 (TTD) | Alma Fact Sheet |
| Security strategy | `STS#` | STS2 | Alma Fact Sheet |
| Risk register entry | `R#` | R2 | Alma Fact Sheet §Risk Register (the ONLY register) |
| Incident | `INC-YYYY-NN` | INC-2024-01 | Alma Fact Sheet §Incident History |
| CSF subcategory | `XX.YY-NN` | DE.AE-02 | NIST CSF 2.0 |
| Control implementation | `{Subcategory} Ex{N}` | DE.AE-02 Ex1 | alma-controls.csv `Control ID` |
| Control file | `{Subcategory}_Ex{N}.md` | DE.AE-02_Ex1.md | 2_Controls/{Function}/ |
| Test procedure file | `{Subcategory}.md` | DE.AE-02.md | 3_Test_Procedures/{Function}/ |
| Observation file | `{Subcategory}-Q{N}.md` | DE.AE-02-Q1.md | 4_Observations/{Function}/ |
| Artifact file | `{TYPE}-{slug}.md` | PROC-incident-response-playbook.md | 5_Artifacts/{Category}/ |
| Finding | `F-YYYY-NN` | F-2026-03 | 6_Audit_Report |
| Audit report | `IA-YYYY-NNN` | IA-2026-001 | 6_Audit_Report |

IDs are stable: never renumber an existing ID; retire it and add a new one.

## 2. Risk Register Schema

There is exactly ONE risk register, maintained in the [Alma Fact Sheet](Alma-Fact-Sheet.md). Every risk entry carries all of these columns:

| Column | Type | Required | Notes |
|---|---|---|---|
| `ID` | `R#` | yes | Stable; referenced from controls, test procedures, business case |
| `Title` | short phrase | yes | ≤8 words |
| `Risk Statement` | sentence | yes | Condition → consequence form |
| `Driver` | text | yes | Root event or deficiency (e.g., INC-2024-01) |
| `Owner` | named person (role) | yes | From Fact Sheet cast; no placeholders |
| `Treatment` | Accept / Mitigate / Transfer / Avoid | yes | |
| `Linked Strategy` | `STS#` list | yes | Which strategy addresses it |
| `Linked CSF Subcategories` | list | yes | Primary subcategories that treat the risk |
| `Target Date` | YYYY-MM | yes | Remediation or review milestone |
| `Review Cadence` | Monthly / Quarterly | yes | CISO staff review cycle |

## 3. `alma-controls.csv` Contract

Column order is fixed:

| # | Column | Rules |
|---|---|---|
| 1 | `Control ID` | `{Subcategory} Ex{N}`; must have a matching file in 2_Controls |
| 2 | `Control Implementation Description` | ≤120 words; present tense; references only Fact Sheet-canonical tools, people, risks |
| 3 | `Control Owner` | Named person from the Fact Sheet cast (accountable role) |
| 4 | `Stakeholder(s)` | Semicolon-separated named people/roles from the cast |
| 5 | `Linked Requirements` | SP 800-53 Rev 5 control IDs (see §8) |
| 6 | `Created Date` | YYYY-MM-DD |
| 7 | `Last Modified` | YYYY-MM-DD; ≥ Created Date |

## 4. `alma-assessments.csv` Contract

One row per assessed control implementation. Fixed columns: `ID` (= controls.csv `Control ID`), `Assessment` (canonical name: `2025 Alma Security CSF` for the 2025 cycle), `Scope Type`, `Auditor` (the Internal Audit assessor of record — see [Independence Statement](Scoring-Rubric-and-Methodology.md#6-independence-statement)), `Test Procedure(s)`, then per quarter (Q1–Q4): `Actual Score` (0–10 per the [Scoring Rubric](Scoring-Rubric-and-Methodology.md)), `Target Score`, `Observations`, `Observation Date`, `Testing Status` (`Not Started | In Progress | Complete`), `Examine`, `Interview`, `Test` (Yes/No).

## 5. Control Implementation Files (2_Controls)

Required fields, in order:

1. H1: `# {Subcategory} Ex{N}: {Short Title}`
2. `**Subcategory:**` ID + official CSF 2.0 subcategory text
3. `**NIST SP 800-53 Ref:**` per §8
4. `## Implementation Example` — blockquote of the CSF 2.0 implementation example being illustrated
5. `## Alma Security Implementation` — narrative; MUST use only canonical facts (tools, people, risks, dates) from the Fact Sheet
6. `## Artifacts` — relative links into 5_Artifacts (≥1 for any control claimed as implemented)

## 6. Test Procedure Files (3_Test_Procedures)

Required fields, in order:

1. H1: `# {Subcategory}: {Official Subcategory Text}`
2. Header block: `**Function:**`, `**Category:**`, `**NIST SP 800-53 Ref:**`, `**Implementation Examples:**` (count + range)
3. `## Scope & Applicability` — systems, personnel, and explicit out-of-scope statement. Personnel listed here are *scoped personnel* (control operators/owners). **The assessor of record must never appear in this list** (see Independence Statement).
4. `## Continuous Monitoring Indicators` — table: Indicator | Source | Frequency | Threshold
5. `## Test Procedures` — numbered steps, each tagged with method (Examine / Interview / Test) and mapped to the sampling guide
6. `## Evidence Requirements` — what the assessor collects

## 7. Observation Files (4_Observations)

There is exactly ONE observation template — the one in `4_Observations/README.md`. Required fields: H1 (`{Subcategory}: {text} — Q{N} {Year} Observation`), `**Assessment:**`, `**Assessor:**` (Internal Audit member, never scoped personnel), `**Observation Date:**`, `**Testing Status:**`, `## Testing Methods` (Examine/Interview/Test table), `## Findings` (with `### Strengths` and `### Gaps`), `## Score` (Actual / Target / Previous Quarter / Trend — all scores on the 0–10 rubric scale, no other scale permitted), `## Evidence Reviewed`, `## Recommendations` (# | Recommendation | Priority | Owner), `## Related` (links to test procedure, controls, artifacts).

Any observation file using a different score scale, a percentage, or a 1–5 maturity tier violates this schema.

## 8. SP 800-53 Informative Reference Format

- Rev 5 control IDs, uppercase family + two-digit number: `AU-06`, `IR-04`, `SI-04` (zero-padded).
- Control enhancements use parentheses: `AC-02(01)`.
- Multiple references: comma + space separated, sorted alphabetically by family then number.
- Source of truth: NIST CSF 2.0 informative references mapping to SP 800-53 Rev 5. Do not cite Rev 4 IDs.
- The same reference string appears identically in the control file, the test procedure header, and `Linked Requirements` in alma-controls.csv.

## 9. Artifact Files (5_Artifacts)

Required frontmatter fields in the document header: artifact ID (`{TYPE}-{slug}` where TYPE ∈ POL, PROC, EVD, TKT, INV, RPT), title, owner (named person from cast), effective/collection date, and `Related Controls` (list of `{Subcategory} Ex{N}` IDs). Evidence artifacts additionally state the collection method and period covered.

---

*Created to resolve [#233]. Companion documents: [Alma Fact Sheet](Alma-Fact-Sheet.md) (issue #234), [Scoring Rubric and Methodology](Scoring-Rubric-and-Methodology.md) (issue #235).*
