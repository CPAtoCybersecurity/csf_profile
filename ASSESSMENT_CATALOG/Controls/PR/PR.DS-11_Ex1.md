# PR.DS-11_Ex1: Backup Critical Data

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Create regular backups of critical data including databases, application configurations, user data, and system state to support recovery from data loss, corruption, or security incidents.

## Alma Security Implementation

Alma Security maintains automated backup procedures for all critical data across its hybrid infrastructure. PostgreSQL databases running on AWS RDS are configured with automated daily backups with a 35-day retention period and continuous transaction log archiving enabling point-in-time recovery to any second within the retention window. These RDS backups are managed by AWS and execute during a defined maintenance window to minimize performance impact on the continuous authentication platform.

Application data stored in S3 is protected through S3 versioning, which maintains a complete history of all object versions and supports recovery from accidental deletions or overwrites. Critical application configurations and Kubernetes manifests are stored in a GitOps repository, providing version-controlled infrastructure-as-code that serves as both configuration documentation and a recovery mechanism. Kubernetes persistent volumes containing application state are backed up using a scheduled Velero backup job that runs nightly and retains backups for 30 days.

On-premises Windows Domain Controller backups include Active Directory system state backups, DNS zone data, and Group Policy Objects. These backups run daily and are stored both locally and replicated to an off-site location. The backup scope is defined by a data criticality matrix that maps each system and data store to backup frequency and retention requirements based on the system's RTO and RPO targets. The current backup coverage is comprehensive for production systems, though the data classification schema in progress will refine backup requirements by data sensitivity level.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS RDS automated backup configuration | AWS RDS Console | 2026-03-01 |
| RDS backup completion logs (last 30 days) | AWS RDS Console / CloudWatch | 2026-03-10 |
| S3 versioning configuration for production buckets | AWS S3 Console | 2026-03-01 |
| Velero backup job schedule and retention configuration | Kubernetes CronJob / Velero CLI | 2026-02-20 |
| GitOps repository for infrastructure configuration | Git repository | 2026-03-10 |
| Windows DC backup schedule and completion reports | Windows Server Backup logs | 2026-02-15 |
| Data criticality matrix defining backup requirements | IT operations documentation | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 7 | On Track - automated backups operational for all critical systems |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Backup scope not yet aligned to data classification schema | May not adequately address all data sensitivity levels | Update backup policy to reference data classification schema once complete | Chris Magann | 2026-07-31 |
| Velero backup does not cover all Kubernetes namespaces | Some non-production workloads may lack backup coverage | Expand Velero backup scope to include all namespaces with persistent data | Tigan Wang | 2026-05-31 |
| No automated backup failure alerting workflow | Backup failures may not be detected promptly | Implement automated alerting for backup job failures with escalation SLA | Tigan Wang | 2026-05-15 |
