---
id: 'RS.MA-03'
function_id: 'RS'
function_name: 'RESPOND'
category_id: 'RS.MA'
category_name: 'Incident Management'
in_scope: 'Yes'
owner: 'nadia.khan <nadia.khan@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'IR-04,IR-05,IR-06'
score: 3
target_score: 5
minimum_target: 5
remediation_owner: 'nadia.khan <nadia.khan@almasecurity.com>'
remediation_due: '2026-08-31'
artifact_name:
---

# RS.MA-03 — Incidents are categorized and prioritized

## Description

Incidents are categorized and prioritized

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | Yes | 11-Feb |
| Q2 | 3 | 5 | Complete | No | Yes | Yes | 07-May |
| Q3 | 3 | 5 | Not Started | No | No | No | — |
| Q4 | 3 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Incident priority matrix approved. Scope and impact-based prioritization implemented. Time-critical incident handling procedures documented.

**Q2 observations**

Prioritization process consistently applied. Sample tickets demonstrate proper categorization. SOC Manager reviews validate prioritization decisions.

## NIST 800-53 References

IR-04,IR-05,IR-06

## Test Procedures

1. Inquiry: CISO, SOC Manager, 2. Inspect incident priority matrix, 3. Inspect sample of incident tickets

## Implementation Examples

- **Ex1:** Further review and categorize incidents based on the type of incident (e.g., data breach, ransomware, DDoS, account compromise)

  IR-04,IR-05,IR-06
- **Ex2:** Prioritize incidents based on their scope, likely impact, and time-critical nature

  Incident prioritization uses a documented priority matrix based on: (1) scope of impact, (2) likely business impact, (3) time-critical nature. The SOC Manager validates prioritization decisions. Sample ticket audits verify consistent application. Incident tickets in ServiceNow capture categorization with priority justification.
- **Ex3:** Select incident response strategies for active incidents by balancing the need to quickly recover from an incident with the need to observe the attacker or conduct a more thorough investigation

  IR-04,IR-05,IR-06

## Remediation / Action Plan

Implement automated incident categorization based on detection signatures. Enhance priority matrix with additional impact criteria. Conduct SOC team training on prioritization consistency.
