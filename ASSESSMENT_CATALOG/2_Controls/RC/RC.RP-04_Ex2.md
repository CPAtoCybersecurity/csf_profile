# RC.RP-04_Ex2: System Owner Restoration Confirmation

**Subcategory:** RC.RP-04 — Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms

**NIST SP 800-53 Ref:** IR-01, IR-08, PM-08, PM-09, PM-11

## Implementation Example

> Ex2: Work with system owners to confirm the successful restoration of systems and the return to normal operations

## Alma Security Implementation

Engineering leadership and system owners participate in recovery confirmation through Slack coordination and direct communication channels. System owners verify that the continuous authentication service functions correctly after restoration by reviewing application health checks, Kubernetes pod status, and customer-facing metrics. Formal sign-off procedures for declaring systems restored are not yet documented but are being addressed in the DR plan development.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
