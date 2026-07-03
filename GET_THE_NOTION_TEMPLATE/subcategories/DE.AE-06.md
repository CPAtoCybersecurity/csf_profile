---
id: 'DE.AE-06'
function_id: 'DE'
function_name: 'DETECT'
category_id: 'DE.AE'
category_name: 'Adverse Event Analysis'
in_scope: 'Yes'
owner: 'nadia.khan <nadia.khan@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'IR-04,PM-15,PM-16,RA-04,RA-10'
score: 6
target_score: 5
minimum_target: 5
remediation_owner: 'nadia.khan <nadia.khan@almasecurity.com>'
remediation_due: '2026-10-31'
artifact_name:
---

# DE.AE-06 — Information on adverse events is provided to authorized staff and tools

## Description

Information on adverse events is provided to authorized staff and tools

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | Yes | 27-Jan |
| Q2 | 4 | 5 | Complete | Yes | Yes | No | 22-Apr |
| Q3 | 6 | 5 | Submitted | No | Yes | No | 18-Jun |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

GuardDuty alerts configured and routed to security team. Alert prioritization matrix implemented. Business hours coverage with on-call rotation.

**Q2 observations**

Alert routing enhanced with severity-based escalation. SOC handoff procedures documented. Progress toward 24/7 coverage with planned staffing increase.

## NIST 800-53 References

IR-04,PM-15,PM-16,RA-04,RA-10

## Test Procedures

1. Inquiry: CISO, SOC Manager, 2. Inspect SOC procedures, 3. Observe SOC handoff meeting

## Implementation Examples

- **Ex1:** Use cybersecurity software to generate alerts and provide them to the security operations center (SOC), incident responders, and incident response tools

  GuardDuty generates alerts routed to the security team via Slack with severity-based prioritization. SOC procedures define handoff between business hours staff and on-call rotation. Alert triage follows the priority matrix with escalation paths. Progress toward 24/7 coverage planned through STS1 hiring strategy.
- **Ex2:** Incident responders and other authorized personnel can access log analysis findings at all times

  IR-04,PM-15,PM-16,RA-04,RA-10
- **Ex3:** Automatically create and assign tickets in the organization's ticketing system when certain types of alerts occur

  IR-04,PM-15,PM-16,RA-04,RA-10
- **Ex4:** Manually create and assign tickets in the organization's ticketing system when technical staff discover indicators of compromise

  IR-04,PM-15,PM-16,RA-04,RA-10

## Remediation / Action Plan

Hire additional SOC staff per STS1 strategy to enable 24/7 coverage. Complete SOC handoff procedure documentation. Implement automated alert escalation for critical severity findings.
