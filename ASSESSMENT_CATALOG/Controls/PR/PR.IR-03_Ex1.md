# PR.IR-03_Ex1: Redundancy and Failover

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-06, CP-07, CP-08, CP-09, CP-10, IR-04, SA-08, SC-06, SC-24

## Implementation Example

> Ex1: Redundancy and failover mechanisms are used for critical technology assets to ensure continuity of service when primary components fail.

## Alma Security Implementation

Alma Security deploys its production SaaS platform on AWS using a multi-Availability Zone architecture that distributes workloads across physically separate data center facilities within the same AWS region. This design ensures that the failure of a single AZ — whether from power loss, network disruption, or environmental incident — does not cause a complete service outage. The Kubernetes cluster spans multiple AZs, with worker nodes distributed to maintain compute capacity even if one zone becomes unavailable.

Within the Kubernetes environment, pod redundancy is achieved through replica sets that maintain multiple instances of each critical service. If a pod fails health checks, Kubernetes automatically terminates it and schedules a replacement. Load balancers distribute traffic across healthy pods, and services automatically route around failed instances. The auto-scaling configuration allows the cluster to increase pod counts in response to demand, providing both performance scaling and a form of redundancy through excess capacity.

Failover testing has been completed, which demonstrates that the infrastructure team has validated the architecture's resilience claims rather than relying on theoretical design alone. This is a meaningful indicator of operational maturity. However, the failover testing results should be documented with specific scenarios tested, success criteria, recovery times observed, and any issues encountered during testing. Redundant storage and compute for critical systems are provisioned, though the specific configurations and recovery characteristics should be documented in the DR plan currently under development.

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
