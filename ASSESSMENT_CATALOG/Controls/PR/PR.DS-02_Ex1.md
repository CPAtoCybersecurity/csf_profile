# PR.DS-02_Ex1: Enforce TLS and VPN for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-08 (Transmission Confidentiality and Integrity), SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Use TLS for all web-based and API communications and VPN tunnels for remote network access to ensure confidentiality and integrity of data during transmission across untrusted networks.

## Alma Security Implementation

Alma enforces TLS 1.2 minimum (TLS 1.3 preferred) on all external services via AWS ALB with ACM-managed certificates and HSTS headers. Internal Kubernetes service-to-service traffic uses mTLS through the service mesh, and PostgreSQL connections require SSL mode "verify-full." Remote access uses IKEv2 VPN with AES-256 encryption and certificate-based authentication, with site-to-site IPsec VPN connecting AWS to the on-premises DC.

## Artifacts

- [Encryption Standards Policy](../../Artifacts/Policies/POL-encryption-standards.md)
- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
