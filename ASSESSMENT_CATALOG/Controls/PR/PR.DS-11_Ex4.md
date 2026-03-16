# PR.DS-11_Ex4: Store Backups at Off-Site Locations

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Store backup copies at geographically separate off-site locations to protect against site-level disasters, including natural disasters, facility failures, and regional outages, ensuring backup availability for recovery operations.

## Alma Security Implementation

Alma stores backup copies in geographically separate locations via AWS cross-region replication for RDS snapshots and S3 backup buckets (encrypted with a separate destination-region KMS key), with Velero archives benefiting from the same CRR configuration. On-premises DC backups are replicated to AWS via scheduled secure transfer, providing geographic separation from the Redwood City facility. The Cloud Security Optimization project ($100K) is formalizing the off-site strategy with cross-region failover procedures and evaluating AWS Backup for unified orchestration.

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
