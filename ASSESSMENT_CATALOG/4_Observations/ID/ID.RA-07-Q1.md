# ID.RA-07: Change and Exception Risk Management -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-16
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

ServiceNow change management with mandatory risk assessment. CAB reviews for high-risk changes. Exception process requires risk documentation and approval. Change metrics tracked and reported.

### Gaps

15% of changes bypass formal change management. Emergency change process sometimes used to avoid CAB review. Accepted risk exceptions not reviewed on a scheduled basis. Post-implementation risk review not consistently performed.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

**Scoring rationale:** The 4 is Some Security (2.0–4.9) at its upper anchor — the process runs regularly but with material weaknesses in coverage and integrity. ServiceNow change management enforces a mandatory risk assessment, the CAB reviews high-risk changes, and change metrics are tracked and reported; however, 15% of changes bypass the formal process, the emergency change path is sometimes used specifically to dodge CAB review, and accepted risk exceptions never come back for scheduled review. The distance to Minimally Acceptable (5.0) is closing those integrity leaks: the change population flowing through the control essentially in full, emergency changes reserved for genuine emergencies, and exceptions re-reviewed on a defined schedule so residual deviations are minor and tracked.

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Investigate and close 15% change management compliance gap | High | IT Operations |
| 2 | Restrict emergency change process to genuine emergencies | Medium | IT Operations |
| 3 | Implement scheduled review of accepted risk exceptions | Medium | Security |
| 4 | Require post-implementation risk review for all changes | Low | IT Operations |

## Related

- **Test Procedure:** [ID.RA-07 Test Procedures](../../3_Test_Procedures/ID/ID.RA-07.md)
- **Controls:** [ID.RA-07_Ex1](../../2_Controls/ID/ID.RA-07_Ex1.md), [ID.RA-07_Ex2](../../2_Controls/ID/ID.RA-07_Ex2.md), [ID.RA-07_Ex3](../../2_Controls/ID/ID.RA-07_Ex3.md), [ID.RA-07_Ex4](../../2_Controls/ID/ID.RA-07_Ex4.md)
