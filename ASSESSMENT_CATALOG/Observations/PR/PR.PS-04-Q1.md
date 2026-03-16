# PR.PS-04: Log Record Generation and Monitoring - Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed logging policy, CloudTrail configuration, VPC Flow Logs, GuardDuty findings, Security Hub dashboard, CloudWatch alarms, and Fluent Bit EKS log collection configuration |
| Interview | Yes | Interviewed Nadia Khan (logging/monitoring owner) on monitoring coverage, alert routing, and SIEM strategy |
| Test | Yes | Verified log collection from 10 source types; reviewed 8 recent GuardDuty findings and response actions; tested CloudWatch alarm trigger for IAM policy change |

---

## Findings

### Strengths

- CloudTrail enabled across all AWS accounts capturing API activity with 12-month online retention and 24-month archival
- VPC Flow Logs and GuardDuty provide network and threat detection coverage for AWS infrastructure
- EKS audit logs collected via Fluent Bit daemonsets and forwarded to CloudWatch Logs
- GuardDuty findings aggregated through Security Hub with PagerDuty routing for critical findings
- 25 custom CloudWatch metric filters and alarms monitor high-value events (root account usage, IAM changes, security group modifications, S3 policy changes)
- Logging and Monitoring Policy defines event categories, retention periods, and responsibilities

### Gaps

- No centralized SIEM platform; reliance on AWS-native tools (CloudWatch, GuardDuty, Security Hub) limits cross-platform log correlation
- On-premises systems (Windows DC, legacy fileserver) forward to local syslog server but are not integrated into the CloudWatch-based monitoring workflow
- No 24/7 SOC monitoring; security team operates during business hours with PagerDuty on-call for critical alerts only
- No cross-source correlation capability (e.g., correlating failed auth attempts with subsequent access from different IP)
- Application-layer security logging is limited to error rates and latency; no behavioral analysis or business logic abuse detection
- Logging policy lacks platform-specific configuration standards (specific Windows Event IDs, Linux auditd rules, K8s audit policy levels)
- No proactive threat hunting program; detection is entirely alert-driven

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

---

## Evidence Reviewed

- Logging and Monitoring Policy (Confluence)
- CloudTrail configuration across all AWS accounts
- VPC Flow Logs configuration and sample data
- GuardDuty configuration, suppression rules, and 8 recent findings with response actions
- Security Hub aggregation dashboard and alert routing configuration
- Fluent Bit daemonset configuration for EKS log collection (GitLab)
- CloudWatch metric filters and alarms inventory (25 custom rules)
- PagerDuty on-call rotation and alert routing configuration
- On-premises syslog server configuration

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Evaluate and implement a centralized SIEM with cross-source correlation capability | High | Nadia Khan |
| 2 | Integrate on-premises system logs into the centralized monitoring platform | High | Chris Magann |
| 3 | Establish 24/7 monitoring coverage through MDR service or SOC expansion | High | Nadia Khan |
| 4 | Develop platform-specific logging configuration standards (Windows Event IDs, auditd rules, K8s audit policy) | Medium | Nadia Khan |
| 5 | Define application-layer security logging requirements and integrate into development standards | Medium | Nadia Khan |
| 6 | Initiate quarterly threat hunting exercises using existing CloudWatch Logs Insights | Medium | Nadia Khan |
