# PR.DS-01_Ex5: Use Secure Storage Solutions

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SC-28 (Protection of Information at Rest), SC-13 (Cryptographic Protection)

## Implementation Example

> Use secure, hardened storage solutions with built-in encryption, access controls, redundancy, and tamper protection to safeguard data at rest throughout its lifecycle.

## Alma Security Implementation

Alma Security's storage infrastructure is built on AWS managed services and hardened on-premises systems designed to provide defense-in-depth for data at rest. The primary production data resides in AWS RDS PostgreSQL instances configured with Multi-AZ deployment for high availability, encryption at rest via AWS KMS, and automated backups with point-in-time recovery. Application data and artifacts are stored in S3 buckets configured with SSE-KMS encryption, versioning, and lifecycle policies that govern data retention and secure deletion.

The S3 Bucket Security project ($70K) is systematically hardening all S3 buckets to a baseline security configuration. This includes enabling S3 Block Public Access at the account level, deploying S3 Access Analyzer to detect overly permissive bucket policies, enabling S3 Object Lock on buckets storing compliance-critical data to provide WORM (Write Once Read Many) protection, and enforcing bucket policies that require encryption in transit (aws:SecureTransport condition). Each bucket is being tagged with data classification labels to enable automated policy enforcement based on sensitivity level.

On-premises storage for the Windows Domain Controller environment uses enterprise-grade hardware with RAID redundancy and BitLocker encryption. Physical access to server rooms is controlled through badge access and monitored by security cameras. Kubernetes persistent volumes leverage AWS EBS gp3 volumes with KMS encryption, and the cluster's etcd datastore is encrypted at rest using the KMS envelope encryption provider. The combination of AWS managed security features and Alma's configuration hardening provides a layered storage security posture, though centralized storage security monitoring and compliance reporting across both cloud and on-premises environments remains a gap being addressed.

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
