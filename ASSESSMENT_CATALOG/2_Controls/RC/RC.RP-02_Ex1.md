# RC.RP-02_Ex1: Criteria-Based Recovery Action Selection

**Subcategory:** RC.RP-02 — Recovery actions are selected, scoped, prioritized, and performed

**NIST SP 800-53 Ref:** CP-10, IR-04, IR-08

## Implementation Example

> Ex1: Select recovery actions based on the criteria defined in the incident response plan and available resources

## Alma Security Implementation

Alma selects recovery actions based on incident severity, impacted systems, and available infrastructure resources as defined in the incident response playbook. The continuous authentication SaaS platform is prioritized as the primary recovery target. Recovery leverages PostgreSQL automated backups, AWS multi-AZ failover, and Kubernetes pod redeployment based on the nature and scope of the disruption. Quarterly restore tests validate the execution of these recovery actions.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
