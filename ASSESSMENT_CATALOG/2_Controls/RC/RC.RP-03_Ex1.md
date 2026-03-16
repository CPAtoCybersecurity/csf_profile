# RC.RP-03_Ex1: Backup Integrity Verification Before Restoration

**Subcategory:** RC.RP-03 — The integrity of backups and other restoration assets is verified before using them for restoration

**NIST SP 800-53 Ref:** CP-02, CP-04, CP-09

## Implementation Example

> Ex1: Check restoration assets for indicators of compromise, file corruption, and other integrity issues

## Alma Security Implementation

Alma runs automated backup verification against PostgreSQL backups to confirm integrity before restoration is attempted. Quarterly restore tests include validation of backup completeness and data consistency in an isolated environment. Backup verification checks for corruption but does not currently include explicit IOC scanning of backup assets. AWS-managed backup encryption provides tamper protection at the storage layer.

## Artifacts

- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
