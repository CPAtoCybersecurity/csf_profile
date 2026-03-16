# DE.AE-06 Ex2: On-Demand Access to Log Analysis Findings

**Subcategory:** DE.AE-06 — Information on adverse events is provided to authorized staff and tools

**NIST SP 800-53 Ref:** IR-04, PM-15, PM-16, RA-04, RA-10

## Implementation Example

> Incident responders and other authorized personnel can access log analysis findings at all times

## Alma Security Implementation

Authorized SOC analysts and incident responders have continuous access to the GuardDuty console, SentinelOne management portal, and CloudWatch Logs Insights for on-demand log querying. VPC Flow Log data is queryable through Athena against the centralized S3 log bucket. Access is controlled via AWS IAM roles scoped to security operations and SentinelOne RBAC assignments managed by Nadia Khan's team.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
