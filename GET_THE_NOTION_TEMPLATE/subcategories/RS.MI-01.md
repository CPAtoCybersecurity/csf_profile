---
id: 'RS.MI-01'
function_id: 'RS'
function_name: 'RESPOND'
category_id: 'RS.MI'
category_name: 'Incident Mitigation'
in_scope: 'Yes'
owner: 'nadia.khan <nadia.khan@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'IR-04'
score: 4
target_score: 5
minimum_target: 5
remediation_owner: 'nadia.khan <nadia.khan@almasecurity.com>'
remediation_due: '2026-09-30'
artifact_name:
---

# RS.MI-01 — Incidents are contained

## Description

Incidents are contained

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | Yes | 04-Feb |
| Q2 | 3 | 5 | Complete | Yes | Yes | Yes | 30-Apr |
| Q3 | 4 | 5 | Submitted | No | Yes | No | 26-Jun |
| Q4 | 4 | 5 | Not Started | No | No | No | — |

**Q1 observations**

SentinelOne provides automated containment for malware. GuardDuty auto-remediation configured for select findings. Incident response playbooks documented.

**Q2 observations**

Containment capabilities expanded. Automated response for common threat patterns. Manual containment procedures well-documented for complex scenarios.

## NIST 800-53 References

IR-04

## Test Procedures

1. Inquiry: CISO, SOC Manager, 2. Inspect containment configs, 3. Inspect sample of incidents

## Implementation Examples

- **Ex1:** Cybersecurity technologies (e.g., antivirus software) and cybersecurity features of other technologies (e.g., operating systems, network infrastructure devices) automatically perform containment actions

  Incident containment is automated through: (1) SentinelOne automatic quarantine for malware, (2) GuardDuty auto-remediation for select finding types, (3) documented playbooks for manual containment. Common threat patterns trigger automated response. Complex incidents follow manual containment procedures with defined isolation steps.
- **Ex2:** Allow incident responders to manually select and perform containment actions

  IR-04
- **Ex3:** Allow a third party (e.g., internet service provider, managed security service provider) to perform containment actions on behalf of the organization

  IR-04
- **Ex4:** Automatically transfer compromised endpoints to a remediation virtual local area network (VLAN)

  IR-04

## Remediation / Action Plan

Expand GuardDuty auto-remediation to additional finding types. Develop automated containment playbooks for top 10 incident types. Integrate containment actions with SOAR capabilities.
