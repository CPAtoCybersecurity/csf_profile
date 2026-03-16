# PR.DS-02_Ex1: Enforce TLS and VPN for Data in Transit

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-08 (Transmission Confidentiality and Integrity), SC-12 (Cryptographic Key Establishment and Management), SC-13 (Cryptographic Protection)

## Implementation Example

> Use TLS for all web-based and API communications and VPN tunnels for remote network access to ensure confidentiality and integrity of data during transmission across untrusted networks.

## Alma Security Implementation

Alma Security enforces TLS 1.2 as the minimum transport encryption standard across all externally-facing services, with TLS 1.3 preferred where supported by client applications. The continuous authentication SaaS platform, Alma's core product, terminates TLS at the AWS Application Load Balancer layer with certificates managed through AWS Certificate Manager (ACM) configured for automatic renewal. HSTS (HTTP Strict Transport Security) headers are enforced on all web properties with a max-age of one year and includeSubDomains directive, preventing protocol downgrade attacks.

Internal service-to-service communication within the Kubernetes cluster uses mutual TLS (mTLS) configured through the service mesh. This ensures that east-west traffic between microservices, including API calls between the authentication engine, user management, and biometric processing services, is encrypted and authenticated. PostgreSQL database connections enforce SSL mode "verify-full," requiring both encryption and certificate verification for all client connections, preventing man-in-the-middle attacks at the database layer.

Remote employee access to corporate resources requires connection through a VPN using IKEv2 with AES-256 encryption and certificate-based authentication. The VPN gateway is deployed in AWS with multi-AZ redundancy. Split tunneling is disabled for all connections to internal resources handling sensitive data, ensuring that traffic to corporate systems always traverses the encrypted tunnel. Site-to-site VPN connects the AWS environment to the Redwood City on-premises Windows Domain Controller with IPsec encryption.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| TLS configuration on AWS ALB (minimum TLS 1.2 policy) | AWS ALB Console / Terraform | 2026-03-01 |
| ACM certificate inventory and auto-renewal status | AWS Certificate Manager | 2026-03-01 |
| HSTS header configuration on web properties | Web application configuration / SSL Labs scan | 2026-03-05 |
| Service mesh mTLS configuration | Kubernetes service mesh config / GitOps | 2026-02-20 |
| PostgreSQL SSL mode "verify-full" configuration | RDS parameter group | 2026-02-20 |
| VPN configuration (IKEv2, AES-256, cert-based auth) | VPN gateway configuration | 2026-02-15 |
| Site-to-site VPN IPsec configuration | AWS VPN Console | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 7 | On Track - TLS enforced externally and internally, VPN operational |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| TLS 1.3 not yet default on all endpoints | Missing performance and security benefits of latest protocol | Upgrade ALB security policy to TLS 1.3 default where client compatibility allows | Tigan Wang | 2026-06-30 |
| No automated TLS certificate expiration monitoring | Expired certificates could cause service outages | Deploy certificate monitoring with alerting 30/14/7 days before expiration | Tigan Wang | 2026-05-15 |
| VPN split tunnel exceptions not fully documented | Unclear which traffic bypasses encrypted tunnel | Audit and document all VPN split tunnel exceptions with business justification | Chris Magann | 2026-05-31 |
