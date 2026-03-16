# PR.PS-03_Ex3: Replace Hardware per Lifecycle Policy

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** MA-06 (Timely Maintenance), SA-22 (Unsupported System Components), MP-06 (Media Sanitization)

## Implementation Example

> Replace hardware components according to an established lifecycle policy that accounts for vendor support timelines, operational reliability, and secure disposal of retired equipment.

## Alma Security Implementation

Alma replaces employee laptops on a 4-year cycle managed through ServiceNow workflows (~75 replacements/year), with secure disposal following NIST SP 800-88 guidelines and certificates of destruction retained in the CMDB. Server and infrastructure hardware is replaced reactively rather than through a standardized lifecycle policy. Disposal documentation has not been updated since 2024, and on-premises systems beyond the Windows 2012 R2 fileserver lack a formal replacement roadmap.

## Artifacts

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [Acceptable Use Policy](../../5_Artifacts/Policies/POL-acceptable-use.md)
- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
