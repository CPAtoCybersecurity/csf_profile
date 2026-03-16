# GV.SC-06 Ex4: Assess Product Authenticity and Security

**Subcategory:** GV.SC-06 — Planning and due diligence are performed to reduce risks before entering into formal supplier or other third-party relationships
**NIST SP 800-53 Ref:** SA-04, SA-09, SR-05, SR-06

## Implementation Example

> Assess the authenticity, integrity, and security of critical products prior to acquisition and use.

## Alma Security Implementation

For critical software and hardware acquisitions, the security engineering team verifies product authenticity through vendor validation, digital signature verification, and hash checks. Software is sourced only from authorized channels, and critical dependencies are reviewed for known vulnerabilities before deployment. The team validates SBOMs for open-source components and checks against the NVD for known CVEs prior to integration into production systems.

## Artifacts

- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
