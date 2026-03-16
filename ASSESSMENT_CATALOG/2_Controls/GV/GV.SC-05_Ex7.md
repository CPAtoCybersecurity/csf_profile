# GV.SC-05 Ex7: Require Supplier Component Inventories

**Subcategory:** GV.SC-05 — Requirements to address cybersecurity risks in supply chains are established, prioritized, and integrated into contracts and other agreements with suppliers and other relevant third parties
**NIST SP 800-53 Ref:** SA-04, SA-09, SR-03, SR-05, SR-06, SR-10

## Implementation Example

> Contractually require suppliers to provide and maintain a current component inventory (e.g., software bill of materials) for critical products.

## Alma Security Implementation

Tier 1 and Tier 2 vendor contracts require provision of a Software Bill of Materials (SBOM) in CycloneDX or SPDX format for all products integrated into Alma's environment. SBOMs must be updated with each major release and provided within 30 days of request. The security engineering team ingests SBOMs into vulnerability management tooling to identify transitive dependency risks.

## Artifacts

- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
