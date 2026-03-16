# PR.IR-04: Adequate Resource Capacity — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Kubernetes auto-scaling configurations, AWS resource utilization dashboards, DDoS protection status, WAF project documentation |
| Interview | Yes | Interviewed infrastructure lead on capacity planning practices, scaling decisions, and DDoS readiness |
| Test | No | Load testing or DDoS simulation not performed; reviewed auto-scaling configuration and historical scaling events |

---

## Findings

### Strengths

- **Kubernetes auto-scaling operational** — Horizontal Pod Autoscalers dynamically adjust pod counts based on CPU and memory utilization, providing reactive capacity management for production workloads
- **AWS node auto-scaling configured** — Worker nodes scale in response to pod scheduling demand, extending capacity beyond pod-level scaling
- **AWS Shield Standard active** — Baseline Layer 3/4 DDoS protection is automatically applied to all AWS resources
- **Resource utilization monitoring in place** — CloudWatch and infrastructure monitoring dashboards track CPU, memory, and storage utilization with alerting

### Gaps

- **No formal capacity planning process** — Capacity management is entirely reactive through auto-scaling; no proactive forecasting, growth modeling, or capacity reviews are performed
- **No capacity model for business growth** — The relationship between customer growth (targeting 10,000 customers), feature deployment, and infrastructure resource requirements is not modeled
- **No WAF for application-layer DDoS mitigation** — AWS Shield Standard only protects against volumetric Layer 3/4 attacks; application-layer (Layer 7) DDoS attacks are not mitigated; WAF project ($112K) in progress
- **No DDoS response runbook** — Procedures for responding to an active DDoS attack are not documented, including escalation paths and decision criteria for engaging AWS Shield Advanced
- **No rate limiting** — Neither the load balancer nor the application layer enforces rate limiting, leaving the platform vulnerable to request flooding
- **On-premises capacity not documented** — Physical capacity constraints (rack space, power, cooling) for the Redwood City data center are not formally assessed
- **Log storage capacity not assessed** — Retention requirements versus available storage for audit and investigation logs have not been evaluated
- **Windows Server 2012 R2 capacity limitations** — Legacy fileserver may present storage and performance constraints given its age; Q3 upgrade planned

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3.5 |
| Target Score | 5 |

---

## Evidence Reviewed

- Kubernetes Horizontal Pod Autoscaler configurations for production workloads
- AWS Auto Scaling Group configurations for EKS node groups
- CloudWatch resource utilization dashboards (CPU, memory, storage, network)
- Historical auto-scaling events (6-month lookback)
- AWS Shield Standard activation status
- WAF Install project charter and DDoS mitigation scope ($112K)
- Load balancer configuration (no rate limiting confirmed)
- Redwood City DC infrastructure inventory

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Establish a quarterly capacity planning review that correlates business growth projections with infrastructure resource requirements | High | Tigan Wang |
| 2 | Deploy WAF with rate limiting and application-layer DDoS mitigation rules as part of the WAF Install project | High | Tigan Wang |
| 3 | Develop and test a DDoS response runbook including escalation criteria and AWS Shield Advanced engagement procedures | High | Nadia Khan |
| 4 | Implement rate limiting at the ALB or application layer as an interim measure before WAF deployment | High | Tigan Wang |
| 5 | Develop a capacity model linking customer growth targets to compute, storage, and network projections | Medium | Tigan Wang |
| 6 | Document Redwood City DC physical capacity and incorporate into capacity planning | Medium | Tigan Wang |
| 7 | Assess log storage capacity against retention and audit requirements (AU-04) | Medium | Nadia Khan |
