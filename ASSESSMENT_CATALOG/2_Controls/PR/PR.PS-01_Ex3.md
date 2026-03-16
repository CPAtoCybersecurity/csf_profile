# PR.PS-01_Ex3: Automate Configuration Compliance Checks

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-06 (Configuration Settings), CM-11 (User-Installed Software), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Use automated mechanisms to detect misconfigurations and unauthorized changes, and alert responsible personnel for timely remediation.

## Alma Security Implementation

Alma uses AWS Config with 47 rules to continuously evaluate resource configurations against CIS-derived baselines, with a multi-tier alerting system routing critical deviations to PagerDuty, high-severity to Slack/#infra-alerts with ServiceNow tickets, and lower-severity to weekly digests. Automated remediation via Config auto-remediation rules and Lambda covers approximately 30% of rules (e.g., public S3 buckets, unencrypted EBS). On-premises Windows DC and Kubernetes pod-level configurations are not covered by AWS Config monitoring.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
