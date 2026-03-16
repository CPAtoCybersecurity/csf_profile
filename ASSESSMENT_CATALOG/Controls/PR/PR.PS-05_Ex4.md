# PR.PS-05_Ex4: Maintain an Authorized Software List

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), CM-08 (System Component Inventory)

## Implementation Example

> Develop and maintain an authoritative list of software approved for use within the organization, including version requirements where applicable, and keep it current with regular reviews.

## Alma Security Implementation

Alma maintains an approved software catalog in ServiceNow covering business, security, and development tools, with self-service provisioning for listed applications and full security review required for unlisted software. The catalog is reviewed semi-annually to verify currency and vendor security posture. Coverage gaps exist for open-source CLI tools, browser extensions, and developer libraries; no automated sync exists between the catalog and SentinelOne's allowlist.

## Artifacts

- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Acceptable Use Policy](../../Artifacts/Policies/POL-acceptable-use.md)
