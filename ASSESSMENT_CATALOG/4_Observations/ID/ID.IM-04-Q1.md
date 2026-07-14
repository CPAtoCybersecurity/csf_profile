# ID.IM-04: Cybersecurity Plan Management -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-18
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

Incident response plan established and communicated. Vulnerability management plan documents assessment and response procedures. Business continuity plans exist for critical services. Responsible parties identified for each plan.

### Gaps

Not all plans reviewed within the past 12 months. Disaster recovery plan not tested through functional exercise. Plans do not include supply chain incident scenarios. No centralized plan management repository; plans scattered across multiple locations.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** The 3 falls in Some Security (2.0–4.9), matching the anchor for defined-but-unreliable execution. The plan inventory is real — incident response, vulnerability management, and business continuity plans all exist with responsible parties identified — but maintenance has missed cycles: not all plans were reviewed within the past 12 months, the disaster recovery plan has never been functionally tested, supply chain incident scenarios are absent, and the plans themselves are scattered across multiple locations with no central repository. What separates this from Minimally Acceptable (5.0) is disciplined execution of the review-and-test cycle: every plan reviewed on schedule through the period, with lapses handled as tracked exceptions rather than silent drift.

## Evidence Reviewed

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Complete review of all cybersecurity plans within current cycle | High | Security |
| 2 | Conduct functional disaster recovery plan test | High | IT Operations |
| 3 | Add supply chain incident scenarios to incident response plan | Medium | Security |
| 4 | Establish centralized plan management repository | Low | Security |

## Related

- **Test Procedure:** [ID.IM-04 Test Procedures](../../3_Test_Procedures/ID/ID.IM-04.md)
- **Controls:** [ID.IM-04_Ex1](../../2_Controls/ID/ID.IM-04_Ex1.md), [ID.IM-04_Ex2](../../2_Controls/ID/ID.IM-04_Ex2.md), [ID.IM-04_Ex3](../../2_Controls/ID/ID.IM-04_Ex3.md), [ID.IM-04_Ex4](../../2_Controls/ID/ID.IM-04_Ex4.md), [ID.IM-04_Ex5](../../2_Controls/ID/ID.IM-04_Ex5.md)
