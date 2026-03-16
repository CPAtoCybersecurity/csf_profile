# Observations

Assessment findings per subcategory per quarter. Each observation documents what the assessor found during testing, the resulting score, and any identified gaps.

## Template

```markdown
# {Subcategory ID}: {Subcategory Description} — {Quarter} {Year} Observation

**Assessment:** {Assessment name}
**Assessor:** {Name and email}
**Observation Date:** {YYYY-MM-DD}
**Testing Status:** {Not Started | In Progress | Complete}

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | {Yes/No} | {What was examined} |
| Interview | {Yes/No} | {Who was interviewed} |
| Test | {Yes/No} | {What was tested} |

## Findings

{Narrative summary of what was observed during the assessment period.}

### Strengths
- {What is working well}

### Gaps
- {What is missing or insufficient}

## Score

| Metric | Value |
|--------|-------|
| Actual Score | {0-10} |
| Target Score | {0-10} |
| Previous Quarter | {0-10 or N/A} |
| Trend | {Improving / Stable / Declining} |

## Evidence Reviewed

- {List of artifacts and evidence examined}

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | {Action} | {High/Medium/Low} | {Name} |

## Related

- **Test Procedure:** [../../3_Test_Procedures/{Function}/{Subcategory-ID}.md]
- **Controls:** [../../2_Controls/{Function}/{Subcategory-ID}_Ex{N}.md]
- **Artifacts:** {Links to specific artifacts reviewed}
```

## File Naming

Files are named `{Subcategory-ID}-Q{N}.md` (e.g., `PR.AA-01-Q1.md`).

One file per subcategory per assessment quarter. If no assessment was performed for a quarter, no file is created.
