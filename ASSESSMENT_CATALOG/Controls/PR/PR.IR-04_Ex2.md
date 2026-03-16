# PR.IR-04_Ex2: DDoS Mitigation

**Subcategory:** PR.IR-04 — Adequate resource capacity to ensure availability is maintained

**NIST SP 800-53 Ref:** CP-02, SC-05

## Implementation Example

> Ex2: Distributed Denial of Service (DDoS) mitigation capabilities are implemented to protect internet-facing services from volumetric and application-layer attacks that could exhaust resource capacity.

## Alma Security Implementation

Alma has AWS Shield Standard providing baseline Layer 3/4 DDoS protection across all accounts. No WAF is deployed for Layer 7 protection -- the WAF Install project ($112K, in progress) will add rate limiting and request filtering. No DDoS response runbook exists, rate limiting is not configured at the ALB layer, and AWS Shield Advanced has not been evaluated.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS Shield Standard status | AWS Console | 2026-03-01 |
| WAF Install project documentation | Project management system | 2026-03-01 |
| Kubernetes auto-scaling configuration | GitOps repository / HPA settings | 2026-02-28 |
| Load balancer configuration | AWS ALB settings | 2026-02-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No WAF for application-layer DDoS protection | Vulnerable to Layer 7 attacks that bypass Shield Standard | Complete WAF Install project with DDoS mitigation rules | Tigan Wang | 2026-06-30 |
| No DDoS response runbook | Uncoordinated response during an active DDoS attack | Develop and test DDoS response runbook including escalation to AWS Shield Advanced | Nadia Khan | 2026-07-31 |
| No rate limiting at application or load balancer layer | Application resources can be exhausted by high-volume legitimate-appearing requests | Implement rate limiting as part of WAF deployment or ALB configuration | Tigan Wang | 2026-06-30 |
| AWS Shield Advanced not evaluated | May need advanced protection for business-critical SaaS platform | Evaluate AWS Shield Advanced cost/benefit for Alma's threat profile | Tigan Wang | 2026-08-31 |
