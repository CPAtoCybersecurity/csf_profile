# PR.PS-04_Ex2: Centralize Log Collection and Aggregation

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-06 (Audit Record Review, Analysis, and Reporting), AU-12 (Audit Record Generation), SI-04 (System Monitoring)

## Implementation Example

> Aggregate logs from all relevant sources into a centralized log management platform that enables unified search, correlation, and analysis for security monitoring and incident investigation.

## Alma Security Implementation

Alma centralizes cloud logs through CloudTrail, VPC Flow Logs, GuardDuty, and Fluent Bit (EKS), with Security Hub aggregating findings and routing medium+ severity alerts to Slack and PagerDuty. CloudWatch Logs Insights serves as the primary query and analysis tool. No traditional SIEM is deployed -- on-premises systems forward to a local syslog server not integrated with CloudWatch, and there is no 24/7 SOC monitoring (business-hours coverage with on-call for critical incidents).

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
