# ID.AM-03: Network Communication and Data Flow Documentation -- Q1 2026 Observation

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

AWS VPC Flow Logs enabled across all production VPCs. Network architecture diagrams maintained in Confluence. Security group rules documented and reviewed during change management.

### Gaps

Network diagrams updated only during major changes, not continuously. No automated network flow baseline tool deployed. Third-party data flow documentation reviewed only annually and may be stale.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Implement automated network flow baseline tool | High | Network Operations |
| 2 | Update network architecture diagrams to reflect current state | High | Cloud Platform |
| 3 | Establish quarterly review cadence for third-party data flows | Medium | Security |
| 4 | Document all cloud infrastructure network flows | Medium | Cloud Platform |
