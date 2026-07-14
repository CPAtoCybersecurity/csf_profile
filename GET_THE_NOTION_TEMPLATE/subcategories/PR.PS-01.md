---
id: 'PR.PS-01'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.PS'
category_name: 'Platform Security'
in_scope: 'Yes'
owner: 'chris.magann <chris.magann@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CM-01,CM-02,CM-03,CM-04,CM-05,CM-06,CM-07,CM-08,CM-09,CM-10,CM-11'
score: 6
target_score: 5
minimum_target: 5
remediation_owner: 'chris.magann <chris.magann@almasecurity.com>'
remediation_due: '2026-08-31'
artifact_name:
---

# PR.PS-01 — Configuration management practices are established and applied

## Description

Configuration management practices are established and applied

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 3 | 5 | Complete | Yes | Yes | Yes | 01-Feb |
| Q2 | 4 | 5 | Complete | Yes | Yes | Yes | 27-Apr |
| Q3 | 6 | 5 | Submitted | No | Yes | No | 23-Jun |
| Q4 | 6 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Configuration baselines established for Amazon Linux 2 and Ubuntu. Windows 2012 fileserver remediation planned. Baseline compliance monitored.

**Q2 observations**

Config management policy enforced. Hardened baselines deployed to 95% of systems. Legacy Windows 2012 upgrade project initiated with Q3 completion target.

## NIST 800-53 References

CM-01,CM-02,CM-03,CM-04,CM-05,CM-06,CM-07,CM-08,CM-09,CM-10,CM-11

## Test Procedures

1. Inquiry: CISO, IT Ops, 2. Inspect config mgmt policy, 3. Inspect sample of baselines

## Implementation Examples

- **Ex1:** Establish, test, deploy, and maintain hardened baselines that enforce the organization's cybersecurity policies and provide only essential capabilities (i.e., principle of least functionality)

  Configuration management includes: (1) hardened baselines for Amazon Linux 2 and Ubuntu documented and enforced via automation, (2) baseline compliance monitoring through AWS Config, (3) deviation alerting and remediation tracking. Legacy Windows 2012 fileserver upgrade is planned for Q3. 95% of systems deployed to hardened baselines.
- **Ex2:** Review all default configuration settings that may potentially impact cybersecurity when installing or upgrading software

  CM-01,CM-02,CM-03,CM-04,CM-05,CM-06,CM-07,CM-08,CM-09,CM-10,CM-11
- **Ex3:** Monitor implemented software for deviations from approved baselines

  CM-01,CM-02,CM-03,CM-04,CM-05,CM-06,CM-07,CM-08,CM-09,CM-10,CM-11

## Remediation / Action Plan

Complete Windows 2012 fileserver upgrade to supported OS version. Extend hardened baseline deployment to remaining 5% of systems. Implement automated baseline compliance remediation.
