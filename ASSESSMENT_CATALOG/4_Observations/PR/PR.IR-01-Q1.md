# PR.IR-01: Network Protection from Unauthorized Logical Access — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

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

**Scoring rationale:** The 3.5 places network protection in the Some Security band: segmentation is practiced — Palo Alto zone-based inspection with 2FA on administration, Security Group micro-segmentation across the multi-AZ VPCs, Kubernetes namespaces — but it is ungoverned and unevenly executed. There is no segmentation policy defining trust zones or review cadence, the internet-facing SaaS application has no WAF (the $112K WAF Install project is not yet operational), Kubernetes network policies do not cover all namespaces, and a Windows Server 2012 R2 fileserver remains on the network until its Q3 upgrade. The half-point above a flat 3 reflects that the deployed layers do operate regularly; Minimally Acceptable (5.0) is out of reach until segmentation is policy-governed, applied across all namespaces, and independently validated — none of which occurred this quarter.

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

## Related

- **Test Procedure:** [PR.IR-01 Test Procedures](../../3_Test_Procedures/PR/PR.IR-01.md)
- **Controls:** [PR.IR-01_Ex1](../../2_Controls/PR/PR.IR-01_Ex1.md), [PR.IR-01_Ex2](../../2_Controls/PR/PR.IR-01_Ex2.md), [PR.IR-01_Ex3](../../2_Controls/PR/PR.IR-01_Ex3.md), [PR.IR-01_Ex4](../../2_Controls/PR/PR.IR-01_Ex4.md)
