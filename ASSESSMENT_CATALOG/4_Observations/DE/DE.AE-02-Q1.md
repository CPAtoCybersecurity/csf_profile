# DE.AE-02: Potentially Adverse Events Are Analyzed — Q1 2025 Observation

**Assessment:** 2025 Alma Security CSF
**Assessor:** Steve <steve@almasecurity.com>
**Observation Date:** 2025-01-26
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | No | CloudTrail/GuardDuty configuration review deferred to Q2; assessed via interview and live demonstration |
| Interview | Yes | Nadia Khan (D&R Lead), Jane (SOC Analyst) |
| Test | Yes | Reviewed GuardDuty findings sample and manual review tickets; verified TTD metric calculation |

## Findings

Alma Security relies on AWS CloudTrail and GuardDuty as its primary SIEM-like monitoring platform, supplemented by SentinelOne for endpoint detection and O365 ATP for email threats. GuardDuty analyzes CloudTrail management and data events, VPC Flow Logs, and DNS query logs to generate findings for known malicious activity patterns. Detection rules are tuned based on threat intelligence from Amazon-curated feeds, Microsoft global threat intelligence, and industry ISAC briefings.

TTD has improved from the October 2024 baseline of 81 hours to 9 hours at the time of assessment, representing a significant improvement driven by GuardDuty automation and SOC process maturation. However, this remains well above the January 2027 target of under 4 minutes.

Manual log review is performed weekly for systems outside automated monitoring coverage (Slack workspace audit logs, physical badge reader logs, SaaS admin consoles). Reviews are assigned on a rotating basis by Nadia Khan and documented in the ticketing system. The manual review process is operational but relies on analyst discipline; no automated alerting exists for missed review windows.

The SOC Manager validates severity classifications and compiles monthly detection summary reports tracking TTD metrics. GuardDuty findings are surfaced through AWS Security Hub, and SentinelOne produces weekly endpoint threat reports.

### Strengths

- GuardDuty provides automated, continuous analysis of cloud API activity across all AWS accounts without requiring SIEM infrastructure management
- TTD improvement from 81 hours to 9 hours demonstrates that the detection program is maturing and that investments in tooling and process are yielding results
- Threat intelligence is integrated from multiple sources (Amazon feeds, Microsoft ATP, ISAC briefings), providing layered detection coverage
- Manual review process is defined with clear ownership and cadence for non-automated systems
- Monthly detection reporting with TTD metric tracking provides management visibility into detection program effectiveness

### Gaps

- **No 24/7 monitoring coverage:** SOC operates business hours with on-call rotation. After-hours detection depends entirely on automated alerting with no real-time human triage. A critical GuardDuty finding generated at 2 AM would not receive human analysis until the next business day unless it triggers an on-call page, and on-call paging criteria are not well-defined.
- **Limited cross-source correlation:** CloudTrail, GuardDuty, SentinelOne, and O365 ATP operate as independent detection silos. Custom correlation scripts are planned but not yet deployed, limiting the ability to identify attacks that span cloud infrastructure and endpoints.
- **SIEM coverage limited to AWS-native systems:** On-premises Windows domain controller at Redwood City and several SaaS applications lack automated log analysis integration. Manual review is the compensating control, but review cadence (weekly) means detection latency for these systems is measured in days.
- **No document examination performed:** Configuration review was deferred to Q2. Scoring is based on interview and test only, which may overstate or understate the actual configuration posture.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 2 |
| Target Score | 5 |
| Previous Quarter | N/A |
| Trend | N/A (baseline assessment) |

**Scoring rationale:** Score of 2 (Some Security) reflects that adverse event analysis is implemented but inconsistently across the environment. Automated analysis covers AWS infrastructure effectively, but lacks 24/7 human oversight, cross-source correlation, and coverage of non-AWS systems. The manual review process compensates partially but does not provide the reliability or speed expected at the Minimally Acceptable (5.0) threshold.

## Evidence Reviewed

- GuardDuty findings dashboard (live demonstration during interview)
- TTD metrics from SOC dashboard showing 81h → 9h trend
- SOC on-call rotation schedule
- Manual log review tickets for Slack and SaaS admin logs (3 most recent cycles)
- SentinelOne weekly endpoint threat report (January 2025)
- SOC Manager monthly detection summary (December 2024)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Complete Incident Response Enhancement project to establish 24/7 SOC monitoring coverage with defined on-call paging criteria for after-hours critical findings | High | Nadia Khan |
| 2 | Deploy custom cross-source correlation scripts to enable detection of attacks spanning AWS infrastructure and endpoints | High | Nadia Khan |
| 3 | Expand automated log analysis to on-premises Windows DC and SaaS applications currently dependent on manual review | Medium | Jane |
| 4 | Conduct full Examine-method configuration review in Q2 to validate CloudTrail, GuardDuty, and SentinelOne configurations against documented standards | Medium | Steve |
| 5 | Define and document TTD sub-targets by detection source (GuardDuty automated vs. manual review) to track improvement granularity | Low | Gerry |

## Related

- **Test Procedure:** [DE.AE-02 Test Procedures](../../3_Test_Procedures/DE/DE.AE-02.md)
- **Controls:** [DE.AE-02_Ex1](../../2_Controls/DE/DE.AE-02_Ex1.md), [DE.AE-02_Ex2](../../2_Controls/DE/DE.AE-02_Ex2.md), [DE.AE-02_Ex3](../../2_Controls/DE/DE.AE-02_Ex3.md), [DE.AE-02_Ex4](../../2_Controls/DE/DE.AE-02_Ex4.md)
- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
