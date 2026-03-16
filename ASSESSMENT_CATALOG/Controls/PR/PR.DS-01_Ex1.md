# PR.DS-01_Ex1: Enforce Encryption of Data at Rest

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Enforce the use of encryption for data at rest, including full-disk encryption, database encryption, and file-level encryption using approved algorithms and key management practices.

## Alma Security Implementation

Alma Security enforces AES-256 encryption as the standard for all data at rest across its hybrid infrastructure. On the AWS side, all S3 buckets are configured with server-side encryption (SSE-KMS) using AWS Key Management Service with customer-managed keys. PostgreSQL databases running on AWS RDS utilize encryption at rest through the RDS encryption feature, which encrypts the underlying storage, automated backups, read replicas, and snapshots. The Data Encryption Upgrade project ($95K, currently in progress) is standardizing encryption configurations across all storage services and remediating any gaps identified during the initial audit.

On-premises infrastructure, specifically the Windows Domain Controller environment, leverages BitLocker Drive Encryption for full-disk encryption on all server volumes. Kubernetes persistent volumes in the AWS multi-AZ deployment are encrypted using EBS encryption with KMS-managed keys. The S3 Bucket Security project ($70K) is hardening bucket-level encryption policies and deploying S3 Bucket Key to reduce KMS API costs while maintaining encryption coverage.

Biometric data, classified as Alma's highest sensitivity data category, receives additional protection through application-level encryption before storage, ensuring double-layer encryption (application + infrastructure). Key rotation is configured on a 365-day cycle through AWS KMS, though the Data Encryption Upgrade project is evaluating reducing this to 90 days for keys protecting biometric data.

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
