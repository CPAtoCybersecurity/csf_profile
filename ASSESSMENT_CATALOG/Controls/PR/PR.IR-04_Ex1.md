# PR.IR-04_Ex1: Capacity Planning

**Subcategory:** PR.IR-04 — Adequate resource capacity to ensure availability is maintained

**NIST SP 800-53 Ref:** AU-04, CP-02, PE-11, SC-05

## Implementation Example

> Ex1: Capacity planning is performed to ensure that technology resources can meet current and projected demand, preventing availability degradation due to resource exhaustion.

## Alma Security Implementation

Alma uses Kubernetes Horizontal Pod Autoscalers and AWS node auto-scaling to manage cloud capacity reactively based on CPU/memory thresholds. No formal capacity planning process exists to project future requirements from business growth, roadmap changes, or seasonal patterns. On-premises capacity at the Redwood City data center is not formally documented, and log storage capacity has not been assessed against retention requirements.

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
