---
id: 'PR.DS-10'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.DS'
category_name: 'Data Security'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'AC-02,AC-03,AC-04,AU-09,AU-13,CA-03,CP-09,SA-08,SC-04,SC-07,SC-11,SC-13,SC-24,SC-32,SC-39,SC-40,SC-43,SI-03,SI-04,SI-07,SI-10,SI-16'
score: 5
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name:
---

# PR.DS-10 — The confidentiality, integrity, and availability of data-in-use are protected

## Description

The confidentiality, integrity, and availability of data-in-use are protected

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 3 | 5 | Complete | Yes | Yes | No | 16-Feb |
| Q2 | 5 | 5 | Complete | Yes | Yes | Yes | 12-May |
| Q3 | 5 | 5 | In Progress | No | No | No | — |
| Q4 | 5 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Data-in-use protection requirements documented. Memory handling procedures established. Source code review process initiated for sensitive applications.

**Q2 observations**

Data handling procedures enforced. Sensitive data retention limits implemented. Application owner attestations collected. Source code reviews completed for crown jewels.

## NIST 800-53 References

AC-02,AC-03,AC-04,AU-09,AU-13,CA-03,CP-09,SA-08,SC-04,SC-07,SC-11,SC-13,SC-24,SC-32,SC-39,SC-40,SC-43,SI-03,SI-04,SI-07,SI-10,SI-16

## Test Procedures

1. Inquiry: CISO, App Owners, 2. Inspect data handling procedures, 3. Inspect sample of source code

## Implementation Examples

- **Ex1:** Remove data that must remain confidential (e.g., from processors and memory) as soon as it is no longer needed

  Data-in-use protection includes: (1) memory handling procedures for sensitive applications, (2) sensitive data retention limits enforced via application controls, (3) source code reviews for crown jewel systems verifying secure data handling. Application owners provide attestations. Biometric data handling receives enhanced scrutiny per SG1.
- **Ex2:** Protect data in use from access by other users and processes of the same platform

  AC-02,AC-03,AC-04,AU-09,AU-13,CA-03,CP-09,SA-08,SC-04,SC-07,SC-11,SC-13,SC-24,SC-32,SC-39,SC-40,SC-43,SI-03,SI-04,SI-07,SI-10,SI-16

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
