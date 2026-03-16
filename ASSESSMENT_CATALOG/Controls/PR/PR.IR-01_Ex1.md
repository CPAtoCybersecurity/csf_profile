# PR.IR-01_Ex1: Network Segmentation

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex1: Network segmentation is used to separate networks into security zones based on trust level, data sensitivity, or business function to limit unauthorized lateral movement.

## Alma Security Implementation

Alma segments its AWS production VPC into distinct subnets (public ALBs, application-tier Kubernetes nodes, private databases) with Security Groups enforcing micro-segmentation and Network ACLs providing secondary filtering. On-premises at Redwood City, the Palo Alto firewall enforces zone-based segmentation between corporate, server, and management VLANs. No formal segmentation policy document exists, Kubernetes namespace-level network policies are not enforced across all namespaces, and regular segmentation testing has not been conducted.

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
