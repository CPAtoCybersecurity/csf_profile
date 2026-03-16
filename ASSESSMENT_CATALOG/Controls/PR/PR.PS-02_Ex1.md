# PR.PS-02_Ex1: Track and Manage Software Inventory

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-08 (System Component Inventory), SA-22 (Unsupported System Components)

## Implementation Example

> Track and manage software installed on organizational systems through a comprehensive inventory that includes version, owner, and support status for all software components.

## Alma Security Implementation

Alma tracks software inventory through ServiceNow CMDB, SentinelOne endpoint discovery, AWS Systems Manager Inventory, and Amazon ECR for container images, reconciling quarterly. Each CMDB entry includes owner, version, vendor support status, and next update date. No SBOM exists for the SaaS platform, developer workstation software is not comprehensively tracked, and container-level dependencies are not inventoried at the individual package level.

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
