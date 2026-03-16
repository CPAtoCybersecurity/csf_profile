# RC.RP-04_Ex3: Restored System Performance Monitoring

**Subcategory:** RC.RP-04 — Critical mission functions and cybersecurity risk management are considered to establish post-incident operational norms

**NIST SP 800-53 Ref:** IR-01, IR-08, PM-08, PM-09, PM-11

## Implementation Example

> Ex3: Monitor the performance of restored systems to verify the adequacy of the restoration

## Alma Security Implementation

Alma monitors restored systems through Kubernetes health checks, AWS CloudWatch metrics, and application-level monitoring to verify restoration adequacy. KPI tracking, including the public trust score, resumes after recovery to measure broader organizational recovery. Following the 2024 security incidents, enhanced monitoring was applied during the post-recovery stabilization period, though a formal post-restoration monitoring enhancement procedure is not documented.

## Artifacts

- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
