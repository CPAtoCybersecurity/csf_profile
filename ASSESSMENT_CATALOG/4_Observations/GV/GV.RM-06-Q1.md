# GV.RM-06: Standardized Risk Methodology — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-10
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed risk methodology documentation, risk register templates, prioritization criteria |
| Interview | Yes | CISO, GRC Manager |
| Test | Yes | Validated risk scoring calculations in ServiceNow against methodology |

## Findings

### Strengths

- FAIR-aligned quantitative methodology defined for high-value risk assessments
- Standardized risk register template in ServiceNow with consistent fields
- Risk prioritization criteria documented and applied through ServiceNow scoring
- Consistent risk categories enable aggregation and trend analysis

### Gaps

- Quantitative analysis criteria not clearly communicated to all risk assessors
- Two risk entries in register missing required fields (treatment plan, target date)

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 6 |
| Target Score | 7 |

**Scoring rationale:** The 6 lands in the Optimized band: a FAIR-aligned quantitative methodology governs high-value assessments, the ServiceNow register enforces a standardized template with consistent categories that enable aggregation and trend analysis, and Internal Audit re-performed the risk scoring calculations and found them faithful to the documented methodology — consistent execution with verified measurement, per the 6 anchor. Two findings hold it under Fully Optimized (7.0): the quantitative analysis criteria are not clearly communicated to all risk assessors, and two register entries were missing required fields (treatment plan and target date), so the methodology's application is not yet demonstrably improving across the assessor population.

## Evidence Reviewed

- Risk methodology documentation
- Risk register in ServiceNow (full export)
- Prioritization criteria definition
- Risk category taxonomy

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Train all risk assessors on quantitative analysis criteria | Medium | GRC Manager |
| 2 | Enforce required field completion in ServiceNow risk register | Low | GRC Manager |

## Related

- **Test Procedure:** [GV.RM-06 Test Procedures](../../3_Test_Procedures/GV/GV.RM-06.md)
- **Controls:** [GV.RM-06_Ex1](../../2_Controls/GV/GV.RM-06_Ex1.md), [GV.RM-06_Ex2](../../2_Controls/GV/GV.RM-06_Ex2.md), [GV.RM-06_Ex3](../../2_Controls/GV/GV.RM-06_Ex3.md), [GV.RM-06_Ex4](../../2_Controls/GV/GV.RM-06_Ex4.md)
