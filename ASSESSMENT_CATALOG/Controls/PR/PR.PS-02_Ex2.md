# PR.PS-02_Ex2: Monitor for End-of-Life and Unsupported Software

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SA-22 (Unsupported System Components), SI-02 (Flaw Remediation)

## Implementation Example

> Monitor for and identify software that has reached or is approaching end-of-life or end-of-support status, and plan for timely migration, replacement, or compensating controls.

## Alma Security Implementation

Alma tracks EOL/EOS dates in the ServiceNow CMDB and maintains a forward-looking EOL calendar reviewed monthly, with 12-month milestones flagged for migration planning. The Windows Server 2012 R2 fileserver (EOL since October 2023) remains in production with compensating controls (VLAN segmentation, restricted access, SentinelOne); migration to SharePoint Online/OneDrive is planned for Q3 2026. Container base image EOL is monitored via ECR scanning, but no automated mechanism blocks deployment of EOL-based images.

## Artifacts

- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
- [Patch Management Procedure](../../Artifacts/Procedures/PROC-patch-management.md)
- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
