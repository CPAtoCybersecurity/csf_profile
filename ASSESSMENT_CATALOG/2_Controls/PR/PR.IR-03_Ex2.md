# PR.IR-03_Ex2: Disaster Recovery Planning and Testing

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-04, CP-06, CP-07, CP-09, CP-10, IR-04

## Implementation Example

> Ex2: Disaster recovery plans are developed, maintained, and periodically tested to ensure that technology infrastructure and services can be restored within defined recovery objectives following a disruptive event.

## Alma Security Implementation

Alma's disaster recovery plan is in development as part of the Cloud Security Optimization project ($100K budget). As of Q1 2026, no formal approved DR plan exists -- RTO/RPO have not been defined, and backup alignment with recovery objectives is unverified. Multi-AZ architecture and Kubernetes redundancy provide component-level resilience, but no documented strategy covers region-level outages, ransomware, or full data center loss.

## Artifacts

- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
