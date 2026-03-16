# PR.PS-04_Ex3: Monitor Logs for Anomalies and Security Events

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-06 (Audit Record Review, Analysis, and Reporting), SI-04 (System Monitoring), AU-13 (Monitoring for Information Disclosure)

## Implementation Example

> Continuously monitor collected logs for anomalies, indicators of compromise, and security-relevant events using automated detection rules, correlation logic, and alerting mechanisms.

## Alma Security Implementation

Alma Security's primary log monitoring capability is delivered through AWS GuardDuty, which applies machine learning models and threat intelligence feeds to detect anomalous and malicious activity across CloudTrail, VPC Flow Logs, DNS logs, and EKS audit logs. GuardDuty generates findings categorized by severity (low, medium, high) that are aggregated into AWS Security Hub. The security team has tuned GuardDuty by suppressing known false positive patterns (e.g., authorized vulnerability scanner activity, approved penetration testing IP ranges) to improve signal-to-noise ratio.

Additional monitoring is configured through CloudWatch Alarms and CloudWatch Logs Metric Filters for specific high-value events. Custom metric filters are configured to detect root account usage, IAM policy changes, console sign-in failures exceeding 5 attempts, security group modifications, and S3 bucket policy changes. These metric filters trigger CloudWatch Alarms that route to SNS topics feeding both Slack notifications and PagerDuty. The infrastructure team maintains approximately 25 custom CloudWatch monitoring rules.

The monitoring coverage has meaningful gaps. There are no correlation rules that combine events across multiple log sources (e.g., correlating a failed authentication attempt with subsequent successful access from a different IP). Application-layer monitoring for the SaaS platform is limited to error rate and latency metrics without security-specific behavioral analysis. The absence of a SIEM limits the ability to create complex detection rules, run retrospective hunts, and maintain detection-as-code. Monitoring operates during business hours with PagerDuty on-call for critical alerts, but there is no proactive threat hunting program.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| GuardDuty configuration and suppression rules | AWS GuardDuty Console | 2026-03-14 |
| Security Hub findings dashboard | AWS Security Hub | 2026-03-14 |
| CloudWatch custom metric filters and alarms (25 rules) | AWS CloudWatch Console | 2026-03-14 |
| Slack and PagerDuty alert routing configuration | SNS / PagerDuty | 2026-03-01 |
| Sample GuardDuty findings and response actions (5-10 examples) | Security Hub + Jira tickets | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No cross-source log correlation capability | High --- multi-stage attacks may not be detected through single-source monitoring | Implement SIEM with correlation engine for cross-source detection | Nadia Khan | Q3 2026 |
| No proactive threat hunting program | Medium --- reliance on automated detection misses novel or low-and-slow attacks | Establish quarterly threat hunting exercises using CloudWatch Logs Insights | Nadia Khan | Q3 2026 |
| Application-layer security monitoring not implemented | Medium --- business logic abuse and application-level attacks not monitored | Define application security monitoring use cases and integrate into monitoring platform | Nadia Khan | Q3 2026 |
