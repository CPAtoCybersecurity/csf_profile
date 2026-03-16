# PR.DS-02_Ex3: Block Unencrypted Connections

**Subcategory:** PR.DS-02 -- The confidentiality, integrity, and availability of data-in-transit are protected

**NIST SP 800-53 Ref:** SC-08 (Transmission Confidentiality and Integrity), SC-23 (Session Authenticity)

## Implementation Example

> Configure network infrastructure to block or reject unencrypted connections (HTTP, FTP, Telnet, unencrypted SMTP) and enforce automatic redirection to encrypted alternatives where applicable.

## Alma Security Implementation

Alma enforces encrypted-only connections through ALB HTTP-to-HTTPS 301 redirects, Security Groups blocking plaintext protocols (FTP, Telnet, unencrypted SMTP), and Kubernetes network policies restricting pods to encrypted communication paths. S3 bucket policies enforce the aws:SecureTransport condition, and RDS instances reject non-SSL connections via rds.force_ssl. VPC Flow Logs and CloudWatch monitor for plaintext protocol connection attempts.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| ALB HTTP-to-HTTPS redirect configuration | AWS ALB Console / Terraform | 2026-03-01 |
| Security Group rules blocking plaintext protocols | AWS EC2 Security Groups | 2026-03-01 |
| Kubernetes network policies for encrypted-only traffic | GitOps repository / kubectl | 2026-02-20 |
| S3 bucket policy with SecureTransport condition | AWS S3 Console | 2026-03-10 |
| PostgreSQL rds.force_ssl parameter configuration | RDS parameter group | 2026-02-20 |
| VPC Flow Log monitoring for plaintext protocol attempts | CloudWatch / SIEM | 2026-03-05 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track - plaintext blocking enforced on production, monitoring active |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Development/staging environments may allow plaintext for debugging | Inconsistent security posture across environments | Enforce encrypted-only policy in dev/staging with documented exceptions only | Chris Magann | 2026-05-31 |
| SecureTransport condition not yet applied to all S3 buckets | Some buckets may accept unencrypted API calls | Complete S3 Bucket Security project bucket policy rollout | Chris Magann | 2026-06-30 |
| On-premises network does not centrally block plaintext protocols | Potential for unencrypted internal traffic on legacy systems | Audit on-prem firewall rules and block plaintext protocols with documented exceptions | Tigan Wang | 2026-06-30 |
