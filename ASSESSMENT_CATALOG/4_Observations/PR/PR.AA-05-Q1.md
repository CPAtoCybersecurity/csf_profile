# PR.AA-05: Access Authorization Management — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-02-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed the Access Management Policy, ServiceNow access-request workflow configuration, Q4 2025 access certification campaign results, and the CyberArk privileged account inventory |
| Interview | Yes | Interviewed the IT Security Manager on RBAC design, approval workflow enforcement, and certification campaign operations |
| Test | Yes | Traced a sample of provisioning requests through the ServiceNow approval workflow; compared the service account inventory and third-party access roster against active directory entries |

---

## Findings

Access permissions and entitlements are defined in policy and largely managed as designed. The Access Management Policy documents RBAC requirements and least-privilege principles, and the ServiceNow workflow enforces manager and asset-owner approval before provisioning. Quarterly access certification campaigns achieve a 95%+ completion rate, and privileged accounts are vaulted and managed through CyberArk.

Testing surfaced boundary-of-process gaps rather than design failures: three vendors' third-party access recertifications were pending past their due window, two legacy service accounts were absent from the service account inventory until discovered during testing, and the separation-of-duties matrix has not been updated for the recently implemented Workday financials module.

### Strengths

- Access Management Policy defines RBAC and least privilege, and the provisioning path actually enforces it (manager + asset-owner approval in ServiceNow)
- Quarterly access certification campaigns operate at 95%+ completion
- Privileged accounts are centrally vaulted in CyberArk with PAM workflows

### Gaps

- Third-party access recertification backlog: 3 vendors pending review beyond the due window
- Service account inventory missed 2 legacy accounts (discovered only through audit testing)
- Separation-of-duties matrix not updated for the Workday financials module implementation

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |
| Previous Quarter | N/A |
| Trend | N/A (first assessment of this subcategory) |

**Scoring rationale:** Score of 4 (Some Security) reflects a well-designed authorization framework that operates for employees but frays at its edges: third-party recertifications ran past due, the service account population was incomplete until audit testing found the gaps, and the SoD matrix lags a system change. Minimally Acceptable (5.0) requires the review and inventory processes to be complete across all account populations — including vendors and service accounts — without the audit acting as the detection mechanism. Closing the three identified gaps is the direct path to target.

---

## Evidence Reviewed

- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- ServiceNow access-request workflow configuration
- Q4 2025 access certification campaign results ([Access Certification Report](../../5_Artifacts/Reports/RPT-access-certification-q4.md))
- CyberArk privileged account inventory
- Third-party access roster and [Service Accounts Inventory](../../5_Artifacts/Inventories/INV-service-accounts.md)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Clear the third-party recertification backlog (3 vendors) and add an escalation trigger for reviews past due | High | Gerry Callahan |
| 2 | Reconcile the service account inventory against directory and CyberArk data; add the 2 legacy accounts and schedule recurring reconciliation | High | Marcus Lee |
| 3 | Update the separation-of-duties matrix for the Workday financials module and make SoD review a standing step in system implementations | Medium | Dana Okafor |

## Related

- **Test Procedure:** [PR.AA-05 Test Procedures](../../3_Test_Procedures/PR/PR.AA-05.md)
- **Controls:** [PR.AA-05_Ex1](../../2_Controls/PR/PR.AA-05_Ex1.md), [PR.AA-05_Ex2](../../2_Controls/PR/PR.AA-05_Ex2.md), [PR.AA-05_Ex3](../../2_Controls/PR/PR.AA-05_Ex3.md), [PR.AA-05_Ex4](../../2_Controls/PR/PR.AA-05_Ex4.md)
- **Artifacts:** [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md), [Access Certification Report](../../5_Artifacts/Reports/RPT-access-certification-q4.md), [Service Accounts Inventory](../../5_Artifacts/Inventories/INV-service-accounts.md)
