# ID.AM-04: Supplier Service Inventory -- Q1 2026 Observation

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

ServiceNow tracks major vendor relationships with contract details. New vendor onboarding requires security questionnaire completion. AWS Marketplace purchases are tracked through consolidated billing.

### Gaps

Department-level SaaS purchases sometimes bypass centralized procurement. No automated CASB or SaaS discovery to detect unapproved cloud services. Supplier inventory does not include fourth-party (sub-processor) relationships.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** The score of 3 lands in Some Security (2.0–4.9): the supplier inventory process is defined — ServiceNow tracks major vendor relationships with contract details, new vendors complete security questionnaires, and AWS Marketplace purchases roll up through consolidated billing — but its population is incomplete in ways the process cannot detect. Department-level SaaS purchases sometimes bypass centralized procurement entirely, there is no CASB or SaaS discovery to catch unapproved services, and fourth-party sub-processors are absent from the inventory. To reach Minimally Acceptable (5.0), the inventory would have to consistently capture the full supplier population — including departmental SaaS and sub-processors — with any bypasses surfacing as known, tracked exceptions rather than blind spots.

## Evidence Reviewed

- [Third-Party Risk Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Deploy CASB or SaaS discovery for unapproved cloud services | High | Security |
| 2 | Enforce centralized procurement for all SaaS purchases | High | IT Operations |
| 3 | Document fourth-party (sub-processor) relationships | Medium | Vendor Management |
| 4 | Integrate supplier inventory with security assessment records | Low | Security |

## Related

- **Test Procedure:** [ID.AM-04 Test Procedures](../../3_Test_Procedures/ID/ID.AM-04.md)
- **Controls:** [ID.AM-04_Ex1](../../2_Controls/ID/ID.AM-04_Ex1.md), [ID.AM-04_Ex2](../../2_Controls/ID/ID.AM-04_Ex2.md)
