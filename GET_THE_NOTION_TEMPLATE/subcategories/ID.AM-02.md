---
id: 'ID.AM-02'
function_id: 'ID'
function_name: 'IDENTIFY'
category_id: 'ID.AM'
category_name: 'Asset Management'
in_scope: 'Yes'
owner: 'chris.magann <chris.magann@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'AC-20,CM-08,PM-05,SA-05,SA-09'
score: 3
target_score: 5
minimum_target: 5
remediation_owner: 'chris.magann <chris.magann@almasecurity.com>'
remediation_due: '2026-10-31'
artifact_name:
---

# ID.AM-02 — Inventories of software, services, and systems managed by the organization are maintained

## Description

Inventories of software, services, and systems managed by the organization are maintained

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | Yes | 08-Feb |
| Q2 | 3 | 5 | Complete | Yes | Yes | No | 04-May |
| Q3 | 3 | 5 | Not Started | No | No | No | — |
| Q4 | 3 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Software inventory 70% complete. AWS assets tracked via native tools. Asset inventory system requirements documented (STS4).

**Q2 observations**

Inventory improving with 85% coverage. Cloud assets continuously tracked. Asset inventory system procurement aligned with ASM vendor selection.

## NIST 800-53 References

AC-20,CM-08,PM-05,SA-05,SA-09

## Test Procedures

1. Inquiry: CISO, CIO, 2. Inspect software inventory, 3. Observe discovery scans

## Implementation Examples

- **Ex1:** Maintain inventories for all types of software and services, including commercial-off-the-shelf, open-source, custom applications, API services, and cloud-based applications and services

  AC-20,CM-08,PM-05,SA-05,SA-09
- **Ex2:** Constantly monitor all platforms, including containers and virtual machines, for software and service inventory changes

  Software inventory is maintained through: (1) AWS native tools for cloud asset tracking (85% coverage), (2) discovery scans for on-premises systems, (3) container and VM monitoring via Kubernetes native capabilities. Asset inventory system procurement aligns with ASM vendor selection (STS4) to achieve comprehensive coverage.
- **Ex3:** Maintain an inventory of the organization's systems

  AC-20,CM-08,PM-05,SA-05,SA-09

## Remediation / Action Plan

Complete asset inventory system procurement aligned with ASM vendor (STS4). Achieve 95% software inventory coverage. Implement continuous monitoring for container and VM inventory changes.
