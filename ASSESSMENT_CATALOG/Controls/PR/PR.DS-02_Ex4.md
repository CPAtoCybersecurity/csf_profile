# PR.DS-02_Ex4: Manage Encryption Keys for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Implement key management practices for encryption keys used to protect data in transit, including secure key generation, distribution, storage, rotation, and revocation for TLS certificates, VPN keys, and session encryption keys.

## Alma Security Implementation

Alma manages transit encryption keys through ACM for automated TLS certificate lifecycle (auto-renewal 60 days before expiration), the Kubernetes service mesh CA for mTLS certificates (24-hour lifetime with auto-rotation), and a private CA for VPN certificates (2-year validity with CRL). KMS key usage is logged via CloudTrail with separate IAM roles for key administration versus usage. A formal Key Management Plan covering all key types, rotation schedules, and compromise response is not yet documented.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| ACM certificate inventory with auto-renewal status | AWS Certificate Manager Console | 2026-03-01 |
| Service mesh certificate rotation configuration | Kubernetes service mesh config | 2026-02-20 |
| VPN CA certificate and CRL management procedures | VPN infrastructure documentation | 2026-02-15 |
| KMS key usage logs in CloudTrail | AWS CloudTrail | 2026-03-05 |
| KMS key access policies (IAM) | AWS KMS / IAM Console | 2026-03-01 |
| Key custodian and oversight role assignments | IT Security organizational chart | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Partial - automated management in place, formal key management plan missing |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal Key Management Plan document | Unclear procedures for key compromise response | Draft and approve Key Management Plan covering all key types and environments | Chris Magann | 2026-06-30 |
| On-premises certificate management is manual | Risk of expired certificates on DC environment | Evaluate ACME or equivalent automated certificate management for on-prem | Tigan Wang | 2026-07-31 |
| VPN CA certificate has 2-year validity with no interim rotation | Long certificate lifetime increases compromise window | Evaluate reducing VPN CA certificate validity or implementing intermediate CAs | Tigan Wang | 2026-06-30 |
