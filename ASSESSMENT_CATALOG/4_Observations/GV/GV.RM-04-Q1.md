# GV.RM-04: Risk Response Strategy — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-09
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed risk response framework, insurance policy, shared responsibility documentation |
| Interview | Yes | CISO, CFO |
| Test | No | N/A |

## Findings

### Strengths

- Risk acceptance and avoidance criteria defined by data classification tier
- Cyber liability insurance maintained ($5M coverage) with annual review
- Shared responsibility models documented for AWS and major SaaS vendors

### Gaps

- Risk acceptance approvals not consistently documented in ServiceNow (some informal email approvals)
- Shared responsibility matrices not completed for three recently onboarded cloud services

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 6 |
| Target Score | 7 |

**Scoring rationale:** A 6 falls in the Optimized band: risk acceptance and avoidance criteria are defined by data classification tier, a $5M cyber liability policy is maintained with annual review, and shared responsibility models are documented for AWS and the major SaaS vendors — a consistently executed response framework with periodic owner review, per the 6 anchor. The distance to Fully Optimized (7.0) shows up in execution discipline: some risk acceptances were approved informally by email rather than through the ServiceNow workflow, and shared responsibility matrices are missing for three recently onboarded cloud services, so the control cannot yet evidence improving, on-schedule closure of its own gaps.

## Evidence Reviewed

- Risk response framework document
- Cyber liability insurance policy details
- AWS shared responsibility matrix
- Risk acceptance records in ServiceNow

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Enforce all risk acceptances through ServiceNow workflow | High | GRC Manager |
| 2 | Complete shared responsibility matrices for new cloud services | Medium | Security Engineering Lead |

## Related

- **Test Procedure:** [GV.RM-04 Test Procedures](../../3_Test_Procedures/GV/GV.RM-04.md)
- **Controls:** [GV.RM-04_Ex1](../../2_Controls/GV/GV.RM-04_Ex1.md), [GV.RM-04_Ex2](../../2_Controls/GV/GV.RM-04_Ex2.md), [GV.RM-04_Ex3](../../2_Controls/GV/GV.RM-04_Ex3.md)
