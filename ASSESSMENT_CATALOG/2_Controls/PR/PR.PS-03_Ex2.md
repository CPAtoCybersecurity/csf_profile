# PR.PS-03_Ex2: Monitor for End-of-Life Hardware

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SA-22 (Unsupported System Components), MA-06 (Timely Maintenance)

## Implementation Example

> Monitor hardware inventory for components approaching or past end-of-life or end-of-vendor-support, and initiate replacement or migration planning before support expires.

## Alma Security Implementation

Alma tracks hardware EOL via warranty expiration dates in ServiceNow CMDB, with quarterly reviews flagging hardware within 6 months of warranty end. Laptops follow a 4-year replacement cycle; cloud instance deprecations are tracked through AWS Health Dashboard. The Windows Server 2012 R2 fileserver runs on out-of-warranty Dell PowerEdge hardware, and no automated EOL alerting exists -- tracking relies on the IT team's institutional knowledge.

## Artifacts

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
