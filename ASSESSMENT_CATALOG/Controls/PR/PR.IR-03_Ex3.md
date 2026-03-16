# PR.IR-03_Ex3: High-Availability Components

**Subcategory:** PR.IR-03 — Mechanisms are implemented to achieve resilience requirements in normal and adverse situations

**NIST SP 800-53 Ref:** CP-02, CP-07, SA-08, SC-06, SC-24

## Implementation Example

> Ex3: High-availability components and architectures are used for critical systems to minimize downtime and ensure continuous service delivery during normal operations and adverse conditions.

## Alma Security Implementation

Alma Security has implemented high-availability components across its AWS Kubernetes production environment as a core architectural principle. The multi-AZ Kubernetes cluster ensures that control plane components and worker nodes are distributed across physically separated AWS facilities. Pod redundancy through replica sets maintains multiple running instances of each critical microservice, with Kubernetes automatically rescheduling failed pods to healthy nodes. Auto-scaling is configured to dynamically adjust pod and node counts based on resource utilization, ensuring that capacity increases in response to demand rather than requiring manual intervention.

Redundant storage and compute resources are provisioned for critical systems, ensuring that the loss of individual storage volumes or compute instances does not result in service degradation. The AWS Elastic Load Balancer distributes incoming traffic across healthy targets and automatically removes unhealthy instances from the target group. Health checks and readiness probes are configured to detect application-level failures, not just infrastructure-level issues, enabling faster detection and recovery from service degradation.

This is an area of relative strength for Alma Security. The combination of multi-AZ deployment, pod redundancy, auto-scaling, and validated failover testing indicates that the infrastructure team has thoughtfully designed for high availability. The primary gaps are around formalization: SLA/SLO targets for availability are not formally documented, availability metrics are not systematically reported to business stakeholders, and the high-availability architecture for the Redwood City on-premises components does not match the resilience of the cloud environment.

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
