# PR.PS-04_Ex3: Monitor Logs for Anomalies and Security Events

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-06 (Audit Record Review, Analysis, and Reporting), SI-04 (System Monitoring), AU-13 (Monitoring for Information Disclosure)

## Implementation Example

> Continuously monitor collected logs for anomalies, indicators of compromise, and security-relevant events using automated detection rules, correlation logic, and alerting mechanisms.

## Alma Security Implementation

Alma monitors logs through GuardDuty (ML-based anomaly detection across CloudTrail, VPC Flow Logs, DNS, and EKS audit logs) and approximately 25 custom CloudWatch metric filters/alarms covering root account usage, IAM changes, sign-in failures, and security group modifications. Findings are aggregated in Security Hub with alerts routed to Slack and PagerDuty. No cross-source correlation rules exist, no SIEM is deployed for complex detection or retrospective hunting, and there is no proactive threat hunting program.

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
