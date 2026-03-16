# PR.DS-11_Ex1: Backup Critical Data

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Create regular backups of critical data including databases, application configurations, user data, and system state to support recovery from data loss, corruption, or security incidents.

## Alma Security Implementation

Alma maintains automated backups across its hybrid infrastructure: RDS PostgreSQL with daily snapshots (35-day retention) and continuous WAL archiving for point-in-time recovery, S3 versioning for application data, nightly Velero backups for Kubernetes persistent volumes (30-day retention), and daily Windows DC system state/DNS/GPO backups replicated off-site. Backup scope is governed by a data criticality matrix mapping systems to RTO/RPO-based frequency and retention requirements. Infrastructure configurations are version-controlled in a GitOps repository.

## Artifacts

- [Backup and Restore Procedure](../../Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../Artifacts/Reports/RPT-backup-restore-test.md)
- [Data Classification Policy](../../Artifacts/Policies/POL-data-classification.md)
