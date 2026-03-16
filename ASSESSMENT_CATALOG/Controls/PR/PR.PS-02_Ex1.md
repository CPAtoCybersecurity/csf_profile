# PR.PS-02_Ex1: Track and Manage Software Inventory

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-08 (System Component Inventory), SA-22 (Unsupported System Components)

## Implementation Example

> Track and manage software installed on organizational systems through a comprehensive inventory that includes version, owner, and support status for all software components.

## Alma Security Implementation

Alma Security maintains a software inventory tracked through a combination of automated discovery tools and manual CMDB entries in ServiceNow. SentinelOne's endpoint agent provides real-time visibility into installed software on workstations and laptops, while AWS Systems Manager Inventory collects software package data from EC2 instances. Container image versions are tracked through the organization's Amazon ECR registry, which serves as the authoritative source for deployed container images.

The software inventory covers operating systems (Amazon Linux 2, Ubuntu 22.04, Windows Server 2012 R2, Windows 10/11), middleware and runtime components (Java, Node.js, Python), database engines (PostgreSQL, Redis), and application-layer software. Each software component in the CMDB has a designated owner from the responsible engineering or IT team, current version, vendor support status, and next scheduled update date. The inventory is reconciled quarterly by the IT operations team comparing automated discovery results against CMDB records.

However, the software inventory has known coverage gaps. Developer-installed tools and packages on local workstations are not consistently tracked beyond what SentinelOne detects. Kubernetes-deployed microservice dependencies (npm packages, pip libraries) are cataloged at the container image level but not at the individual dependency level. There is no formal software bill of materials (SBOM) for Alma's SaaS platform, which limits visibility into transitive dependencies.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| ServiceNow CMDB software inventory export | ServiceNow | 2026-03-12 |
| SentinelOne installed software discovery report | SentinelOne Console | 2026-03-14 |
| AWS Systems Manager Inventory dashboard | AWS Console | 2026-03-14 |
| Amazon ECR container image registry inventory | AWS ECR Console | 2026-03-14 |
| Quarterly inventory reconciliation report | IT Operations Confluence | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No SBOM for the SaaS platform; transitive dependencies not tracked | High --- supply chain vulnerabilities may go undetected | Implement SBOM generation in CI/CD pipeline (e.g., Syft, CycloneDX) | Chris Magann | Q2 2026 |
| Developer workstation software not comprehensively tracked | Medium --- shadow IT risk from unmanaged tools | Enhance SentinelOne software inventory collection and establish approved developer toolset | Chris Magann | Q3 2026 |
