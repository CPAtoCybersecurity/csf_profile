# RC.RP-01_Ex1: Begin Recovery During or After Incident Response

**Subcategory:** RC.RP-01 — The recovery portion of the incident response plan is executed once initiated from the incident response process

**NIST SP 800-53 Ref:** CP-10, IR-04, IR-08

## Implementation Example

> Ex1: Begin recovery procedures during or after incident response processes

## Alma Security Implementation

Alma's incident response playbook includes defined handoff criteria for transitioning from containment to recovery operations. During the 2024 security incidents, recovery procedures were initiated following containment confirmation, leveraging AWS multi-AZ redundancy and Kubernetes pod recovery to restore the continuous authentication service. Quarterly restore testing exercises the recovery initiation process, though the DR plan under development will formalize the incident-to-recovery transition criteria.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
