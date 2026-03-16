# PR.IR-04_Ex1: Capacity Planning

**Subcategory:** PR.IR-04 — Adequate resource capacity to ensure availability is maintained

**NIST SP 800-53 Ref:** AU-04, CP-02, PE-11, SC-05

## Implementation Example

> Ex1: Capacity planning is performed to ensure that technology resources can meet current and projected demand, preventing availability degradation due to resource exhaustion.

## Alma Security Implementation

Alma Security relies primarily on Kubernetes auto-scaling as its capacity management mechanism for cloud-hosted production workloads. Horizontal Pod Autoscalers (HPAs) are configured to scale pod counts based on CPU and memory utilization thresholds, and AWS node auto-scaling adds worker nodes to the Kubernetes cluster when pod scheduling demand exceeds available capacity. This reactive auto-scaling provides effective real-time capacity management for incremental demand changes and predictable traffic patterns.

However, Alma Security does not maintain a formal capacity planning process that projects future resource requirements based on business growth forecasts, product roadmap changes, or seasonal traffic patterns. Capacity decisions are made reactively — auto-scaling handles immediate demand, and the infrastructure team provisions additional baseline capacity when monitoring indicates sustained growth. There is no documented capacity model that correlates customer count growth (currently targeting 10,000 customers), feature deployment impact, or data volume growth with infrastructure resource requirements.

For the Redwood City on-premises data center, capacity planning is even less formalized. Physical constraints — rack space, power capacity, cooling capacity, network port availability — require longer lead times than cloud resources and cannot be addressed through auto-scaling. The Windows Server 2012 R2 fileserver, scheduled for Q3 upgrade, represents a capacity constraint both in terms of the server's aging hardware limitations and the storage capacity available on the platform. Log storage capacity and retention policies should also be evaluated to ensure adequate capacity for audit and investigation needs per AU-04 requirements.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Kubernetes HPA configurations | GitOps repository | 2026-02-28 |
| AWS node auto-scaling configuration | AWS ASG settings | 2026-02-28 |
| Resource utilization monitoring dashboards | CloudWatch / monitoring platform | 2026-03-01 |
| Historical resource utilization data | CloudWatch metrics (6-month lookback) | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal capacity planning process | Capacity surprises not anticipated; reactive-only posture | Establish quarterly capacity planning review that correlates business growth with resource projections | Tigan Wang | 2026-06-30 |
| No capacity model for growth forecasting | Cannot project when infrastructure thresholds will be reached | Develop capacity model linking customer growth targets to compute, storage, and network requirements | Tigan Wang | 2026-07-31 |
| On-premises capacity constraints not documented | Physical capacity limitations may cause unexpected constraints | Document Redwood City DC capacity (rack, power, cooling, network) and plan for Windows 2012 R2 replacement | Tigan Wang | 2026-06-15 |
| Log storage capacity not assessed against retention requirements | May lose audit data prematurely or incur unexpected storage costs | Review log retention policies and verify storage capacity meets AU-04 requirements | Nadia Khan | 2026-05-31 |
