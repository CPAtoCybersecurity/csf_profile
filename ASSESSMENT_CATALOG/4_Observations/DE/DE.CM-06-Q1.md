# DE.CM-06: External Service Provider Activity Monitoring — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed CloudTrail logs for third-party IAM role activity, external vendor VPN access logs, AWS service provider activity monitoring configuration |
| Interview | Yes | Interviewed Nadia Khan on third-party monitoring strategy; IT Manager on vendor remote access controls and logging |
| Test | Yes | Verified CloudTrail captures cross-account and third-party role assumption events; reviewed VPN logs for external vendor session activity over 30 days |

---

## Findings

Alma Security monitors external service provider activity primarily through CloudTrail logging of IAM role assumption events, which captures when third-party vendors or AWS service teams access Alma's AWS environment via cross-account roles. VPN access for on-premises remote administration by external vendors is logged through the Palo Alto firewall with session recording enabled for privileged activities.

Monitoring of cloud-based SaaS provider activities (ServiceNow, Workday, Slack) relies on each platform's native audit logging without centralized collection or correlation. AWS service provider activity (support access, service team actions) is visible through CloudTrail but not actively monitored with specific alerting rules. The organization does not have a comprehensive third-party activity monitoring program that covers all external service providers consistently.

### Strengths

- CloudTrail captures all third-party IAM role assumption events across AWS accounts
- VPN session logging for external vendor remote access through Palo Alto firewall
- Privileged activity session recording enabled for vendor remote administration
- Contract requirements specify logging and monitoring obligations for major vendors

### Gaps

- SaaS provider audit logs not centralized or correlated with infrastructure monitoring
- No specific alerting rules for AWS service provider access events
- Inconsistent monitoring coverage across different types of external service providers
- No automated baseline for expected third-party activity patterns

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

---

## Evidence Reviewed

- CloudTrail cross-account role assumption logs
- Palo Alto VPN session logs for external vendors (30 days)
- Vendor remote access authorization records
- SaaS platform native audit log configurations
- Third-party access agreements and monitoring requirements

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Centralize SaaS provider audit logs into SIEM for unified third-party activity monitoring | High | Nadia Khan |
| 2 | Create specific alerting rules for AWS service provider access and unusual third-party role assumptions | High | Nadia Khan |
| 3 | Establish expected activity baselines for each external service provider | Medium | Nadia Khan |
| 4 | Implement quarterly third-party access review with activity log analysis | Medium | Nadia Khan |
