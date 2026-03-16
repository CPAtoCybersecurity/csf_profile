# PR.DS-01_Ex5: Use Secure Storage Solutions

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-13 (Cryptographic Protection)

## Implementation Example

> Use secure, hardened storage solutions with built-in encryption, access controls, redundancy, and tamper protection to safeguard data at rest throughout its lifecycle.

## Alma Security Implementation

Alma's storage infrastructure uses AWS RDS PostgreSQL (Multi-AZ, KMS-encrypted), S3 with SSE-KMS encryption and versioning, Kubernetes EBS volumes with KMS encryption, and BitLocker-encrypted on-premises DC storage with RAID redundancy. The S3 Bucket Security project ($70K) is hardening all buckets with Block Public Access, Access Analyzer, Object Lock for compliance data, and SecureTransport enforcement. Centralized storage security monitoring across cloud and on-premises environments remains a gap being addressed.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS RDS PostgreSQL Multi-AZ and encryption configuration | AWS RDS Console | 2026-03-01 |
| S3 Account-level Block Public Access configuration | AWS S3 Console / AWS Organizations | 2026-03-01 |
| S3 Access Analyzer findings and remediation status | AWS IAM Access Analyzer | 2026-03-10 |
| S3 Object Lock configuration for compliance buckets | AWS S3 Console | 2026-03-10 |
| S3 Bucket Security project hardening checklist | Jira project S3SEC-2026 | 2026-03-10 |
| BitLocker and RAID configuration for on-premises storage | Server hardware documentation | 2026-02-15 |
| Kubernetes etcd encryption configuration | Cluster configuration / GitOps | 2026-02-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 6 | In Progress - AWS managed services provide baseline, hardening project underway |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No centralized storage security dashboard across cloud and on-prem | Limited cross-environment visibility into storage posture | Implement unified storage security monitoring via AWS Security Hub + on-prem integration | Tigan Wang | 2026-07-31 |
| S3 bucket hardening project only 40% complete | Some buckets may have inconsistent security configurations | Complete S3 Bucket Security project hardening for all buckets | Chris Magann | 2026-06-30 |
| Data classification labels not yet applied to all storage resources | Cannot automate policy enforcement by sensitivity level | Complete data classification schema and tag all storage resources | Chris Magann | 2026-06-30 |
