# PR.DS-01_Ex5: Use Secure Storage Solutions

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-13 (Cryptographic Protection)

## Implementation Example

> Use secure, hardened storage solutions with built-in encryption, access controls, redundancy, and tamper protection to safeguard data at rest throughout its lifecycle.

## Alma Security Implementation

Alma's storage infrastructure uses AWS RDS PostgreSQL (Multi-AZ, KMS-encrypted), S3 with SSE-KMS encryption and versioning, Kubernetes EBS volumes with KMS encryption, and BitLocker-encrypted on-premises DC storage with RAID redundancy. The S3 Bucket Security project ($70K) is hardening all buckets with Block Public Access, Access Analyzer, Object Lock for compliance data, and SecureTransport enforcement. Centralized storage security monitoring across cloud and on-premises environments remains a gap being addressed.

## Artifacts

- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
