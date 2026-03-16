# PR.PS-01_Ex3: Automate Configuration Compliance Checks

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-06 (Configuration Settings), CM-11 (User-Installed Software), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Use automated mechanisms to detect misconfigurations and unauthorized changes, and alert responsible personnel for timely remediation.

## Alma Security Implementation

Alma uses AWS Config with 47 rules to continuously evaluate resource configurations against CIS-derived baselines, with a multi-tier alerting system routing critical deviations to PagerDuty, high-severity to Slack/#infra-alerts with ServiceNow tickets, and lower-severity to weekly digests. Automated remediation via Config auto-remediation rules and Lambda covers approximately 30% of rules (e.g., public S3 buckets, unencrypted EBS). On-premises Windows DC and Kubernetes pod-level configurations are not covered by AWS Config monitoring.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS Config rules inventory with compliance status | AWS Config Console | 2026-03-14 |
| PagerDuty alert routing configuration for Config violations | PagerDuty service configuration | 2026-03-01 |
| Slack #infra-alerts notification samples | Slack channel history | 2026-03-14 |
| Auto-remediation Lambda function code and execution logs | AWS Lambda + CloudWatch Logs | 2026-03-10 |
| Weekly compliance digest report (sample) | Infrastructure team Confluence | 2026-03-11 |
| ServiceNow auto-created tickets from Config violations | ServiceNow | 2026-03-12 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Auto-remediation covers only 30% of config rules | Medium --- manual remediation creates delays for non-critical items | Expand auto-remediation to cover top 20 additional high-frequency violations | Tigan Wang | Q2 2026 |
| On-premises Windows DC not covered by AWS Config monitoring | High --- configuration drift on Windows servers goes undetected | Implement equivalent compliance monitoring for Windows DC (e.g., DSC, SCAP) | Chris Magann | Q3 2026 |
| Kubernetes pod-level configurations not fully covered by AWS Config | Medium --- workload misconfigurations may escape detection | Deploy OPA Gatekeeper or Kyverno for Kubernetes-native policy enforcement | Tigan Wang | Q2 2026 |
