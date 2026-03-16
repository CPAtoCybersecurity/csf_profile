# PR.DS-01_Ex1: Enforce Encryption of Data at Rest

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Enforce the use of encryption for data at rest, including full-disk encryption, database encryption, and file-level encryption using approved algorithms and key management practices.

## Alma Security Implementation

Alma enforces AES-256 encryption for all data at rest via S3 SSE-KMS with customer-managed keys, RDS encryption for PostgreSQL databases, BitLocker on on-premises Windows DC servers, and EBS encryption for Kubernetes persistent volumes. Biometric data receives additional application-level encryption before storage. The Data Encryption Upgrade project ($95K) and S3 Bucket Security project ($70K) are standardizing encryption configurations and hardening bucket-level policies across remaining data stores.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS KMS key inventory and encryption policy | AWS KMS Console / IAM policies | 2026-03-01 |
| S3 bucket encryption configuration (all buckets) | AWS S3 Console / AWS Config rule | 2026-03-01 |
| RDS encryption status for PostgreSQL instances | AWS RDS Console | 2026-03-01 |
| BitLocker encryption status on DC servers | Group Policy / BitLocker Management | 2026-02-15 |
| Data Encryption Upgrade project plan and status | Jira project ENCRYPT-2026 | 2026-03-10 |
| S3 Bucket Security project remediation tracker | Jira project S3SEC-2026 | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | In Progress - encryption standards defined, deployment 60% complete |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Not all S3 buckets migrated to SSE-KMS (some still SSE-S3) | Reduced key management control | S3 Bucket Security project migrating all buckets to CMK | Chris Magann | 2026-06-30 |
| Key rotation cycle is 365 days for all keys | May not meet enhanced requirements for biometric data | Evaluate 90-day rotation for biometric data keys | Chris Magann | 2026-05-15 |
| On-prem encryption coverage not centrally reported | Limited visibility into encryption gaps | Deploy centralized BitLocker compliance reporting | Tigan Wang | 2026-06-30 |
