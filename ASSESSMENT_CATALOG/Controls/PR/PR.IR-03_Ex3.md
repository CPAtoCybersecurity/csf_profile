# PR.IR-03_Ex3: High-Availability Components

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-07, SA-08, SC-06, SC-24

## Implementation Example

> Ex3: High-availability components and architectures are used for critical systems to minimize downtime and ensure continuous service delivery during normal operations and adverse conditions.

## Alma Security Implementation

Alma runs a multi-AZ Kubernetes cluster with pod replica sets, auto-scaling, health checks, readiness probes, and ALB traffic distribution across healthy targets. Redundant storage and compute are provisioned for critical systems, and failover testing has validated the architecture. SLA/SLO targets for availability are not formally documented, availability metrics are not reported to business stakeholders, and on-premises HA does not match cloud resilience levels.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Kubernetes cluster multi-AZ configuration | AWS EKS / IaC repository | 2026-02-20 |
| Pod replica set and HPA configurations | GitOps repository | 2026-02-28 |
| Auto-scaling policy configurations | Kubernetes HPA / AWS ASG settings | 2026-02-28 |
| Load balancer and health check settings | AWS ALB configuration | 2026-02-20 |
| Redundant storage configuration | AWS EBS / EFS settings | 2026-02-15 |
| Failover test validation results | Infrastructure team documentation | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | Approaching Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal SLA/SLO targets for availability | Cannot measure whether HA architecture meets business expectations | Define and publish SLA/SLO targets for production availability | Tigan Wang | 2026-06-15 |
| Availability metrics not reported to stakeholders | Business leadership lacks visibility into system resilience | Implement availability reporting dashboard and monthly business reporting | Tigan Wang | 2026-07-31 |
| On-premises HA not equivalent to cloud | Redwood City DC components represent lower resilience tier | Assess on-premises HA requirements and document accepted risk or remediation plan | Tigan Wang | 2026-08-31 |
