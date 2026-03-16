# PR.IR-01_Ex1: Network Segmentation

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex1: Network segmentation is used to separate networks into security zones based on trust level, data sensitivity, or business function to limit unauthorized lateral movement.

## Alma Security Implementation

Alma Security implements network segmentation across both its AWS cloud environment and the Redwood City on-premises data center. In AWS, the production VPC architecture uses a multi-AZ design with distinct subnets for public-facing load balancers, application-tier Kubernetes worker nodes, and private database instances. Security Groups enforce micro-segmentation at the instance level, restricting traffic to explicitly required ports and protocols between tiers. Network ACLs provide a secondary stateless filtering layer at the subnet boundary.

On-premises at the Redwood City data center, the Palo Alto firewall enforces zone-based segmentation between the corporate network, server VLAN, and management network. The Windows domain controllers are hosted on a dedicated server segment with restricted access from the general corporate VLAN. However, the segmentation model has not been formally documented as a segmentation policy, and the degree of micro-segmentation within the Kubernetes cluster (namespace-level network policies) requires further validation.

Current gaps include the absence of a formal network segmentation policy document that defines trust zones, the limited enforcement of Kubernetes network policies across all namespaces, and the lack of regular segmentation testing to verify that controls prevent lateral movement as designed.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS VPC architecture diagram | Infrastructure team Confluence | 2026-01-15 |
| Security Group configurations | AWS Console / IaC repository | 2026-02-20 |
| Palo Alto zone configuration | Firewall management console | 2026-01-10 |
| Kubernetes network policy manifests | GitOps repository | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Behind Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal network segmentation policy | Cannot validate segmentation against defined trust boundaries | Draft and approve network segmentation policy defining zones and trust levels | Tigan Wang | 2026-06-30 |
| Kubernetes network policies not enforced across all namespaces | Potential east-west lateral movement within cluster | Implement and enforce network policies for all production namespaces | Tigan Wang | 2026-05-31 |
| No regular segmentation testing | Segmentation drift undetected over time | Include segmentation validation in annual penetration test scope | Tigan Wang | 2026-07-31 |
