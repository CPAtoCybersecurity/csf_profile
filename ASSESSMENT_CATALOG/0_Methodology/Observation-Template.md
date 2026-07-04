# Observation Template

The canonical structure for every file in `4_Observations/`. Promoted from the DE.AE-07 exemplar ([DE.AE-07-Q1.md](../4_Observations/DE/DE.AE-07-Q1.md)) to resolve [#236]. Every observation — one file per subcategory per quarter, named `{Subcat}-Q{N}.md` per the [Canonical Schema](Canonical-Schema.md) — follows this shape.

**The anti-boilerplate rule:** the *structure* below is uniform; the *content* of every slot marked ✍️ must be specific to the subcategory, the quarter, and what the assessor actually did. Uniform filler ("reviewed relevant documentation", "interviewed appropriate personnel") is itself an audit-quality defect. If two observations could swap a paragraph without anyone noticing, the paragraph fails.

---

## Structure

````markdown
# {Subcat}: {Subcategory Name} — Q{N} {Year} Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** {Assessor of record, per the Independence Statement}

**Observation Date:** {YYYY-MM-DD within the quarter's fieldwork window}

**Testing Status:** {Not Started | In Progress | Complete}

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | {Yes/No} | ✍️ the specific artifacts, configs, or records examined |
| Interview | {Yes/No} | ✍️ who (canonical cast, Fact Sheet §3) and what was asked |
| Test | {Yes/No} | ✍️ the specific re-performance or technical verification done |

---

## Findings

✍️ 1–3 paragraphs: what the assessor found, in workpaper voice — what exists,
how it operates, where it falls short. Grounded in the canonical stack (Fact
Sheet §5) and risk register (§6).

### Strengths

- ✍️ specific, evidence-backed positives (not generic praise)

### Gaps

- ✍️ specific shortfalls that explain the distance between actual and target score

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | {0–10, one decimal allowed} |
| Target Score | {0–10, board-approved target} |
| Previous Quarter | {score or N/A} |
| Trend | {Improving / Stable / Declining / N/A (first assessment)} |

**Scoring rationale:** ✍️ 2–5 sentences tying the score to the [Scoring Rubric](Scoring-Rubric-and-Methodology.md) band anchors: what earns the current band, and what specifically separates the score from the next band up. Must name the band label correctly (e.g., 3 = Some Security; 5.0 = Minimally Acceptable).

---

## Evidence Reviewed

- ✍️ the specific artifacts relied on — each must exist in `5_Artifacts/` or be
  named as an interview/system inspection

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | ✍️ actionable, scoped to the gap | {High/Medium/Low} | {canonical cast member} |

## Related

- **Test Procedure:** [{Subcat} Test Procedures](../../3_Test_Procedures/{FN}/{Subcat}.md)
- **Controls:** [{Subcat}_Ex1](../../2_Controls/{FN}/{Subcat}_Ex1.md), …
- **Artifacts:** links into `5_Artifacts/` for the evidence cited above
````

---

## Slot rules

| Slot | Rule |
|---|---|
| Assessment name | Always exactly `2026 Alma Security CSF Assessment` |
| Assessor | A named Internal Audit member (Fact Sheet §3); never a scoped-personnel name — see the [Independence Statement](Scoring-Rubric-and-Methodology.md#6-independence-statement) |
| Observation Date | Inside the quarter's fieldwork window (Q1 2026: Jan 1 – Mar 10) |
| Scores | Data, not format — migration or editing of structure never changes a score |
| Band labels | Per the rubric's contiguous bands; 5.0 belongs to Minimally Acceptable |
| Recommendation owners | Management owners (not the assessor); usually the D&R Lead, VM Lead, CISO, or CTO |
| Related links | Relative paths that resolve; controls list = every `{Subcat}_Ex*.md` that exists |

## Why this template

The workpaper standard it encodes: method transparency (E/I/T), findings before judgment, judgment anchored to a published rubric, evidence traceability, and management-owned remediation. That is the same skeleton a professional internal audit function would defend to an audit committee — which is exactly the fiction this catalog teaches.

---

*Created to resolve [#236]. Companion documents: [Alma Fact Sheet](Alma-Fact-Sheet.md), [Canonical Schema](Canonical-Schema.md), [Scoring Rubric and Methodology](Scoring-Rubric-and-Methodology.md).*
