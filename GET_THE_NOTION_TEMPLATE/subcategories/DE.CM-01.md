---
id: 'DE.CM-01'
function_id: 'DE'
function_name: 'DETECT'
category_id: 'DE.CM'
category_name: 'Continuous Monitoring'
in_scope: 'Yes'
owner: 'tigan.wang <tigan.wang@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'AC-02,AU-12,CA-07,CM-03,SC-05,SC-07,SI-04'
score: 4
target_score: 5
minimum_target: 5
remediation_owner: 'tigan.wang <tigan.wang@almasecurity.com>'
remediation_due: '2026-08-31'
artifact_name: 'SOC-Ticket-1004'
---

# DE.CM-01 — Networks and network services are monitored to find potentially adverse events

## Description

Networks and network services are monitored to find potentially adverse events

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | No | Yes | Yes | 28-Jan |
| Q2 | 4 | 5 | Complete | Yes | Yes | Yes | 23-Apr |
| Q3 | 4 | 5 | Submitted | No | Yes | No | 19-Jun |
| Q4 | 4 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Network monitoring via CloudTrail and VPC Flow Logs. DNS monitoring configured. External perimeter visibility limited pending ASM deployment.

**Q2 observations**

ASM vendor selected (addressing R2). DNS/BGP monitoring operational. Network service monitoring dashboards deployed. Coverage expanding per implementation plan.

## NIST 800-53 References

AC-02,AU-12,CA-07,CM-03,SC-05,SC-07,SI-04

## Test Procedures

1. Inquiry: CISO, Network Ops, 2. Inspect network monitoring policy, 3. Observe SOC dashboards

## Implementation Examples

- **Ex1:** Monitor DNS, BGP, and other network services for adverse events

  Network monitoring is performed through: (1) CloudTrail for API activity, (2) VPC Flow Logs for network traffic, (3) DNS query logging. The selected ASM vendor (addressing R2) will provide external perimeter monitoring. SOC dashboards display network service status with alerting for anomalies. Coverage expands per the implementation plan.
- **Ex2:** Monitor wired and wireless networks for connections from unauthorized endpoints

  AC-02,AU-12,CA-07,CM-03,SC-05,SC-07,SI-04
- **Ex3:** Monitor facilities for unauthorized or rogue wireless networks

  AC-02,AU-12,CA-07,CM-03,SC-05,SC-07,SI-04
- **Ex4:** Compare actual network flows against baselines to detect deviations

  AC-02,AU-12,CA-07,CM-03,SC-05,SC-07,SI-04
- **Ex5:** Monitor network communications to identify changes in security postures for zero trust purposes

  AC-02,AU-12,CA-07,CM-03,SC-05,SC-07,SI-04

## Remediation / Action Plan

Complete ASM solution deployment and integration. Expand DNS/BGP monitoring coverage to all network segments. Deploy network service monitoring dashboards to SOC. Address R2 risk register item.
