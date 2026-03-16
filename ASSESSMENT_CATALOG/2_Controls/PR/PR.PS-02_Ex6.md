# PR.PS-02_Ex6: Uninstall or Disable Unauthorized Software

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), CM-10 (Software Usage Restrictions)

## Implementation Example

> Detect and remove or disable unauthorized, unlicensed, or unapproved software from organizational systems, including verifying complete removal of residual files and configurations.

## Alma Security Implementation

Alma uses SentinelOne application inventory on endpoints and AWS Systems Manager Inventory on servers to detect unauthorized software, with periodic reviews against the approved catalog. Unauthorized installations are remediated via IT helpdesk tickets (endpoints) or Ansible baseline enforcement (servers). Detection and removal is reactive -- SentinelOne application control operates in detection-only mode for unrecognized executables, and no automated real-time blocking is configured.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [Acceptable Use Policy](../../5_Artifacts/Policies/POL-acceptable-use.md)
