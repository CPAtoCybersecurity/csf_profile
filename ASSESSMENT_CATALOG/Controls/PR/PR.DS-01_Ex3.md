# PR.DS-01_Ex3: Enforce Access Restrictions on Data at Rest

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-12 (Cryptographic Key Establishment and Management)

## Implementation Example

> Enforce access restrictions to protect the confidentiality and integrity of data at rest, ensuring only authorized users and processes can access stored data through access control lists, IAM policies, and key access controls.

## Alma Security Implementation

Alma enforces access restrictions on data at rest through least-privilege AWS IAM policies for S3/RDS/KMS, Kubernetes RBAC with namespace isolation, NTFS permissions with AD group policies on the on-premises DC, and role-based PostgreSQL grants separating read-only from read-write access. S3 bucket policies deny public access, and KMS key policies separate storage access from decryption capability. Kubernetes secrets are encrypted at rest via AWS KMS envelope encryption with access audited through Kubernetes audit logs.

## Artifacts

- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Data Classification Policy](../../Artifacts/Policies/POL-data-classification.md)
- [Access Certification Report Q4](../../Artifacts/Reports/RPT-access-certification-q4.md)
