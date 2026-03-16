# PR.DS-01_Ex3: Enforce Access Restrictions on Data at Rest

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-12 (Cryptographic Key Establishment and Management)

## Implementation Example

> Enforce access restrictions to protect the confidentiality and integrity of data at rest, ensuring only authorized users and processes can access stored data through access control lists, IAM policies, and key access controls.

## Alma Security Implementation

Alma enforces access restrictions on data at rest through least-privilege AWS IAM policies for S3/RDS/KMS, Kubernetes RBAC with namespace isolation, NTFS permissions with AD group policies on the on-premises DC, and role-based PostgreSQL grants separating read-only from read-write access. S3 bucket policies deny public access, and KMS key policies separate storage access from decryption capability. Kubernetes secrets are encrypted at rest via AWS KMS envelope encryption with access audited through Kubernetes audit logs.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS IAM policies for S3, RDS, and KMS access | AWS IAM Console / Terraform configs | 2026-03-01 |
| S3 bucket policies (public access block, cross-account deny) | AWS S3 Console / AWS Config | 2026-03-01 |
| KMS key policies restricting decryption access | AWS KMS Console | 2026-03-01 |
| Kubernetes RBAC policies for storage resources | kubectl / GitOps repository | 2026-02-20 |
| PostgreSQL role grants and access control documentation | Database admin documentation | 2026-02-20 |
| Active Directory group policy for DC storage access | Group Policy Management Console | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Partial - IAM and RBAC policies enforced, access review cadence not yet formalized |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal access review cadence for storage resources | Stale permissions may accumulate over time | Implement quarterly access review for S3 bucket and KMS key policies | Chris Magann | 2026-06-30 |
| Kubernetes secret access not centrally audited | Limited visibility into who accesses sensitive configuration | Enable Kubernetes audit log forwarding to SIEM for secret access events | Tigan Wang | 2026-05-31 |
| Database access roles not reviewed since initial deployment | Potential privilege creep in PostgreSQL role grants | Conduct database access review and document role-to-service mapping | Chris Magann | 2026-05-15 |
