# DE.AE-06: Information on Adverse Events Is Provided to Authorized Staff and Tools

**Function:** DETECT (DE) | **Category:** DE.AE — Adverse Event Analysis
**NIST SP 800-53 Ref:** IR-04, PM-15, PM-16, RA-04, RA-10
**Implementation Examples:** 4 (Ex1–Ex4)

## Scope & Applicability

This test procedure covers Alma Security's mechanisms for distributing adverse event information to authorized personnel and tools:

- **Automated alert routing:** GuardDuty findings via SNS-to-Slack (#security-alerts channel); SentinelOne alerts to SOC console; O365 ATP alerts in Microsoft 365 Defender portal; PagerDuty escalations for after-hours High/Critical findings
- **On-demand access:** GuardDuty console, SentinelOne management portal, CloudWatch Logs Insights, Athena queries against centralized S3 log bucket — all RBAC-controlled
- **Automated ticketing:** SentinelOne auto-creates tickets for High/Critical endpoint detections; GuardDuty High-severity findings trigger Lambda-to-ticketing integration; tickets auto-assigned per SOC rotation
- **Manual reporting:** Staff-initiated security tickets for suspicious activity not caught by automated detection; SOC Manager validates severity within 2 hours
- **Personnel:** Nadia Khan (D&R Lead — access provisioning), Gerry (SOC Manager — severity validation), SOC analysts (Jane, John — triage and response), engineering staff (manual reporting)

Out of scope: distribution of vulnerability scan results (covered under DE.CM) and executive reporting cadence (covered under GV.OV).

## Continuous Monitoring Indicators

| Indicator | Source | Frequency | Threshold |
|-----------|--------|-----------|-----------|
| Mean time from detection to SOC notification | Alert routing logs | Weekly | <5 min for High/Critical (automated); <15 min for Medium |
| Mean time to acknowledge (MTTA) | Ticketing system | Weekly | Establish baseline; target <30 min during business hours |
| After-hours alert delivery success rate | PagerDuty logs | Monthly | 100% of High/Critical findings reach on-call within 5 min |
| Auto-ticket creation success rate | Ticketing system | Weekly | ≥99% of qualifying alerts generate tickets |
| Manual security ticket volume | Ticketing system | Monthly | Trend analysis; low volume may indicate underreporting |

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Trace GuardDuty finding delivery path: GuardDuty → SNS → Lambda → Slack #security-alerts | SNS topic subscription configuration; Lambda function code or configuration; Slack channel integration settings; sample message in #security-alerts with finding details |
| E2 | Verify SentinelOne alert routing to SOC console with threat classification and recommended actions | SentinelOne notification policy configuration; sample alert showing classification, affected host, and response recommendations |
| E3 | Review PagerDuty escalation policy for after-hours security alerts | PagerDuty service configuration showing escalation rules; on-call rotation schedule; severity-to-urgency mapping (High/Critical → page, Medium/Low → queue) |
| E4 | Confirm SOC analyst access provisioning for detection platforms | AWS IAM role assignments for GuardDuty/CloudWatch/Athena scoped to security operations; SentinelOne RBAC configuration showing authorized users; access review records |
| E5 | Review auto-ticketing configuration for SentinelOne and GuardDuty | SentinelOne ticketing integration settings showing trigger criteria (High/Critical); Lambda function for GuardDuty-to-ticketing; sample auto-generated tickets with pre-populated fields |
| E6 | Examine manual security ticket creation process | Incident response playbook section defining required fields and severity classification for manual tickets; sample manually-created ticket from non-SOC staff |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | SOC Analyst (Jane or John) | "Walk me through what happens when a GuardDuty High-severity finding fires at 2 PM on a Tuesday vs. 2 AM on a Saturday. How does the alert reach you in each case?" — Expected: Describes business hours Slack monitoring plus after-hours PagerDuty escalation with specific routing differences |
| I2 | Nadia Khan (D&R Lead) | "How do you control who has access to security findings? When was the last time you reviewed access permissions for detection consoles?" — Expected: Describes RBAC model, names specific IAM roles and SentinelOne permission groups, references a recent access review |
| I3 | Non-SOC Engineering Staff | "If you noticed something suspicious on your workstation or in a production system, how would you report it? Have you ever done so?" — Expected: Can describe the manual ticket creation process or at minimum knows to contact the security team; ideally references a specific channel or procedure |
| I4 | Gerry (SOC Manager) | "How do you validate severity for manually-created tickets? What happens if someone reports something they think is critical but it's actually a false alarm?" — Expected: Describes the 2-hour SLA for severity validation, the review process, and how false alarms are handled without discouraging future reporting |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Review 5 recent auto-generated tickets (mix of GuardDuty and SentinelOne); verify each was created within the expected timeframe and assigned to the correct SOC analyst | All 5 tickets were auto-created; assignment matches the on-duty analyst from the rotation schedule; ticket contains pre-populated threat details |
| T2 | Verify PagerDuty delivery for after-hours alerts: review PagerDuty incident log for the past 30 days and confirm all High/Critical after-hours findings triggered pages | All qualifying after-hours findings have corresponding PagerDuty incidents; page delivery confirmed within 5 minutes of finding generation |
| T3 | Test on-demand access: have an authorized SOC analyst query GuardDuty findings, run a CloudWatch Logs Insights query, and execute an Athena query against VPC Flow Logs in the centralized S3 bucket | Analyst successfully accesses all three platforms and retrieves results without access errors; an unauthorized user (selected from non-SOC staff) is denied access |
| T4 | Review 3 manually-created security tickets; verify each has required fields populated and received SOC Manager severity validation within the 2-hour SLA | All 3 tickets have severity, affected system, description, and reporter fields; SOC Manager validation timestamp is within 2 hours of ticket creation |

## Evidence Requirements

- [ ] SNS-to-Slack integration configuration for GuardDuty findings
- [ ] SentinelOne notification policy and ticketing integration settings
- [ ] PagerDuty escalation policy and on-call rotation schedule
- [ ] Lambda function configuration for GuardDuty-to-ticketing integration
- [ ] AWS IAM role policies for SOC analyst access to detection platforms
- [ ] SentinelOne RBAC user permissions export
- [ ] 5 sample auto-generated tickets (GuardDuty + SentinelOne mix)
- [ ] 3 sample manually-created security tickets with SOC Manager validation
- [ ] PagerDuty incident log for after-hours alerts (past 30 days)
- [ ] Incident response playbook manual reporting section

## Pass/Fail Criteria

**Pass:** All four implementation examples are demonstrably operational:
- Automated alert distribution (Ex1) delivers findings to SOC via Slack and PagerDuty with confirmed after-hours delivery within 5 minutes for High/Critical
- On-demand access (Ex2) is provisioned for authorized SOC personnel across all detection platforms with RBAC controls preventing unauthorized access
- Automated ticketing (Ex3) creates and assigns tickets for qualifying alerts with pre-populated fields and correct rotation-based assignment
- Manual reporting (Ex4) is supported by documented procedures, used by non-SOC staff, and validated by SOC Manager within the 2-hour SLA

**Partial Pass:** Three of four examples are fully operational; the fourth (typically manual reporting) has a documented process but limited evidence of use by non-SOC staff.

**Fail:** Automated alert distribution does not reach SOC within expected timeframes, OR after-hours High/Critical alerts have no paging mechanism, OR detection platform access is not RBAC-controlled, OR no mechanism exists for manual security reporting.

## Alma Security Context

Alma's alert distribution architecture is effective during business hours when the SOC team actively monitors Slack #security-alerts. The critical design decision is the PagerDuty integration for after-hours escalation — this is the lifeline for a team without 24/7 SOC coverage. The 5-minute delivery SLA for High/Critical findings is reasonable, but the gap for Medium-severity findings (queued until next business day) creates a risk window where medium-severity events could escalate without timely human awareness.

The Lambda-based auto-ticketing for GuardDuty and SentinelOne's native ticketing integration provide a solid automated workflow. The manual reporting path is important for Alma's size — with 300 employees, security-aware staff are a meaningful detection layer. The SOC Manager's 2-hour severity validation SLA for manual tickets balances responsiveness with analyst capacity.

The absence of alert acknowledgment tracking (no MTTA metric) is a gap that prevents measuring distribution effectiveness. Without knowing how long it takes from alert delivery to analyst acknowledgment, Alma cannot distinguish between "alert delivered" and "alert seen and acted upon."

## Related

- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md), [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md), [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- **Controls:** [DE.AE-06_Ex1](../../2_Controls/DE/DE.AE-06_Ex1.md), [DE.AE-06_Ex2](../../2_Controls/DE/DE.AE-06_Ex2.md), [DE.AE-06_Ex3](../../2_Controls/DE/DE.AE-06_Ex3.md), [DE.AE-06_Ex4](../../2_Controls/DE/DE.AE-06_Ex4.md)
- **Observations:** [DE.AE-06-Q1](../../4_Observations/DE/DE.AE-06-Q1.md)
