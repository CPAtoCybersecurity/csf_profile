# PR.DS-11_Ex4: Store Backups at Off-Site Locations

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Store backup copies at geographically separate off-site locations to protect against site-level disasters, including natural disasters, facility failures, and regional outages, ensuring backup availability for recovery operations.

## Alma Security Implementation

Alma Security implements geographic backup distribution through AWS cross-region replication and off-site storage for on-premises backups. The primary AWS infrastructure operates in a multi-AZ deployment, providing availability zone-level redundancy for production data. For disaster recovery purposes, critical database backups (RDS snapshots) are replicated to a secondary AWS region using automated cross-region snapshot copy, ensuring that a complete regional AWS outage would not destroy all backup copies.

S3 buckets containing critical backup data are configured with cross-region replication (CRR) to a secondary region. The replication configuration includes encryption with a separate KMS key in the destination region, ensuring that backup copies maintain encryption protection independently from the source region's key infrastructure. Velero backup archives stored in S3 benefit from this same cross-region replication, extending geographic protection to Kubernetes application state backups.

On-premises Windows Domain Controller backups are replicated to the AWS environment via a scheduled secure transfer process, providing geographic separation from the Redwood City physical location. The DR plan currently in development through the Cloud Security Optimization project ($100K) will formalize the off-site backup strategy, define recovery procedures for region-level failover, and establish testing procedures for cross-region restoration. The project is also evaluating the use of AWS Backup as a centralized backup management service that would provide unified cross-region backup orchestration for RDS, S3, EBS, and other AWS resources.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| RDS cross-region snapshot copy configuration | AWS RDS Console | 2026-03-01 |
| S3 cross-region replication (CRR) configuration | AWS S3 Console | 2026-03-01 |
| Destination region KMS key for backup encryption | AWS KMS Console (secondary region) | 2026-03-01 |
| On-premises backup replication to AWS schedule and status | IT operations documentation | 2026-02-15 |
| Cloud Security Optimization project DR plan scope | Jira project CLOUDSEC-2026 | 2026-03-10 |
| AWS Backup evaluation status | Project documentation | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Partial - cross-region replication deployed, DR plan formalization in progress |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No documented cross-region recovery procedure | Cannot execute region-level failover without ad-hoc coordination | Document cross-region recovery runbook as part of DR plan | Tigan Wang | 2026-07-31 |
| Cross-region backup restoration not tested | Cannot validate cross-region backup integrity or recovery time | Include cross-region restore test in quarterly testing program | Tigan Wang | 2026-08-31 |
| On-premises backup replication relies on manual scheduled transfer | Transfer failures may not be detected promptly | Automate on-prem to AWS backup replication with failure alerting | Tigan Wang | 2026-06-30 |
