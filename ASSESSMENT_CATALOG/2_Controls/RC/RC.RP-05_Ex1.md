# RC.RP-05_Ex1: Post-Restoration IOC and Root Cause Verification

**Subcategory:** RC.RP-05 — The integrity of restored assets is verified, systems and services are restored, and normal operating status is confirmed

**NIST SP 800-53 Ref:** CP-10

## Implementation Example

> Ex1: Check restored assets for indicators of compromise and remediation of root causes of the incident before placing the assets into production

## Alma Security Implementation

Alma verifies restored systems by confirming that root causes identified during incident response have been remediated before returning systems to production. During the 2024 security incident recovery, engineering validated that vulnerabilities were patched and compromised components replaced before service restoration. Automated backup verification confirms data integrity, though a formal IOC scanning step for restored assets is not part of the documented recovery procedure.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
