---
id: 'GV.SC-04'
function_id: 'GV'
function_name: 'GOVERN'
category_id: 'GV.SC'
category_name: 'Cybersecurity Supply Chain Risk Management'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'RA-09,SA-09,SR-06'
score: 6.5
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name: 'Third Party Risk Management Policy'
---

# GV.SC-04 — Suppliers are known and prioritized by criticality

## Description

Suppliers are known and prioritized by criticality

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 5 | 5 | Complete | Yes | Yes | No | 10-Jan |
| Q2 | 6.5 | 5 | Complete | Yes | Yes | Yes | 05-Apr |
| Q3 | 6.5 | 5 | In Progress | No | Yes | No | 01-Jun |
| Q4 | 6.5 | 5 | Not Started | No | No | No | — |

**Q1 observations**

The IT Manager explained that GRC verified that:
Supplier risk tiers documented in Third Party Risk Management Policy. No PO No Pay policy, and all suppliers paid were identified and ranked by data sensitivity, system access level, and mission importance.

**Q2 observations**

Criticality framework operationalized with ServiceNow integration. Automated supplier risk scoring deployed. Quarterly reviews of supplier criticality ratings conducted with stakeholder sign-off.

## NIST 800-53 References

RA-09,SA-09,SR-06

## Test Procedures

_Add examine / interview / test procedures here._

## Implementation Examples

- **Ex1:** Develop criteria for supplier criticality based on, for example, the sensitivity of data processed or possessed by suppliers, the degree of access to the organization's systems, and the importance of the products or services to the organization's mission

  Alma Security maintains a supplier inventory in ServiceNow with criticality ratings based on three factors:
  - (1) sensitivity of data processed (with biometric data suppliers rated highest),
  - (2) degree of system access granted, and
  - (3) importance to the continuous authentication mission. The Third Party Risk Management Policy defines tiering criteria and requires quarterly reviews with CISO and Procurement sign-off.
- **Ex2:** Keep a record of all suppliers, and prioritize suppliers based on the criticality criteria

  RA-09,SA-09,SR-06

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
