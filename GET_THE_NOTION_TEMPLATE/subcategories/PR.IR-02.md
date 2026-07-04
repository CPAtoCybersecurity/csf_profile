---
id: 'PR.IR-02'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.IR'
category_name: 'Technology Infrastructure Resilience'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CP-02,PE-09,PE-10,PE-11,PE-12,PE-13,PE-14,PE-15,PE-18,PE-23'
score: 6
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name:
---

# PR.IR-02 — The organization's technology assets are protected from environmental threats

## Description

The organization's technology assets are protected from environmental threats

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 1.5 | 5 | Complete | Yes | Yes | Yes | 24-Jan |
| Q2 | 5 | 5 | Complete | Yes | Yes | Yes | 19-Apr |
| Q3 | 6 | 5 | Submitted | No | Yes | No | 15-Jun |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Redwood City data center environmental controls documented. Windows DC hosting 300 employees protected. AWS infrastructure leverages native resilience controls.

**Q2 observations**

Environmental threat protection verified and documented. AWS multi-AZ deployment operational. On-prem DC controls tested and certified. Fire suppression and HVAC monitoring active.

## NIST 800-53 References

CP-02,PE-09,PE-10,PE-11,PE-12,PE-13,PE-14,PE-15,PE-18,PE-23

## Test Procedures

_Add examine / interview / test procedures here._

## Implementation Examples

- **Ex1:** Protect organizational equipment from known environmental threats, such as flooding, fire, wind, and excessive heat and humidity

  Environmental protection includes:
  - (1) Redwood City data center with fire suppression, HVAC monitoring, and physical access controls protecting the Windows DC serving 300 employees,
  - (2) AWS infrastructure leveraging multi-AZ deployment with native resilience controls,
  - (3) documented environmental threat assessments and tested response procedures.
- **Ex2:** Include protection from environmental threats and provisions for adequate operating infrastructure in requirements for service providers that operate systems on the organization's behalf

  CP-02,PE-09,PE-10,PE-11,PE-12,PE-13,PE-14,PE-15,PE-18,PE-23

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
