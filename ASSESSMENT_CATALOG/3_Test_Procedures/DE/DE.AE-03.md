# DE.AE-03: Information Is Correlated from Multiple Sources

**Function:** DETECT (DE) | **Category:** DE.AE — Adverse Event Analysis
**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, IR-05, IR-08, PM-16, SI-04
**Implementation Examples:** 3 (Ex1–Ex3)

## Scope & Applicability

This test procedure covers Alma Security's ability to correlate security event information across:

- **Cloud-native log sources:** CloudTrail (API activity), VPC Flow Logs (network traffic), DNS query logs — all aggregated to a centralized S3 bucket with CloudWatch Logs integration
- **Correlation engines:** AWS GuardDuty (multi-signal correlation across AWS sources), O365 ATP (email threat correlation within Microsoft ecosystem)
- **Endpoint telemetry:** SentinelOne management console (process, file, network event correlation)
- **Manual correlation:** SOC team cross-platform pivot techniques between AWS, SentinelOne, and O365 consoles
- **Threat intelligence enrichment:** GuardDuty threat lists, ISAC briefings used to contextualize correlated events
- **Personnel:** Nadia Khan (D&R Lead), SOC analysts (Jane, John), auditor (Steve)

Out of scope: physical access badge logs and Slack workspace audit logs, which are reviewed manually under DE.AE-02 but not currently included in correlation workflows.

## Continuous Monitoring Indicators

| Indicator | Source | Frequency | Threshold |
|-----------|--------|-----------|-----------|
| Mean time from first signal to correlated incident view | SOC metrics | Monthly | Establish baseline; target <30 min for multi-source incidents |
| Cross-platform correlation attempts per incident | Incident tickets | Per incident | ≥1 cross-platform pivot documented for all Medium+ incidents |
| GuardDuty multi-signal finding rate | AWS Security Hub | Weekly | Trend analysis; declining rate may indicate coverage gap |
| Correlation script deployment status | Project tracker | Monthly | Track progress toward automated cross-source correlation |
| Duplicate/uncorrelated alert volume | Ticketing system | Weekly | Decreasing trend indicates improving correlation maturity |

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Verify CloudTrail logs, VPC Flow Logs, and DNS query logs forward to the centralized S3 bucket | S3 bucket configuration showing log delivery from all AWS accounts; CloudWatch Logs integration settings |
| E2 | Confirm SentinelOne telemetry is aggregated in the management console with queryable event data | SentinelOne console screenshot showing Deep Visibility query capability across enrolled endpoints |
| E3 | Review O365 ATP log retention in the Microsoft 365 unified audit log | M365 audit log retention settings; confirmation that ATP events are searchable alongside other O365 events |
| E4 | Assess GuardDuty multi-source correlation configuration | GuardDuty data sources panel showing CloudTrail, VPC Flow Logs, and DNS logs enabled; sample multi-signal finding |
| E5 | Review status of custom cross-source correlation scripts funded by IR Enhancement project ($150K) | Project status report; script architecture documentation; deployment timeline |
| E6 | Examine whether a normalized event taxonomy exists across detection platforms | Any documentation mapping event types across GuardDuty, SentinelOne, and O365 ATP to common categories |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | Nadia Khan (D&R Lead) | "When a GuardDuty finding suggests lateral movement, how does your team correlate that with endpoint telemetry from SentinelOne? Walk me through the manual process." — Expected: Describes specific pivot techniques (IP-to-host lookup, timestamp correlation, user identity linkage) |
| I2 | SOC Analyst (Jane or John) | "Describe the last time you correlated events across two or more platforms during an investigation. What was the incident, and how long did the cross-platform correlation take?" — Expected: Can describe a specific incident with named tools and approximate time investment |
| I3 | Nadia Khan (D&R Lead) | "How do you use threat intelligence to improve event correlation? Give me an example where a threat indicator helped you link events across platforms." — Expected: References a specific ISAC briefing or GuardDuty threat list indicator that connected otherwise separate findings |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Simulate a lateral movement scenario: generate a suspicious API call in CloudTrail and a corresponding network connection in VPC Flow Logs; verify both events can be linked to the same source | Assessor can identify both events and correlate them using available tools within 30 minutes; correlation path is documented |
| T2 | Select 3 recent multi-vector incidents from the ticketing system; verify that investigation notes document cross-source evidence from at least 2 platforms | All 3 incidents reference evidence from multiple detection sources; correlation reasoning is documented in the ticket |
| T3 | Attempt to correlate a GuardDuty finding with SentinelOne endpoint telemetry for the same timeframe and host | Correlation is achievable manually; document the number of console switches and approximate time required to complete the pivot |
| T4 | Review GuardDuty multi-signal findings from the past 30 days; verify at least one finding demonstrates automated correlation across CloudTrail, VPC Flow Logs, and DNS | At least one multi-signal finding exists; the finding correctly correlated events from multiple data sources |

## Evidence Requirements

- [ ] Centralized S3 log bucket configuration (log sources, retention, access controls)
- [ ] CloudWatch Logs integration settings for CloudTrail/VPC Flow Logs/DNS
- [ ] GuardDuty data sources configuration and sample multi-signal finding
- [ ] SentinelOne Deep Visibility query capability demonstration
- [ ] O365 unified audit log retention and search configuration
- [ ] Cross-source correlation script project status report and architecture
- [ ] 3 recent incident tickets showing multi-platform investigation evidence
- [ ] ISAC threat briefing distribution records for SOC personnel

## Pass/Fail Criteria

**Pass:** All three implementation examples are demonstrably operational:
- Log aggregation (Ex1) centralizes cloud-native logs to a single queryable repository with SentinelOne and O365 telemetry accessible from their respective consoles
- Event correlation (Ex2) is automated within platforms (GuardDuty multi-signal, SentinelOne Deep Visibility) and cross-platform correlation is achievable (manually or via scripts) with documented analyst workflows
- Threat intelligence (Ex3) enriches correlation through at least two sources with evidence of operational use during investigations

**Partial Pass:** Log aggregation and within-platform correlation are operational, but cross-platform correlation is entirely manual with no documented workflow and no progress toward automation.

**Fail:** Log sources remain siloed with no centralized aggregation, OR GuardDuty multi-source correlation is not enabled, OR SOC analysts cannot demonstrate cross-platform event correlation for a recent incident.

## Alma Security Context

Alma operates a multi-platform detection environment without a traditional unified SIEM. GuardDuty provides strong automated correlation within the AWS ecosystem, and SentinelOne correlates endpoint events within its own telemetry. The critical gap is cross-platform correlation between these silos — currently manual, requiring analysts to pivot between 3+ consoles to link cloud API activity to endpoint behavior to email threats.

The $150K Incident Response Enhancement project includes custom correlation script development to bridge this gap. Until deployed, Alma's correlation maturity is capped by analyst speed and availability. For a 300-person SaaS company, the current approach is defensible in the short term but will not scale as the environment grows or as attack complexity increases.

The absence of physical access and identity management event sources from correlation workflows is a secondary gap — relevant for insider threat scenarios but lower priority than the cloud-endpoint correlation gap.

## Related

- **Artifacts:** [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- **Controls:** [DE.AE-03_Ex1](../../2_Controls/DE/DE.AE-03_Ex1.md), [DE.AE-03_Ex2](../../2_Controls/DE/DE.AE-03_Ex2.md), [DE.AE-03_Ex3](../../2_Controls/DE/DE.AE-03_Ex3.md)
- **Observations:** [DE.AE-03-Q1](../../4_Observations/DE/DE.AE-03-Q1.md)
