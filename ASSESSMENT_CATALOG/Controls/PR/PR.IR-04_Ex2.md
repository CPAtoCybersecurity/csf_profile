# PR.IR-04_Ex2: DDoS Mitigation

**Subcategory:** PR.IR-04 — Adequate resource capacity to ensure availability is maintained

**NIST SP 800-53 Ref:** CP-02, SC-05

## Implementation Example

> Ex2: Distributed Denial of Service (DDoS) mitigation capabilities are implemented to protect internet-facing services from volumetric and application-layer attacks that could exhaust resource capacity.

## Alma Security Implementation

Alma Security has limited DDoS mitigation capabilities as of Q1 2026. AWS Shield Standard is automatically included with all AWS accounts and provides protection against common Layer 3/4 DDoS attacks (SYN floods, UDP reflection attacks, and similar volumetric attacks). This baseline protection operates transparently and does not require configuration by the Alma infrastructure team. However, AWS Shield Standard provides only basic volumetric protection and does not address application-layer (Layer 7) DDoS attacks.

The absence of a Web Application Firewall (WAF) represents the most significant DDoS mitigation gap. Without a WAF, Alma's internet-facing SaaS platform lacks protection against application-layer attacks — HTTP floods, slowloris attacks, and sophisticated request patterns designed to overwhelm application resources while appearing as legitimate traffic. The WAF Install project ($112K budget, currently in progress) will address this gap by providing rate limiting, request filtering, and bot mitigation capabilities. Until the WAF is deployed, the Kubernetes auto-scaling configuration is the primary defense against traffic spikes, but auto-scaling as a DDoS response is both expensive and finite — attackers can sustain traffic volumes that exceed auto-scaling limits and budget thresholds.

There is no documented DDoS response runbook that defines escalation procedures, traffic analysis steps, communication protocols, or decisions to engage AWS Shield Advanced or third-party DDoS mitigation services during an active attack. Rate limiting at the application or load balancer layer has not been confirmed. For a continuous authentication SaaS platform, service availability is directly tied to revenue and customer trust, making DDoS resilience a business-critical capability.

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
