# GV.SC-06: Supplier Due Diligence — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-14
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed due diligence records, vendor assessment reports, product integrity checks |
| Interview | Yes | GRC Manager, Security Engineering Lead |
| Test | Yes | Verified due diligence completion for 5 vendors onboarded in Q1 2026 |

## Findings

### Strengths

- Due diligence scaled by criticality tier with comprehensive assessments for Tier 1 candidates
- Cybersecurity capabilities evaluated through questionnaires, certification review, and reference checks
- Product authenticity verification performed for critical software (hash checks, signature validation)
- All 5 sampled Q1 onboardings had completed due diligence before contract execution

### Gaps

- Due diligence completion time averaging 22 business days (target: 15)
- Product integrity checks not formalized for hardware components

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 6 |
| Target Score | 7 |

**Scoring rationale:** Due diligence rates a 6 — Optimized band — on the strength of clean execution plus active measurement: all 5 vendors onboarded in Q1 2026 completed tier-scaled due diligence before contract execution (zero deviations in the test sample), product authenticity is verified for critical software via hash checks and signature validation, and the GRC Manager tracks cycle time as a defined metric. That metric is what separates the score from Fully Optimized (7): completion averages 22 business days against a 15-day target, and the 7 anchor requires trend data showing effectiveness improving across periods — an off-target metric without a demonstrated improvement trend, plus unformalized hardware integrity checks, holds the control at 6.

## Evidence Reviewed

- Vendor due diligence assessment reports (5 sampled)
- Security questionnaire responses
- Product integrity verification logs
- Due diligence cycle time metrics

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Streamline due diligence process to meet 15-day SLA | Medium | GRC Manager |
| 2 | Formalize hardware integrity verification procedures | Low | Security Engineering Lead |

## Related

- **Test Procedure:** [GV.SC-06 Test Procedures](../../3_Test_Procedures/GV/GV.SC-06.md)
- **Controls:** [GV.SC-06_Ex1](../../2_Controls/GV/GV.SC-06_Ex1.md), [GV.SC-06_Ex2](../../2_Controls/GV/GV.SC-06_Ex2.md), [GV.SC-06_Ex3](../../2_Controls/GV/GV.SC-06_Ex3.md), [GV.SC-06_Ex4](../../2_Controls/GV/GV.SC-06_Ex4.md)
