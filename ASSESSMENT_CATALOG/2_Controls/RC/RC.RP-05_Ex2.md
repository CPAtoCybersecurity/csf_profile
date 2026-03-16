# RC.RP-05_Ex2: Restoration Correctness Verification

**Subcategory:** RC.RP-05 — The integrity of restored assets is verified, systems and services are restored, and normal operating status is confirmed

**NIST SP 800-53 Ref:** CP-10

## Implementation Example

> Ex2: Verify the correctness and adequacy of the restoration actions taken before putting a restored asset back into production

## Alma Security Implementation

Alma validates restoration correctness through quarterly restore tests that verify PostgreSQL data integrity and application functionality in isolated environments before production deployment. Kubernetes pod health checks and AWS resource monitoring confirm that restored infrastructure operates within expected parameters. The backup and restore procedure defines verification steps, though end-to-end functional testing of the continuous authentication service after restoration is not fully automated.

## Artifacts

- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
