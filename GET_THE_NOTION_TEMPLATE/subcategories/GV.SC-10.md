---
id: 'GV.SC-10'
function_id: 'GV'
function_name: 'GOVERN'
category_id: 'GV.SC'
category_name: 'Cybersecurity Supply Chain Risk Management'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06'
score: 6
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name:
---

# GV.SC-10 — Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement

## Description

Cybersecurity supply chain risk management plans include provisions for activities that occur after the conclusion of a partnership or service agreement

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 5 | 5 | Complete | Yes | Yes | Yes | 20-Jan |
| Q2 | 6 | 5 | Complete | No | Yes | Yes | 15-Apr |
| Q3 | 6 | 5 | In Progress | No | Yes | No | 11-Jun |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Comprehensive offboarding checklist implemented. Supplier access termination procedures documented. Access reviews conducted upon contract termination.

**Q2 observations**

Automated access deactivation within 24 hours for terminated suppliers. Sample audits confirm compliance. Offboarding process integrated with procurement workflow.

## NIST 800-53 References

PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06

## Test Procedures

1. Inquiry: CISO, Procurement, 2. Inspect offboarding checklist, 3. Inspect sample of terminated supplier accounts

## Implementation Examples

- **Ex1:** Establish processes for terminating critical relationships under both normal and adverse circumstances

  PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex2:** Define and implement plans for component end-of-life maintenance support and obsolescence

  PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex3:** Verify that supplier access to organization resources is deactivated promptly when it is no longer needed

  Supplier offboarding is managed through a comprehensive checklist integrated with the procurement workflow. Access termination is automated to complete within 24 hours of contract end. The process includes: (1) access review across all systems, (2) credential revocation in SSO, (3) removal from Slack and collaboration tools, (4) audit trail documentation. Sample audits verify compliance.
- **Ex4:** Verify that assets containing the organization's data are returned or properly disposed of in a timely, controlled, and safe manner

  PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex5:** Develop and execute a plan for terminating or transitioning supplier relationships that takes supply chain security risk and resiliency into account

  PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex6:** Mitigate risks to data and systems created by supplier termination

  PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex7:** Manage data leakage risks associated with supplier termination

  PM-31,RA-03,RA-05,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
