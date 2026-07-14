---
id: 'ID.RA-07'
function_id: 'ID'
function_name: 'IDENTIFY'
category_id: 'ID.RA'
category_name: 'Risk Assessment'
in_scope: 'Yes'
owner: 'chris.magann <chris.magann@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CA-07,CM-03,CM-04'
score: 3
target_score: 5
minimum_target: 5
remediation_owner: 'chris.magann <chris.magann@almasecurity.com>'
remediation_due: '2026-09-30'
artifact_name:
---

# ID.RA-07 — Changes and exceptions are managed, assessed for risk impact, recorded, and tracked

## Description

Changes and exceptions are managed, assessed for risk impact, recorded, and tracked

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 1 | 5 | Complete | Yes | Yes | Yes | 22-Jan |
| Q2 | 3 | 5 | Complete | Yes | Yes | Yes | 17-Apr |
| Q3 | 3 | 5 | In Progress | No | Yes | No | 13-Jun |
| Q4 | 3 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Change management policy exists. Exception documentation process established but enforcement inconsistent across teams.

**Q2 observations**

Change requests formally documented and tracked. Risk impact assessments required for crown jewel systems. Sample audits show 85% compliance with documented procedures.

## NIST 800-53 References

CA-07,CM-03,CM-04

## Test Procedures

1. Inquiry: CISO, Change Manager, 2. Inspect change management policy, 3. Inspect sample of change requests

## Implementation Examples

- **Ex1:** Implement and follow procedures for the formal documentation, review, testing, and approval of proposed changes and requested exceptions

  Change management is governed by policy requiring: (1) formal documentation of proposed changes in ServiceNow, (2) risk impact assessment for changes affecting crown jewel systems, (3) testing and approval workflows, (4) exception documentation with CISO approval. Sample audits track compliance (currently 85%). Crown jewel systems require additional security review.
- **Ex2:** Document the possible risks of making or not making each proposed change, and provide guidance on rolling back changes

  CA-07,CM-03,CM-04
- **Ex3:** Document the risks related to each requested exception and the plan for responding to those risks

  CA-07,CM-03,CM-04
- **Ex4:** Periodically review risks that were accepted based upon planned future actions or milestones

  CA-07,CM-03,CM-04

## Remediation / Action Plan

Implement automated change management enforcement in ServiceNow. Extend mandatory risk impact assessments to all systems (not just crown jewels). Conduct training for all teams on change documentation requirements. Target 95% compliance.
