# PR.DS-02_Ex4: Manage Encryption Keys for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Implement key management practices for encryption keys used to protect data in transit, including secure key generation, distribution, storage, rotation, and revocation for TLS certificates, VPN keys, and session encryption keys.

## Alma Security Implementation

Alma Security manages encryption keys for data-in-transit protection through AWS Certificate Manager (ACM) for TLS certificates and AWS Key Management Service (KMS) for VPN and service mesh encryption keys. ACM provides automated certificate lifecycle management for all public-facing TLS certificates, handling issuance, renewal (automatic renewal 60 days before expiration), and deployment to ALBs and CloudFront distributions. This eliminates the operational risk of manual certificate management and forgotten renewals.

For the Kubernetes service mesh, internal mTLS certificates are managed by the mesh's built-in certificate authority with automated rotation on a configurable schedule (currently set to 24-hour certificate lifetimes with automatic re-issuance). This short certificate lifetime minimizes the impact window if an internal certificate is compromised. VPN authentication certificates are managed through a private Certificate Authority with a 2-year validity period, with revocation lists published to the VPN gateway for immediate effect on compromised or decommissioned certificates.

The key management governance structure assigns the infrastructure team as key custodians with the security team providing oversight. KMS key usage is logged through AWS CloudTrail, providing an audit trail of all cryptographic operations. Key access policies follow least privilege, with separate IAM roles for key administration versus key usage. The current gap is the absence of a documented Key Management Plan that formalizes all key types, rotation schedules, custodianship, and incident response procedures for key compromise across both cloud and on-premises environments.

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
