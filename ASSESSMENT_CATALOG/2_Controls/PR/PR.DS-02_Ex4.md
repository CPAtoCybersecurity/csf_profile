# PR.DS-02_Ex4: Manage Encryption Keys for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Implement key management practices for encryption keys used to protect data in transit, including secure key generation, distribution, storage, rotation, and revocation for TLS certificates, VPN keys, and session encryption keys.

## Alma Security Implementation

Alma manages transit encryption keys through ACM for automated TLS certificate lifecycle (auto-renewal 60 days before expiration), the Kubernetes service mesh CA for mTLS certificates (24-hour lifetime with auto-rotation), and a private CA for VPN certificates (2-year validity with CRL). KMS key usage is logged via CloudTrail with separate IAM roles for key administration versus usage. A formal Key Management Plan covering all key types, rotation schedules, and compromise response is not yet documented.

## Artifacts

- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
