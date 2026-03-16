# PR.PS-04_Ex3: Monitor Logs for Anomalies and Security Events

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-06 (Audit Record Review, Analysis, and Reporting), SI-04 (System Monitoring), AU-13 (Monitoring for Information Disclosure)

## Implementation Example

> Continuously monitor collected logs for anomalies, indicators of compromise, and security-relevant events using automated detection rules, correlation logic, and alerting mechanisms.

## Alma Security Implementation

Alma monitors logs through GuardDuty (ML-based anomaly detection across CloudTrail, VPC Flow Logs, DNS, and EKS audit logs) and approximately 25 custom CloudWatch metric filters/alarms covering root account usage, IAM changes, sign-in failures, and security group modifications. Findings are aggregated in Security Hub with alerts routed to Slack and PagerDuty. No cross-source correlation rules exist, no SIEM is deployed for complex detection or retrospective hunting, and there is no proactive threat hunting program.

## Artifacts

- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Incident Response Playbook](../../Artifacts/Procedures/PROC-incident-response-playbook.md)
- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
