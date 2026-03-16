# PR.PS-03_Ex1: Track and Manage Hardware Asset Inventory

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-08 (System Component Inventory), PM-05 (System Inventory)

## Implementation Example

> Establish and maintain a comprehensive hardware asset inventory that includes physical and virtual infrastructure, tracking ownership, location, warranty status, and lifecycle stage for all hardware components.

## Alma Security Implementation

Alma maintains hardware inventory in ServiceNow CMDB (on-premises) and AWS resource tagging (cloud), with approximately 300 employee endpoints also tracked via SentinelOne. Procurement auto-creates CMDB entries, AWS Config enforces tagging compliance, and quarterly physical reconciliation identifies discrepancies. No unified view combines on-premises and cloud assets, CMDB updates lag for transfers and returns, and network equipment lifecycle tracking is limited.

## Artifacts

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
