# PR.AA-01 Ex3: Service Account and Non-Person Entity Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-4, IA-5, AC-2

## Implementation Example

> Managing service accounts, shared accounts, and non-person entity credentials with the same rigor as individual user accounts, including documented ownership and regular review

## Alma Security Implementation

Alma Security tracks approximately 45 service accounts in ServiceNow CMDB across the Windows Domain Controller, AWS, and Kubernetes, documenting ownership, business justification, creation date, and last credential rotation for each. On-premises service accounts follow a svc-[application]-[environment] naming convention in a dedicated Active Directory OU with restricted GPO settings and 90-day password rotation enforcement. AWS workloads use IAM roles with temporary credentials, and Kubernetes workloads use namespace-scoped service account tokens. Quarterly access recertification requires service account owners to confirm continued business need.

## Artifacts

- [Service Account Inventory](../../5_Artifacts/Inventories/INV-service-accounts.md)
- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- [Access Review Procedure](../../5_Artifacts/Procedures/PROC-access-review.md)
- [Access Certification Report Q4](../../5_Artifacts/Reports/RPT-access-certification-q4.md)
