---
id: 'DE.AE-02'
function_id: 'DE'
function_name: 'DETECT'
category_id: 'DE.AE'
category_name: 'Adverse Event Analysis'
in_scope: 'Yes'
owner: 'nadia.khan <nadia.khan@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; John Doe <john@doe.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'AU-06,CA-07,IR-04,SI-04'
score: 5
target_score: 5
minimum_target: 5
remediation_owner: 'nadia.khan <nadia.khan@almasecurity.com>'
remediation_due: '2026-08-31'
artifact_name:
---

# DE.AE-02 — Potentially adverse events are analyzed to better understand associated activities

## Description

Potentially adverse events are analyzed to better understand associated activities

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2.5 | 5 | Complete | No | Yes | Yes | 26-Jan |
| Q2 | 4 | 5 | Complete | No | Yes | No | 21-Apr |
| Q3 | 5 | 5 | Submitted | No | Yes | No | 17-Jun |
| Q4 | 5 | 5 | Not Started | No | No | No | — |

**Q1 observations**

CloudTrail and GuardDuty provide SIEM-like functionality. TTD at 9 hours. Malicious activity detection rules tuned based on threat intelligence.

**Q2 observations**

SIEM monitoring expanded with additional use cases. Log analysis frequency increased. Incident Response Enhancement project addressing 24/7 monitoring gap.

## NIST 800-53 References

AU-06,CA-07,IR-04,SI-04

## Test Procedures

_Add examine / interview / test procedures here._

## Implementation Examples

- **Ex1:** Use security information and event management (SIEM) or other tools to continuously monitor log events for known malicious and suspicious activity

  Alma Security uses AWS CloudTrail and GuardDuty for SIEM-like log monitoring. Detection rules are tuned based on threat intelligence with current TTD at 9 hours. The Incident Response Enhancement project addresses 24/7 monitoring gaps. Log analysis covers malicious activity patterns across AWS accounts with expanded use cases added quarterly.
- **Ex2:** Utilize up-to-date cyber threat intelligence in log analysis tools to improve detection accuracy and characterize threat actors, their methods, and indicators of compromise

  AU-06,CA-07,IR-04,SI-04
- **Ex3:** Regularly conduct manual reviews of log events for technologies that cannot be sufficiently monitored through automation

  Manual log review is performed for systems not covered by automated monitoring: (1) review cadence defined by system criticality, (2) documented review process with finding templates, (3) SIEM console used for manual analysis. Automation gaps are tracked and addressed through tooling investments. Findings are documented with remediation tracking.
- **Ex4:** Use log analysis tools to generate reports on their findings

  AU-06,CA-07,IR-04,SI-04

## Remediation / Action Plan

Complete Incident Response Enhancement project deliverables for 24/7 monitoring. Add additional SIEM use cases for non-AWS systems. Implement log analysis automation to reduce manual review burden.
