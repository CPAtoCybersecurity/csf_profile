# PR.PS-05_Ex2: Restrict Administrative Installation Privileges

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), AC-06 (Least Privilege)

## Implementation Example

> Restrict the ability to install software to authorized administrators, preventing standard users from installing applications without IT approval and elevated privileges.

## Alma Security Implementation

Alma restricts software installation via Active Directory GPOs on Windows endpoints and Jamf Pro on macOS, with non-catalog software routed through ServiceNow helpdesk requests. Approximately 40% of users (engineering/product) have local admin rights on macOS devices to support development workflows. SentinelOne monitors these admin-enabled machines in detection-only mode, with quarterly application inventory reviews as a compensating control.

## Artifacts

- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Acceptable Use Policy](../../Artifacts/Policies/POL-acceptable-use.md)
- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
