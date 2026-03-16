# PR.PS-04_Ex2: Centralize Log Collection and Aggregation

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-06 (Audit Record Review, Analysis, and Reporting), AU-12 (Audit Record Generation), SI-04 (System Monitoring)

## Implementation Example

> Aggregate logs from all relevant sources into a centralized log management platform that enables unified search, correlation, and analysis for security monitoring and incident investigation.

## Alma Security Implementation

Alma Security centralizes cloud infrastructure logs through AWS-native services. CloudTrail captures all API activity across AWS accounts and forwards logs to a dedicated S3 bucket with CloudWatch Logs integration for near-real-time analysis. VPC Flow Logs capture network traffic metadata and are stored in CloudWatch Logs. GuardDuty aggregates findings from CloudTrail, VPC Flow Logs, and DNS logs to generate security findings that are surfaced through Security Hub. EKS audit logs and container runtime logs (stdout/stderr) are collected by Fluent Bit daemonsets and forwarded to CloudWatch Logs.

The organization uses CloudWatch Logs Insights as the primary log query and analysis tool for cloud infrastructure. Security Hub serves as the centralized findings aggregation point, collecting alerts from GuardDuty, AWS Config, and Inspector. Security Hub findings above medium severity are forwarded to the #security-alerts Slack channel and generate PagerDuty incidents for critical findings.

However, Alma does not operate a traditional SIEM platform. The current architecture relies on AWS-native tools, which provide strong coverage for AWS resources but create gaps for non-AWS log sources. On-premises systems (Windows DC, legacy fileserver) forward Windows Event Logs to a local syslog server but these logs are not integrated into the CloudWatch-based analysis workflow. Application-level logs from the SaaS platform are collected in CloudWatch but lack security-specific correlation rules. There is no 24/7 SOC monitoring; the security team reviews alerts during business hours with an on-call rotation for critical PagerDuty incidents after hours.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| CloudTrail configuration (all accounts) | AWS Console | 2026-03-14 |
| VPC Flow Logs configuration | AWS VPC Console | 2026-03-14 |
| GuardDuty configuration and findings | AWS GuardDuty Console | 2026-03-14 |
| Security Hub aggregation dashboard | AWS Security Hub | 2026-03-14 |
| Fluent Bit daemonset configuration for EKS log collection | Kubernetes manifests / GitLab | 2026-03-10 |
| PagerDuty alert routing for critical Security Hub findings | PagerDuty configuration | 2026-03-01 |
| On-call rotation schedule | PagerDuty | 2026-03-14 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No centralized SIEM; reliance on AWS-native tools limits cross-platform correlation | High --- on-premises and application logs not correlated with cloud security events | Evaluate and implement SIEM solution (e.g., Splunk, Elastic Security, or AWS-native SIEM) | Nadia Khan | Q3 2026 |
| On-premises system logs not integrated into central analysis workflow | Medium --- Windows DC and fileserver events not visible for correlation | Forward on-premises syslog to centralized platform or SIEM when implemented | Chris Magann | Q3 2026 |
| No 24/7 SOC monitoring; business-hours coverage with on-call only | High --- delayed response to after-hours security events | Evaluate MDR service or establish 24/7 monitoring coverage | Nadia Khan | Q4 2026 |
