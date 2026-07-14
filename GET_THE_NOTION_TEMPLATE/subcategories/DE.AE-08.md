---
id: 'DE.AE-08'
function_id: 'DE'
function_name: 'DETECT'
category_id: 'DE.AE'
category_name: 'Adverse Event Analysis'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'IR-04,IR-08'
score: 6
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name: 'SOC-Ticket-1001'
---

# DE.AE-08 — Incidents are declared when adverse events meet the defined incident criteria

## Description

Incidents are declared when adverse events meet the defined incident criteria

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2.5 | 5 | Complete | Yes | Yes | No | 13-Feb |
| Q2 | 6 | 5 | Complete | Yes | Yes | Yes | 09-May |
| Q3 | 6 | 5 | Not Started | No | No | No | — |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Incident criteria documented and approved. Declaration thresholds defined by severity level. SOC Manager authorized to declare incidents.

**Q2 observations**

Criteria consistently applied across all incident types. Sample tickets demonstrate proper declaration process. Continuous improvement through lessons learned.

## NIST 800-53 References

IR-04,IR-08

## Test Procedures

1. Inquiry: CISO, SOC Manager, 2. Inspect incident criteria, 3. Inspect sample of incident tickets

## Implementation Examples

- **Ex1:** Apply incident criteria to known and assumed characteristics of activity in order to determine whether an incident should be declared

  Incident declaration follows documented criteria defining thresholds by severity level. The SOC Manager has authority to declare incidents when adverse events meet criteria. The process includes: (1) applying criteria to event characteristics, (2) documenting declaration rationale in tickets, (3) lessons learned feeding continuous improvement.
- **Ex2:** Take known false positives into account when applying incident criteria

  IR-04,IR-08

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
