# PR.IR-03: Resilience Mechanisms — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed multi-AZ architecture, Kubernetes deployment configurations, auto-scaling policies, failover test results, DR project documentation |
| Interview | Yes | Interviewed infrastructure lead on failover testing outcomes, DR plan development status, and Cloud Security Optimization project scope |
| Test | Partial | Reviewed failover test results conducted by infrastructure team; independent failover validation not performed this quarter |

---

## Findings

### Strengths

- **Multi-AZ deployment validated** — Production workloads distributed across multiple AWS Availability Zones, providing geographic resilience against single-zone failures
- **Kubernetes pod redundancy operational** — Replica sets maintain multiple instances of critical services with automatic rescheduling on failure
- **Auto-scaling configured** — Horizontal Pod Autoscalers dynamically adjust capacity based on utilization, providing both performance scaling and resilience through capacity headroom
- **Failover testing completed** — The infrastructure team has actually tested failover rather than assuming the architecture works as designed; this is a strong operational maturity indicator
- **Redundant storage and compute provisioned** — Critical systems have dedicated redundant resources
- **High-availability components are a design principle** — The architecture reflects intentional HA design rather than afterthought

### Gaps

- **DR plan not yet complete** — The disaster recovery plan is in development as part of the Cloud Security Optimization project ($100K budget), but no approved plan exists as of Q1 2026
- **RTO/RPO not formally defined** — Recovery objectives have not been documented or agreed upon with business stakeholders, making it impossible to measure DR readiness
- **Failover test results not formally documented** — While testing was performed, formal documentation of scenarios tested, success criteria, observed recovery times, and lessons learned is limited
- **No failover testing cadence established** — Testing was performed but no recurring schedule ensures continued validation as infrastructure evolves
- **No DR tabletop exercise** — Coordination-level disaster recovery has not been tested; only technical failover has been validated
- **On-premises resilience gap** — Redwood City data center does not have equivalent multi-site resilience capabilities

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4.5 |
| Target Score | 6 |

---

## Evidence Reviewed

- AWS multi-AZ deployment configuration for production VPCs and EKS cluster
- Kubernetes deployment manifests showing replica counts, anti-affinity rules, and HPA configurations
- Auto-scaling policy configurations (HPA and AWS ASG)
- Failover test results from infrastructure team
- Cloud Security Optimization project charter ($100K budget)
- DR plan draft (early development stage)
- Load balancer health check and target group configurations
- Redundant storage configuration (EBS, EFS)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Complete the DR plan as part of the Cloud Security Optimization project with defined RTO/RPO for all Tier 1 systems | High | Tigan Wang |
| 2 | Formally document failover test results including scenarios, success criteria, recovery times observed, and issues encountered | High | Tigan Wang |
| 3 | Establish a semi-annual failover testing cadence tied to infrastructure change milestones | Medium | Tigan Wang |
| 4 | Conduct a DR tabletop exercise after the DR plan is completed to validate coordination procedures | Medium | Tigan Wang |
| 5 | Validate backup schedules against defined RPOs once recovery objectives are established | Medium | Tigan Wang |
| 6 | Assess on-premises resilience requirements and document accepted risk or remediation plan for Redwood City DC | Medium | Tigan Wang |
