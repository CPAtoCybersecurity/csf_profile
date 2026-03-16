# ID.RA-07: Change and Exception Risk Management -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve <steve@almasecurity.com>
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
