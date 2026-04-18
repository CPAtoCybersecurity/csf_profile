# DE.AE-02: Potentially Adverse Events Are Analyzed to Better Understand Associated Activities

**Function:** DETECT (DE) | **Category:** DE.AE — Adverse Event Analysis
**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, SI-04
**Implementation Examples:** 4 (Ex1–Ex4)

## Scope & Applicability

This test procedure covers Alma Security's capability to analyze potentially adverse events across:

- **Cloud infrastructure:** AWS CloudTrail (API activity logging), GuardDuty (automated threat detection), VPC Flow Logs, DNS query logs across all AWS accounts
- **Endpoints:** SentinelOne EDR detections and Deep Visibility queries
- **Email:** O365 Advanced Threat Protection alerts
- **Manual review scope:** Slack workspace audit logs, physical badge reader logs, SaaS admin consoles not covered by automated monitoring
- **Personnel:** SOC team (Detection & Response, led by Nadia Khan), SOC Manager (Gerry), SOC analysts (Jane, John), auditor (Steve)

Systems out of scope: on-premises Windows domain controller logs are monitored separately under DE.CM and are not part of the SIEM-like analysis workflow assessed here.

## Continuous Monitoring Indicators

| Indicator | Source | Frequency | Threshold |
|-----------|--------|-----------|-----------|
| Time to Detect (TTD) | SOC metrics dashboard | Monthly | Baseline 81h → Current 9h → Target <4min by Jan 2027 |
| GuardDuty finding volume | AWS Security Hub | Daily | Trend analysis; spike >2x weekly average triggers review |
| Manual review completion rate | Ticketing system | Weekly | 100% of scheduled reviews completed on time |
| Threat intel feed currency | GuardDuty + ISAC feeds | Weekly | Feeds updated within 24h of publication |
| Detection rule tuning actions | Change log | Quarterly | ≥1 rule update per quarter based on false positive analysis |

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Verify CloudTrail is enabled for all regions across all AWS accounts | CloudTrail configuration export showing multi-region, multi-account coverage with log file validation enabled |
| E2 | Confirm GuardDuty is enabled and centralized across all accounts | GuardDuty console screenshot showing enabled status in production account (123456789012) and delegated admin configuration |
| E3 | Review GuardDuty custom findings configurations and suppression rules | Exported suppression filter list with documented rationale for each suppression; confirm no high-severity finding types are suppressed |
| E4 | Examine threat intelligence feed integration | GuardDuty threat list configuration showing Amazon-curated feeds active; O365 ATP rule configuration; evidence of ISAC membership and briefing attendance |
| E5 | Review manual log review schedule and completion records | Documented review cadence by system criticality tier; ticketing system query showing completed review tickets for Slack, badge reader, and SaaS admin logs over the past 90 days |
| E6 | Inspect log analysis reporting outputs | GuardDuty findings report from AWS Security Hub (severity-ranked); SentinelOne weekly endpoint threat report; SOC Manager's monthly detection summary with TTD metrics |
| E7 | Verify automation gap tracking | List of systems requiring manual review with justification; roadmap for custom cross-source correlation script deployment |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | Nadia Khan (D&R Lead) | "Walk me through how a GuardDuty finding gets from detection to analyst review. What is the average time from finding generation to analyst acknowledgment?" — Expected: Can describe the full alert-to-triage pipeline with specific tool names and routing paths |
| I2 | SOC Analyst (Jane or John) | "Describe your manual log review process. Which systems do you review, how often, and what are you looking for?" — Expected: Can name the specific systems (Slack, badge readers, SaaS consoles), the review cadence, and the finding documentation process |
| I3 | SOC Analyst (Jane or John) | "How do you use threat intelligence during log analysis? Give me a recent example where a threat intel indicator influenced your analysis." — Expected: Can reference a specific ISAC briefing or GuardDuty threat list update that changed their analysis approach |
| I4 | Gerry (SOC Manager) | "How do you validate severity classifications in detection reports? What happens when you disagree with an automated classification?" — Expected: Can describe the review process for GuardDuty and SentinelOne reports and the override/escalation path |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Generate a benign test event (e.g., API call from an unusual region) and verify it appears in CloudTrail within expected timeframe | Event appears in CloudTrail logs within 15 minutes; log file integrity validation passes |
| T2 | Review a sample of 5 GuardDuty findings from the past 30 days; verify each was triaged with documented analyst action | All 5 findings have corresponding tickets or documented triage decisions; no high-severity finding was left unacknowledged for >4 hours during business hours |
| T3 | Request the most recent monthly detection summary report; verify TTD metric calculation methodology | Report dated within 30 days; TTD calculated consistently across incidents; current TTD documented against the 81-hour baseline and the <4-minute target |
| T4 | Select one system from the manual review list; verify the last 3 review cycles were completed and documented | All 3 review cycles have tickets with findings documented using the standard finding template; reviews were completed within the defined cadence window |

