# PR.DS-02_Ex2: Enforce Encryption Policies for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-08 (Transmission Confidentiality and Integrity), SC-13 (Cryptographic Protection)

## Implementation Example

> Establish and enforce encryption policies that define approved algorithms, minimum key lengths, and cipher suites for all data transmitted across networks, including internal and external communications.

## Alma Security Implementation

Alma maintains a transport encryption standard mandating AES-256-GCM (AES-128-GCM minimum), ECDHE for forward secrecy, and 2048-bit minimum RSA keys, with deprecated algorithms (RC4, 3DES, MD5, SHA-1) explicitly blocked. AWS ALB security policies and Kubernetes service mesh enforce approved cipher suites, validated by automated SSL Labs scans. AWS Config rules monitor TLS compliance across ALBs, CloudFront, and API Gateway with 48-hour remediation SLA and quarterly compliance reporting.

## Artifacts

- [Encryption Standards Policy](../../Artifacts/Policies/POL-encryption-standards.md)
- [Data Classification Policy](../../Artifacts/Policies/POL-data-classification.md)
- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
