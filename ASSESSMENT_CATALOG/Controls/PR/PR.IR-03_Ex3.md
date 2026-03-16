# PR.IR-03_Ex3: High-Availability Components

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-07, SA-08, SC-06, SC-24

## Implementation Example

> Ex3: High-availability components and architectures are used for critical systems to minimize downtime and ensure continuous service delivery during normal operations and adverse conditions.

## Alma Security Implementation

Alma runs a multi-AZ Kubernetes cluster with pod replica sets, auto-scaling, health checks, readiness probes, and ALB traffic distribution across healthy targets. Redundant storage and compute are provisioned for critical systems, and failover testing has validated the architecture. SLA/SLO targets for availability are not formally documented, availability metrics are not reported to business stakeholders, and on-premises HA does not match cloud resilience levels.

## Artifacts

- [Backup and Restore Procedure](../../Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../Artifacts/Reports/RPT-backup-restore-test.md)
- [Physical Security Policy](../../Artifacts/Policies/POL-physical-security.md)
