# ID.AM-05: Asset Classification and Prioritization -- Q1 2026 Observation

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

Crown jewels defined with documented business impact. Tiered classification scheme (Critical/High/Medium/Low) established. Quarterly risk review includes asset priority reassessment.

### Gaps

Classification criteria not consistently applied to development and staging environments. Some asset owners have not completed business impact assessments for their systems. No automated enforcement of criticality tagging in non-production AWS accounts.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

**Scoring rationale:** A 4 remains in the Some Security band (2.0–4.9) at its top anchor: the process executes regularly but with material weaknesses. Classification is genuinely operating — crown jewels are defined with documented business impact, a Critical/High/Medium/Low tier scheme is established, and the quarterly risk review reassesses asset priorities — yet coverage is materially incomplete: criteria are not consistently applied to development and staging environments, some owners have never completed business impact assessments, and criticality tagging is unenforced in non-production AWS accounts. Minimally Acceptable (5.0) is separated from this score by full-scope consistency — classification applied across production and non-production alike, with the remaining owner-level BIA gaps tracked as known exceptions.

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

## Related

- **Test Procedure:** [ID.AM-05 Test Procedures](../../3_Test_Procedures/ID/ID.AM-05.md)
- **Controls:** [ID.AM-05_Ex1](../../2_Controls/ID/ID.AM-05_Ex1.md), [ID.AM-05_Ex2](../../2_Controls/ID/ID.AM-05_Ex2.md), [ID.AM-05_Ex3](../../2_Controls/ID/ID.AM-05_Ex3.md)
