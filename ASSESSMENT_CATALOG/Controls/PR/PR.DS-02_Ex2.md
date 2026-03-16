# PR.DS-02_Ex2: Enforce Encryption Policies for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-08 (Transmission Confidentiality and Integrity), SC-13 (Cryptographic Protection)

## Implementation Example

> Establish and enforce encryption policies that define approved algorithms, minimum key lengths, and cipher suites for all data transmitted across networks, including internal and external communications.

## Alma Security Implementation

Alma Security maintains a transport encryption standard that defines approved cryptographic algorithms and cipher suites for all data in transit. The standard mandates AES-256-GCM as the preferred symmetric cipher, with AES-128-GCM as the minimum acceptable. RSA key exchange requires 2048-bit minimum key lengths, with ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) preferred for forward secrecy. Weak or deprecated algorithms (RC4, 3DES, MD5, SHA-1 for signatures) are explicitly prohibited and blocked at the infrastructure layer.

The encryption policy is enforced technically through AWS ALB security policies that restrict cipher suites to approved configurations. The TLS security policy (ELBSecurityPolicy-TLS13-1-2-2021-06 or equivalent) is applied across all load balancers, ensuring that clients cannot negotiate deprecated protocols or weak ciphers. Within the Kubernetes environment, the service mesh enforces cipher suite restrictions for internal mTLS connections, matching the external-facing standards. Regular SSL/TLS scans using automated tooling (SSL Labs API integration) validate that all public-facing endpoints conform to the encryption policy.

Policy compliance is monitored through AWS Config rules that detect non-compliant TLS configurations on load balancers, CloudFront distributions, and API Gateway endpoints. Non-compliant resources trigger automated alerts to the infrastructure team for remediation within a 48-hour SLA. Quarterly encryption compliance reports are generated summarizing the state of transport encryption across all environments, including any exceptions and their business justifications.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Transport encryption standard document | IT Security Policy repository | 2026-02-15 |
| AWS ALB security policy configuration | AWS ALB Console / Terraform | 2026-03-01 |
| SSL Labs scan results for public endpoints | Automated scan reports | 2026-03-05 |
| AWS Config rules for TLS compliance | AWS Config Console | 2026-03-01 |
| Service mesh cipher suite configuration | Kubernetes service mesh config | 2026-02-20 |
| Quarterly encryption compliance report | IT Security reporting | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 7 | On Track - policy defined and technically enforced, monitoring operational |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| On-premises Windows DC traffic encryption policy not formally documented | Inconsistent enforcement between cloud and on-prem | Extend transport encryption standard to explicitly cover on-prem AD traffic | Chris Magann | 2026-06-30 |
| Automated SSL scan coverage does not include internal-only endpoints | Internal service encryption gaps may go undetected | Extend automated TLS scanning to internal service mesh endpoints | Tigan Wang | 2026-06-30 |
