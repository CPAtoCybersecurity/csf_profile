# PR.AA-01 Ex3: Service Account and Non-Person Entity Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-4, IA-5, AC-2

## Implementation Example

> Managing service accounts, shared accounts, and non-person entity credentials with the same rigor as individual user accounts, including documented ownership and regular review

## Alma Security Implementation

Alma Security tracks approximately 45 service accounts in ServiceNow CMDB across the Windows Domain Controller, AWS, and Kubernetes, documenting ownership, business justification, creation date, and last credential rotation for each. On-premises service accounts follow a svc-[application]-[environment] naming convention in a dedicated Active Directory OU with restricted GPO settings and 90-day password rotation enforcement. AWS workloads use IAM roles with temporary credentials, and Kubernetes workloads use namespace-scoped service account tokens. Quarterly access recertification requires service account owners to confirm continued business need.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Service account inventory | ServiceNow CMDB > Service Accounts | 2026-02-15 |
| Quarterly access recertification results | ServiceNow > Access Reviews | 2026-01-31 |
| AD service account OU and GPO settings | Active Directory > Service Accounts OU | 2026-01-20 |
| AWS IAM role inventory | AWS IAM > Roles | 2026-03-01 |
| Shared SSH key remediation plan | Risk Register > R-SSH-001 | 2026-02-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Shared developer SSH key on port 45001 | No individual accountability for production access; cannot attribute actions to specific users | Migrate to individual SSH certificates via certificate authority; decommission shared key | Chris Magann | 2026-09-30 |
| Service account password rotation verification is manual | Cannot confirm 100% compliance with 90-day rotation policy | Implement automated rotation monitoring with ServiceNow alerts for overdue rotations | Tigan Wang | 2026-06-30 |
| 5 service accounts in AWS still use long-lived access keys | Static credentials increase risk of compromise and lateral movement | Migrate remaining access key-based service accounts to IAM roles with temporary credentials | Nadia Khan | 2026-07-31 |
