# PR.DS-02_Ex3: Block Unencrypted Connections

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-08 (Transmission Confidentiality and Integrity), SC-23 (Session Authenticity)

## Implementation Example

> Configure network infrastructure to block or reject unencrypted connections (HTTP, FTP, Telnet, unencrypted SMTP) and enforce automatic redirection to encrypted alternatives where applicable.

## Alma Security Implementation

Alma enforces encrypted-only connections through ALB HTTP-to-HTTPS 301 redirects, Security Groups blocking plaintext protocols (FTP, Telnet, unencrypted SMTP), and Kubernetes network policies restricting pods to encrypted communication paths. S3 bucket policies enforce the aws:SecureTransport condition, and RDS instances reject non-SSL connections via rds.force_ssl. VPC Flow Logs and CloudWatch monitor for plaintext protocol connection attempts.

## Artifacts

- [Encryption Standards Policy](../../Artifacts/Policies/POL-encryption-standards.md)
- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
