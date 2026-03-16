# DE.AE-06: Adverse Event Information Distribution — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed GuardDuty notification routing, Slack #security-alerts channel history, ServiceNow alert-to-ticket automation, SOC on-call rotation schedule |
| Interview | Yes | Interviewed Nadia Khan on alert distribution workflow and escalation paths; SOC analyst on alert triage and notification procedures |
| Test | Yes | Validated GuardDuty finding notification delivery to Slack and ServiceNow; tested on-call paging for high-severity findings; verified authorized personnel access to GuardDuty console |

---

## Findings

Alma Security distributes adverse event information through multiple channels. GuardDuty findings route to the Slack #security-alerts channel via SNS/Lambda integration, providing near-real-time visibility to the SOC team and authorized security personnel. High and critical severity findings trigger automatic ServiceNow ticket creation with assignment to the on-call responder. The SOC team has console access to GuardDuty, SentinelOne, and CloudTrail for direct log analysis.

The Slack-based notification system provides effective distribution during business hours when the team is actively monitoring. After-hours notification relies on the on-call rotation with PagerDuty integration for high-severity events. Medium and low severity findings accumulate in Slack and ServiceNow queues for next-business-day review. Testing confirmed that GuardDuty high-severity findings reach the on-call responder within 5 minutes through PagerDuty.

### Strengths

- GuardDuty findings auto-route to Slack #security-alerts for team-wide visibility
- High-severity findings trigger automatic ServiceNow ticket creation and on-call paging
- Authorized personnel have direct console access to all detection platforms
- PagerDuty integration ensures after-hours notification for critical events within 5 minutes

### Gaps

- Medium-severity findings do not trigger after-hours notification, potentially delaying response
- No automated daily digest or summary report of accumulated findings for leadership
- Alert distribution limited to security team; business unit stakeholders not included in relevant notifications
- No mechanism to confirm alert acknowledgment or track mean time to acknowledge

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 6 |

---

## Evidence Reviewed

- GuardDuty SNS notification configuration
- Slack #security-alerts channel message history (30 days)
- ServiceNow auto-ticket creation rules for security findings
- PagerDuty on-call rotation schedule and escalation policies
- SOC console access authorization records
- Alert-to-ticket trace for 5 recent GuardDuty findings

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Extend after-hours paging to include medium-severity findings with potential for escalation | High | Nadia Khan |
| 2 | Implement daily automated detection summary report for security leadership | Medium | Nadia Khan |
| 3 | Add alert acknowledgment tracking with mean-time-to-acknowledge KPI | Medium | Nadia Khan |
| 4 | Configure business-unit-relevant alert routing for incidents affecting specific systems | Low | Nadia Khan |
