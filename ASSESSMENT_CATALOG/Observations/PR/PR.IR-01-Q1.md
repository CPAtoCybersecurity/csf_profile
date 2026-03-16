# PR.IR-01: Network Protection from Unauthorized Logical Access — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed network architecture diagrams, firewall rulebases, AWS Security Group configurations, VPC Flow Log settings, DNS query logging configuration |
| Interview | Yes | Interviewed infrastructure lead on segmentation design, firewall management practices, and WAF project status |
| Test | Partial | Reviewed existing penetration test findings; dedicated segmentation testing not performed this quarter |

---

## Findings

### Strengths

- Palo Alto next-generation firewall provides application-layer inspection and zone-based segmentation at the on-premises perimeter with 2FA enforcement for administrative access
- VPC Flow Logs and DNS query logging provide foundational network visibility across the AWS environment
- AWS VPC architecture uses multi-AZ design with Security Groups enforcing tier-level micro-segmentation
- Kubernetes namespaces provide logical separation of workloads within the cluster

### Gaps

- **No WAF deployed** — Internet-facing SaaS application lacks application-layer filtering; WAF Install project ($112K) is in progress but not yet operational, leaving exposure to OWASP Top 10 attacks
- **No formal network segmentation policy** — Segmentation exists in practice but is not governed by a documented policy defining trust zones, allowed flows, and review cadence
- **NAC not implemented** — No pre-admission device posture assessment; devices connect to the corporate network based on physical access alone
- **Kubernetes network policies incomplete** — Not all namespaces enforce network policies, allowing potential east-west lateral movement within the cluster
- **Windows Server 2012 R2 on the network** — Legacy fileserver on an unsupported OS increases the attack surface for the network segment it occupies; Q3 upgrade planned but currently exposed
- **No regular segmentation testing** — Segmentation effectiveness has not been independently validated through penetration testing or red team exercises

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3.5 |
| Target Score | 5 |

---

## Evidence Reviewed

- AWS VPC architecture diagrams and multi-AZ configuration
- Palo Alto firewall zone configuration and rulebase summary
- AWS Security Group configurations for production VPCs
- VPC Flow Log enablement across production subnets
- DNS query logging configuration
- WAF Install project charter and budget approval ($112K)
- Kubernetes network policy manifests (partial coverage confirmed)
- Windows Authenticator 2FA configuration for firewall administration

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Accelerate WAF deployment to close the most significant application-layer protection gap | High | Tigan Wang |
| 2 | Draft and approve a network segmentation policy that defines trust zones, allowed traffic flows, and review cadence | High | Tigan Wang |
| 3 | Enforce Kubernetes network policies across all production namespaces | Medium | Tigan Wang |
| 4 | Evaluate NAC solutions for the corporate network, prioritizing integration with existing endpoint management | Medium | Tigan Wang |
| 5 | Include segmentation validation in the next penetration test scope | Medium | Nadia Khan |
| 6 | Isolate the Windows Server 2012 R2 fileserver on a restricted VLAN until Q3 upgrade completes | High | Tigan Wang |
