# ID.AM-03: Network Communication and Data Flow Documentation -- Q1 2026 Observation

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

AWS VPC Flow Logs enabled across all production VPCs. Network architecture diagrams maintained in Confluence. Security group rules documented and reviewed during change management.

### Gaps

Network diagrams updated only during major changes, not continuously. No automated network flow baseline tool deployed. Third-party data flow documentation reviewed only annually and may be stale.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** A 3 sits in the Some Security band (2.0–4.9), matching the rubric anchor for a defined process with unreliable execution. VPC Flow Logs are enabled across all production VPCs and network architecture diagrams live in Confluence, so the practice clearly exists — but diagrams are refreshed only during major changes, there is no automated flow baseline, and third-party data flow documentation is reviewed only annually and may be stale, meaning the documented picture cannot be trusted quarter to quarter. Closing the gap to Minimally Acceptable (5.0) requires the documentation to stay current continuously across the full period — cloud, on-prem, and third-party flows alike — with only minor flaws rather than whole review cycles going stale.

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

## Related

- **Test Procedure:** [ID.AM-03 Test Procedures](../../3_Test_Procedures/ID/ID.AM-03.md)
- **Controls:** [ID.AM-03_Ex1](../../2_Controls/ID/ID.AM-03_Ex1.md), [ID.AM-03_Ex2](../../2_Controls/ID/ID.AM-03_Ex2.md), [ID.AM-03_Ex3](../../2_Controls/ID/ID.AM-03_Ex3.md), [ID.AM-03_Ex4](../../2_Controls/ID/ID.AM-03_Ex4.md)
