# DE.CM-03: Personnel Activity and Technology Usage Monitoring — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Active Directory logon event logging, AWS IAM access logging via CloudTrail, SentinelOne user activity monitoring, failed authentication alert configuration |
| Interview | Yes | Interviewed Nadia Khan on insider threat monitoring strategy; IT Manager on user activity logging and anomaly detection capabilities |
| Test | Yes | Reviewed AD authentication logs for failed logon patterns; verified CloudTrail captures IAM user activity across all accounts; tested SentinelOne behavioral detection for anomalous process execution |

---

## Findings

Alma Security monitors personnel activity through multiple sources: Active Directory logs capture authentication events including failed logons, privilege escalation, and group membership changes on the Windows Domain Controller. CloudTrail records all IAM user and role activity across AWS accounts. SentinelOne monitors endpoint user activity including process execution, file access, and network connections with behavioral analysis for anomaly detection.

Failed authentication monitoring is operational, with repeated failed logon attempts generating alerts. However, Alma does not employ dedicated User and Entity Behavior Analytics (UEBA) or insider threat detection tooling. Anomalous user activity detection relies on SentinelOne's endpoint behavioral models and GuardDuty's IAM anomaly detection, which focus on technical indicators rather than user behavioral patterns. There is no monitoring of data exfiltration patterns, unusual working hours activity, or progressive access accumulation that might indicate insider threat activity.

### Strengths

- Active Directory authentication logging captures failed logons, privilege changes, and group membership modifications
- CloudTrail provides comprehensive IAM activity logging across all AWS accounts
- SentinelOne behavioral analysis detects anomalous process execution patterns at the endpoint level
- Failed authentication alerts configured for both AD and AWS IAM

### Gaps

- No dedicated UEBA or insider threat detection platform
- Data exfiltration pattern monitoring not implemented
- No monitoring for anomalous working hours or geographic access patterns
- Deception technology (honeypots, honey tokens) not deployed
- User activity monitoring does not correlate across AD, AWS, and endpoint sources

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** Personnel activity monitoring scores 3, in the **Some Security** band (2.0–4.9): the logging foundation is defined and operating — AD failed-logon and privilege-change events, CloudTrail IAM activity across all AWS accounts, SentinelOne endpoint behavioral analysis — but the control's actual objective (detecting insider threat) is unreliably served because the three sources are never correlated and no UEBA capability exists. Data exfiltration patterns, off-hours activity, and progressive access accumulation go entirely unmonitored, so a malicious insider staying below endpoint-level technical thresholds would not be detected. The target of 5 (Minimally Acceptable) requires consistent execution across the full monitoring scope, which here means cross-source correlation and exfiltration-pattern coverage — not merely more of the same siloed logs.

---

## Evidence Reviewed

- Active Directory authentication event logs (30 days)
- CloudTrail IAM activity logs sample review
- SentinelOne behavioral detection configuration and recent findings
- Failed authentication alert rules and escalation configuration
- Insider threat monitoring gap analysis

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Evaluate UEBA platform to correlate user activity across AD, AWS, and endpoint sources | High | Nadia Khan |
| 2 | Implement data exfiltration monitoring for bulk download, USB, and cloud storage upload patterns | High | Nadia Khan |
| 3 | Configure geographic and temporal anomaly alerts for user authentication events | Medium | Nadia Khan |
| 4 | Deploy honey tokens in sensitive data stores to detect unauthorized access attempts | Low | Nadia Khan |

## Related

- **Test Procedure:** [DE.CM-03 Test Procedures](../../3_Test_Procedures/DE/DE.CM-03.md)
- **Controls:** [DE.CM-03_Ex1](../../2_Controls/DE/DE.CM-03_Ex1.md), [DE.CM-03_Ex2](../../2_Controls/DE/DE.CM-03_Ex2.md), [DE.CM-03_Ex3](../../2_Controls/DE/DE.CM-03_Ex3.md)
