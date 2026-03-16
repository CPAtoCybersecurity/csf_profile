# PR.PS-01_Ex3: Automate Configuration Compliance Checks

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-06 (Configuration Settings), CM-11 (User-Installed Software), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Use automated mechanisms to detect misconfigurations and unauthorized changes, and alert responsible personnel for timely remediation.

## Alma Security Implementation

Alma Security employs AWS Config as the primary automated configuration compliance monitoring tool across all AWS accounts. AWS Config continuously evaluates resource configurations against 47 custom and managed rules that map to the organization's CIS Benchmark-derived baselines. Rules cover security group configurations, IAM policy compliance, S3 bucket access settings, encryption-at-rest enforcement, EKS cluster security configurations, and VPC networking standards. Compliance evaluation occurs in near-real-time as configuration changes are detected.

Non-compliant resource detections trigger automated alerting through a multi-tier notification system. Critical deviations (e.g., security group opened to 0.0.0.0/0, encryption disabled on production resource) generate PagerDuty incidents routed to the on-call infrastructure engineer. High-severity deviations trigger Slack notifications to the #infra-alerts channel with automated ServiceNow ticket creation. Medium and low deviations are aggregated into a weekly compliance digest reviewed in the infrastructure team standup. The compliance dashboard is accessible to the security and infrastructure teams and is reviewed in weekly operations meetings.

Automated remediation is implemented for a subset of critical misconfigurations using AWS Config auto-remediation rules and Lambda functions. For example, publicly accessible S3 buckets are automatically set to private, and unencrypted EBS volumes trigger automatic encryption workflows. However, automated remediation coverage is limited to approximately 30% of config rules; the remainder requires manual investigation and remediation. The team is expanding auto-remediation coverage as part of the Q2 2026 roadmap.

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
