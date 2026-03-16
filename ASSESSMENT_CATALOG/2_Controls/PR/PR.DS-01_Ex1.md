# PR.DS-01_Ex1: Enforce Encryption of Data at Rest

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Enforce the use of encryption for data at rest, including full-disk encryption, database encryption, and file-level encryption using approved algorithms and key management practices.

## Alma Security Implementation

Alma enforces AES-256 encryption for all data at rest via S3 SSE-KMS with customer-managed keys, RDS encryption for PostgreSQL databases, BitLocker on on-premises Windows DC servers, and EBS encryption for Kubernetes persistent volumes. Biometric data receives additional application-level encryption before storage. The Data Encryption Upgrade project ($95K) and S3 Bucket Security project ($70K) are standardizing encryption configurations and hardening bucket-level policies across remaining data stores.

## Artifacts

- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
