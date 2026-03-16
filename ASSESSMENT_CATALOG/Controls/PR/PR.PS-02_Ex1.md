# PR.PS-02_Ex1: Track and Manage Software Inventory

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-08 (System Component Inventory), SA-22 (Unsupported System Components)

## Implementation Example

> Track and manage software installed on organizational systems through a comprehensive inventory that includes version, owner, and support status for all software components.

## Alma Security Implementation

Alma tracks software inventory through ServiceNow CMDB, SentinelOne endpoint discovery, AWS Systems Manager Inventory, and Amazon ECR for container images, reconciling quarterly. Each CMDB entry includes owner, version, vendor support status, and next update date. No SBOM exists for the SaaS platform, developer workstation software is not comprehensively tracked, and container-level dependencies are not inventoried at the individual package level.

## Artifacts

- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
