# PR.IR-03_Ex1: Redundancy and Failover

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-06, CP-07, CP-08, CP-09, CP-10, IR-04, SA-08, SC-06, SC-24

## Implementation Example

> Ex1: Redundancy and failover mechanisms are used for critical technology assets to ensure continuity of service when primary components fail.

## Alma Security Implementation

Alma deploys its production SaaS platform on AWS using a multi-AZ Kubernetes cluster with replica sets, auto-scaling, and load balancers that route around failed instances. Failover testing has been completed to validate resilience. Failover test results lack formal documentation (scenarios, criteria, recovery times), and no recurring testing cadence is defined.

## Artifacts

- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
