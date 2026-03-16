# PR.DS-11_Ex1: Backup Critical Data

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Create regular backups of critical data including databases, application configurations, user data, and system state to support recovery from data loss, corruption, or security incidents.

## Alma Security Implementation

Alma maintains automated backups across its hybrid infrastructure: RDS PostgreSQL with daily snapshots (35-day retention) and continuous WAL archiving for point-in-time recovery, S3 versioning for application data, nightly Velero backups for Kubernetes persistent volumes (30-day retention), and daily Windows DC system state/DNS/GPO backups replicated off-site. Backup scope is governed by a data criticality matrix mapping systems to RTO/RPO-based frequency and retention requirements. Infrastructure configurations are version-controlled in a GitOps repository.

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
