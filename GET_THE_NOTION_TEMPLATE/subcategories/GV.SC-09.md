---
id: 'GV.SC-09'
function_id: 'GV'
function_name: 'GOVERN'
category_id: 'GV.SC'
category_name: 'Cybersecurity Supply Chain Risk Management'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'PM-09,PM-19,PM-28,PM-30,PM-31,RA-03,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06'
score: 6
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name:
---

# GV.SC-09 — Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle

## Description

Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 5 | 5 | Complete | Yes | Yes | Yes | 21-Jan |
| Q2 | 6 | 5 | Complete | No | Yes | Yes | 16-Apr |
| Q3 | 6 | 5 | In Progress | No | Yes | No | 12-Jun |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Supply chain security practices documented in cybersecurity policy. Critical hardware change verification procedures established. Integration with ERM program initiated.

**Q2 observations**

Full ERM integration achieved. Hardware change verification automated where possible. Lifecycle monitoring operational for critical technology products.

## NIST 800-53 References

PM-09,PM-19,PM-28,PM-30,PM-31,RA-03,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06

## Test Procedures

1. Inquiry: CISO, CIO, 2. Inspect cybersecurity policy, 3. Inspect change management policy

## Implementation Examples

- **Ex1:** Policies and procedures require provenance records for all acquired technology products and services

  PM-09,PM-19,PM-28,PM-30,PM-31,RA-03,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex2:** Periodically provide risk reporting to leaders about how acquired components are proven to be untampered and authentic

  PM-09,PM-19,PM-28,PM-30,PM-31,RA-03,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex3:** Communicate regularly among cybersecurity risk managers and operations personnel about the need to acquire software patches, updates, and upgrades only from authenticated and trustworthy software providers

  PM-09,PM-19,PM-28,PM-30,PM-31,RA-03,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex4:** Review policies to ensure that they require approved supplier personnel to perform maintenance on supplier products

  PM-09,PM-19,PM-28,PM-30,PM-31,RA-03,RA-07,SA-04,SA-09,SR-02,SR-03,SR-05,SR-06
- **Ex5:** Policies and procedure require checking upgrades to critical hardware for unauthorized changes

  Supply chain security is integrated into the ERM program through: (1) cybersecurity policy requirements for hardware change verification, (2) change management procedures for critical infrastructure upgrades, (3) lifecycle monitoring for technology products. Hardware changes are verified against authorized baselines, with automation deployed where possible through AWS Config and infrastructure-as-code.

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