## Evidence Requirements

- [ ] CloudTrail configuration export (all regions, all accounts)
- [ ] GuardDuty enabled status and delegated admin screenshot
- [ ] GuardDuty suppression filter list with rationale
- [ ] Threat intelligence feed configuration (GuardDuty threat lists, O365 ATP rules)
- [ ] ISAC membership documentation or briefing attendance records
- [ ] Manual log review schedule and last 90 days of completed review tickets
- [ ] GuardDuty findings report from AWS Security Hub (last 30 days)
- [ ] SentinelOne weekly endpoint threat report (most recent)
- [ ] SOC Manager monthly detection summary with TTD metrics
- [ ] Automation gap tracking document with remediation roadmap
- [ ] SOC on-call rotation schedule

## Pass/Fail Criteria

**Pass:** All four implementation examples are demonstrably operational:
- Automated SIEM-like monitoring (Ex1) covers all AWS accounts with GuardDuty and CloudTrail
- Threat intelligence (Ex2) is integrated into at least two detection tools with evidence of regular updates
- Manual review (Ex3) is scheduled, executed on cadence, and documented for all identified non-automated systems
- Reporting (Ex4) produces regular outputs that track TTD against baseline with SOC Manager validation

**Partial Pass:** Three of four examples are fully operational; the fourth has a documented remediation plan with a target date within 6 months.

**Fail:** Fewer than three examples are operational, OR automated monitoring has coverage gaps affecting production systems, OR TTD metrics are not tracked, OR manual review has no documented cadence.

## Alma Security Context

Alma Security uses AWS-native tools (CloudTrail, GuardDuty, VPC Flow Logs, DNS logs) as its primary SIEM-like detection platform rather than a traditional SIEM. This is appropriate for their cloud-first architecture but creates a dependency on AWS-native capabilities and limits cross-source correlation to custom scripts. The TTD improvement from 81 hours to 9 hours demonstrates meaningful progress, but the January 2027 target of <4 minutes requires significant investment in automation beyond the current toolset.

Key gap: no 24/7 monitoring coverage. Business hours SOC with on-call rotation means after-hours detection relies entirely on automated alerting with no real-time human analysis. The Incident Response Enhancement project ($150K budget) is the primary remediation vehicle.

Manual review of Slack, badge reader, and SaaS admin logs is a compensating control for systems that lack API-based log forwarding. The planned custom correlation scripts will reduce but not eliminate the need for manual review.

## Related

- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md), [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md), [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- **Controls:** [DE.AE-02_Ex1](../../2_Controls/DE/DE.AE-02_Ex1.md), [DE.AE-02_Ex2](../../2_Controls/DE/DE.AE-02_Ex2.md), [DE.AE-02_Ex3](../../2_Controls/DE/DE.AE-02_Ex3.md), [DE.AE-02_Ex4](../../2_Controls/DE/DE.AE-02_Ex4.md)
- **Observations:** [DE.AE-02-Q1](../../4_Observations/DE/DE.AE-02-Q1.md)
