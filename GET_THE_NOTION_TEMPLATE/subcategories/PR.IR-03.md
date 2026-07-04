---
id: 'PR.IR-03'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.IR'
category_name: 'Technology Infrastructure Resilience'
in_scope: 'Yes'
owner: 'tigan.wang <tigan.wang@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'CP,IR,SA-08,SC-06,SC-24,SC-36,SC-39,SI-13'
score: 4
target_score: 5
minimum_target: 5
remediation_owner: 'tigan.wang <tigan.wang@almasecurity.com>'
remediation_due: '2026-09-30'
artifact_name:
---

# PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

## Description

Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 3 | 5 | Complete | No | Yes | Yes | 31-Jan |
| Q2 | 4 | 5 | Complete | Yes | Yes | Yes | 26-Apr |
| Q3 | 4 | 5 | Submitted | No | Yes | No | 22-Jun |
| Q4 | 4 | 5 | Not Started | No | No | No | — |

**Q1 observations**

AWS provides multi-AZ redundancy. Kubernetes infrastructure configured for resilience. HA components deployed for critical workloads.

**Q2 observations**

Resilience mechanisms documented and tested. Failover testing completed successfully. DR plan development progressing as part of cloud security optimization project.

## NIST 800-53 References

CP,IR,SA-08,SC-06,SC-24,SC-36,SC-39,SI-13

## Test Procedures

1. Inquiry: CISO, IT Ops, 2. Inspect HA/DR plans, 3. Observe failover tests

## Implementation Examples

- **Ex1:** Avoid single points of failure in systems and infrastructure

  CP,IR,SA-08,SC-06,SC-24,SC-36,SC-39,SI-13
- **Ex2:** Use load balancing to increase capacity and improve reliability

  CP,IR,SA-08,SC-06,SC-24,SC-36,SC-39,SI-13
- **Ex3:** Use high-availability components like redundant storage and power supplies to improve system reliability

  Resilience is achieved through: (1) AWS multi-AZ deployment for production workloads, (2) Kubernetes infrastructure with pod redundancy and auto-scaling, (3) redundant storage and compute for critical systems. Failover testing validates recovery capabilities. DR plan development continues as part of the Cloud Security Optimization project ($100K).

## Remediation / Action Plan

Complete DR plan development under Cloud Security Optimization project. Conduct additional failover testing scenarios. Document and test recovery procedures for all critical workloads.
