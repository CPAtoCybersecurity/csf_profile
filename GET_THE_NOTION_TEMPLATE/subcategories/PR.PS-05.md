---
id: 'PR.PS-05'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.PS'
category_name: 'Platform Security'
in_scope: 'Yes'
owner: 'tigan.wang <tigan.wang@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CM-07(02),CM-07(04),CM-07(05),SC-34'
score: 7
target_score: 5
minimum_target: 5
remediation_owner: 'tigan.wang <tigan.wang@almasecurity.com>'
remediation_due: '2026-08-15'
artifact_name:
---

# PR.PS-05 — Installation and execution of unauthorized software are prevented

## Description

Installation and execution of unauthorized software are prevented

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | No | Yes | Yes | 02-Feb |
| Q2 | 4 | 5 | Complete | Yes | Yes | Yes | 28-Apr |
| Q3 | 7 | 5 | Submitted | No | Yes | No | 24-Jun |
| Q4 | 7 | 5 | Not Started | No | No | No | — |

**Q1 observations**

SentinelOne deployed on workstations/laptops with application control. Server-side controls being evaluated.

**Q2 observations**

App control policy approved and deployed. SentinelOne enforcement expanded. Kubernetes node SSH access remediation in progress (shared key to be replaced).

## NIST 800-53 References

CM-07(02),CM-07(04),CM-07(05),SC-34

## Test Procedures

1. Inquiry: CISO, IT Ops, 2. Inspect app control policy, 3. Inspect sample of system configs

## Implementation Examples

- **Ex1:** When risk warrants it, restrict software execution to permitted products only or deny the execution of prohibited and unauthorized software

  Unauthorized software prevention is implemented through: (1) SentinelOne application control on workstations and laptops, (2) app control policy defining permitted software, (3) Kubernetes node restrictions (shared SSH key remediation in progress). Server-side controls expand SentinelOne enforcement. Policy exceptions require CISO approval.
- **Ex2:** Verify the source of new software and the software's integrity before installing it

  CM-07(02),CM-07(04),CM-07(05),SC-34
- **Ex3:** Configure platforms to use only approved DNS services that block access to known malicious domains

  CM-07(02),CM-07(04),CM-07(05),SC-34
- **Ex4:** Configure platforms to allow the installation of organization-approved software only

  CM-07(02),CM-07(04),CM-07(05),SC-34

## Remediation / Action Plan

Remediate shared developer SSH key on Kubernetes nodes - issue individual keys per developer. Expand server-side application control deployment. Complete app control policy exception review.
