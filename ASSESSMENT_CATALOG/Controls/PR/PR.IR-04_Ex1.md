# PR.IR-04_Ex1: Capacity Planning

**Subcategory:** PR.IR-04 — Adequate resource capacity to ensure availability is maintained

**NIST SP 800-53 Ref:** AU-04, CP-02, PE-11, SC-05

## Implementation Example

> Ex1: Capacity planning is performed to ensure that technology resources can meet current and projected demand, preventing availability degradation due to resource exhaustion.

## Alma Security Implementation

Alma uses Kubernetes Horizontal Pod Autoscalers and AWS node auto-scaling to manage cloud capacity reactively based on CPU/memory thresholds. No formal capacity planning process exists to project future requirements from business growth, roadmap changes, or seasonal patterns. On-premises capacity at the Redwood City data center is not formally documented, and log storage capacity has not been assessed against retention requirements.

## Artifacts

- [Backup and Restore Procedure](../../Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../Artifacts/Reports/RPT-backup-restore-test.md)
- [Physical Security Policy](../../Artifacts/Policies/POL-physical-security.md)
- [Incident Response Playbook](../../Artifacts/Procedures/PROC-incident-response-playbook.md)
