# PR.AA-01 Ex3: Service Account and Non-Person Entity Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-4, IA-5, AC-2

## Implementation Example

> Managing service accounts, shared accounts, and non-person entity credentials with the same rigor as individual user accounts, including documented ownership and regular review

## Alma Security Implementation

Alma Security maintains a service account inventory in ServiceNow CMDB that tracks approximately 45 service accounts across the on-premises Windows Domain Controller, AWS environment, and Kubernetes cluster. Each service account entry documents the owning team, business justification, creation date, last credential rotation, and associated application or service. The inventory is reviewed quarterly by Gerry's security team as part of the access recertification cycle, with service account owners required to confirm continued business need.

On the Windows Domain Controller, service accounts follow a naming convention (svc-[application]-[environment]) and are placed in a dedicated OU with restricted group policy settings. Password rotation for on-premises service accounts is enforced every 90 days through Active Directory password policies, though compliance verification is manual. In AWS, IAM roles with temporary credentials are preferred over long-lived access keys for service-to-service communication. Kubernetes workloads use service account tokens scoped to specific namespaces, with the Cloud Platform team managing RBAC policies.

The shared developer SSH key on port 45001 represents a significant exception to the service account management standard. This key is used by multiple developers for production system access and lacks individual accountability. The security team has documented this as a high-priority remediation item in the risk register, with a target remediation date of Q3 2026. The planned solution involves migrating to individual SSH certificates issued through a certificate authority, providing both unique identity binding and automated rotation.

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
