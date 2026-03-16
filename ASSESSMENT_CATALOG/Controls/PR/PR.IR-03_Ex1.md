# PR.IR-03_Ex1: Redundancy and Failover

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-06, CP-07, CP-08, CP-09, CP-10, IR-04, SA-08, SC-06, SC-24

## Implementation Example

> Ex1: Redundancy and failover mechanisms are used for critical technology assets to ensure continuity of service when primary components fail.

## Alma Security Implementation

Alma deploys its production SaaS platform on AWS using a multi-AZ Kubernetes cluster with replica sets, auto-scaling, and load balancers that route around failed instances. Failover testing has been completed to validate resilience. Failover test results lack formal documentation (scenarios, criteria, recovery times), and no recurring testing cadence is defined.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Multi-AZ deployment configuration | AWS Console / IaC repository | 2026-02-20 |
| Kubernetes replica set configurations | GitOps repository | 2026-02-28 |
| Failover test results | Infrastructure team documentation | 2026-02-15 |
| Load balancer health check configuration | AWS ALB settings | 2026-02-20 |
| Auto-scaling policy configurations | Kubernetes HPA / AWS ASG settings | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | Approaching Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Failover test results not formally documented | Cannot demonstrate validated failover to auditors or stakeholders | Create formal failover test report with scenarios, criteria, and observed recovery times | Tigan Wang | 2026-05-15 |
| Failover testing cadence not defined | One-time testing does not account for infrastructure changes over time | Establish semi-annual failover testing schedule | Tigan Wang | 2026-06-30 |
| On-premises redundancy not equivalent to cloud | Redwood City DC lacks equivalent multi-site resilience | Evaluate on-premises resilience requirements as part of DR planning | Tigan Wang | 2026-07-31 |
