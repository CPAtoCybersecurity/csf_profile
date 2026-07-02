# ID.RA-10: Critical Supplier Assessment -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-17
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

Third-party risk management policy established. Security questionnaires and SOC 2 reviews required for critical vendors. Pre-acquisition assessment process documented. Critical supplier register maintained.

### Gaps

Smaller suppliers may bypass assessment process. No continuous monitoring of supplier security posture. Fourth-party (sub-processor) risk not systematically assessed. Supplier risk ratings not integrated into the enterprise risk register.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** A 3 keeps critical supplier assessment in Some Security (2.0–4.9): the process is well defined — a third-party risk management policy, mandatory security questionnaires and SOC 2 reviews for critical vendors, a documented pre-acquisition assessment, and a maintained critical supplier register — but it does not execute reliably across the supplier population. Smaller suppliers can bypass assessment entirely, supplier posture is checked at a point in time with no continuous monitoring, fourth-party sub-processor risk goes systematically unassessed, and the resulting ratings never feed the enterprise risk register. Minimally Acceptable (5.0) is separated from this score by consistent full-population coverage: every supplier assessed or explicitly triaged out as a tracked exception, sustained through the assessment period.

## Evidence Reviewed

- [Third-Party Risk Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Extend assessment process to cover smaller departmental suppliers | High | Vendor Management |
| 2 | Implement continuous supplier security posture monitoring | Medium | Security |
| 3 | Assess fourth-party (sub-processor) risk systematically | Medium | Vendor Management |
| 4 | Integrate supplier risk ratings into enterprise risk register | Low | Security |

## Related

- **Test Procedure:** [ID.RA-10 Test Procedures](../../3_Test_Procedures/ID/ID.RA-10.md)
- **Controls:** [ID.RA-10_Ex1](../../2_Controls/ID/ID.RA-10_Ex1.md)
