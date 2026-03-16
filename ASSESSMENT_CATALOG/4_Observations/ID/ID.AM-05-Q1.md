# ID.AM-05: Asset Classification and Prioritization -- Q1 2026 Observation

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

Crown jewels defined with documented business impact. Tiered classification scheme (Critical/High/Medium/Low) established. Quarterly risk review includes asset priority reassessment.

### Gaps

Classification criteria not consistently applied to development and staging environments. Some asset owners have not completed business impact assessments for their systems. No automated enforcement of criticality tagging in non-production AWS accounts.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Extend classification criteria to non-production environments | High | Security |
| 2 | Complete business impact assessments for all system owners | Medium | Security |
| 3 | Automate criticality tagging enforcement in all AWS accounts | Medium | Cloud Platform |
| 4 | Establish semi-annual classification review cycle | Low | Security |
