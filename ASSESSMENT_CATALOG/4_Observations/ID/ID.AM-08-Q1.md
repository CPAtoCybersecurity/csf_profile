# ID.AM-08: Asset Lifecycle Management -- Q1 2026 Observation

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

SDLC includes security review gates. ServiceNow change management tracks lifecycle transitions. Hardware decommissioning procedures documented. Data retention policy established.

### Gaps

15% of changes bypass formal change management. Data destruction verification not consistently documented. Shadow IT identification is reactive, not proactive. No automated end-of-life tracking for software versions.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** This 3 sits in the Some Security band (2.0–4.9). The lifecycle framework is defined end to end — SDLC security review gates, ServiceNow change management tracking transitions, documented hardware decommissioning, and an established data retention policy — but execution leaks: 15% of changes bypass formal change management, data destruction verification is not consistently documented, and software end-of-life has no automated tracking. A 15% bypass rate is a reliability failure, not a minor flaw, which is what keeps this at the "defined but unreliable" anchor. Reaching Minimally Acceptable (5.0) requires the lifecycle controls to hold across essentially the whole change and disposal population, with destruction evidence retained every time and residual exceptions known and tracked.

## Evidence Reviewed

- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Investigate and close 15% change management compliance gap | High | IT Operations |
| 2 | Implement automated end-of-life tracking for software versions | Medium | IT Operations |
| 3 | Standardize data destruction verification documentation | Medium | Security |
| 4 | Deploy proactive shadow IT detection capabilities | Medium | Security |

## Related

- **Test Procedure:** [ID.AM-08 Test Procedures](../../3_Test_Procedures/ID/ID.AM-08.md)
- **Controls:** [ID.AM-08_Ex1](../../2_Controls/ID/ID.AM-08_Ex1.md), [ID.AM-08_Ex2](../../2_Controls/ID/ID.AM-08_Ex2.md), [ID.AM-08_Ex3](../../2_Controls/ID/ID.AM-08_Ex3.md), [ID.AM-08_Ex4](../../2_Controls/ID/ID.AM-08_Ex4.md), [ID.AM-08_Ex5](../../2_Controls/ID/ID.AM-08_Ex5.md), [ID.AM-08_Ex6](../../2_Controls/ID/ID.AM-08_Ex6.md), [ID.AM-08_Ex7](../../2_Controls/ID/ID.AM-08_Ex7.md), [ID.AM-08_Ex8](../../2_Controls/ID/ID.AM-08_Ex8.md), [ID.AM-08_Ex9](../../2_Controls/ID/ID.AM-08_Ex9.md)
