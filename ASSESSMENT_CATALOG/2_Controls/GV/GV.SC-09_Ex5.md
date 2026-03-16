# GV.SC-09 Ex5: Check Hardware Upgrades for Unauthorized Changes

**Subcategory:** GV.SC-09 — Supply chain security practices are integrated into cybersecurity and enterprise risk management programs, and their performance is monitored throughout the technology product and service life cycle
**NIST SP 800-53 Ref:** PM-09, PM-19, PM-28, PM-30, PM-31, RA-03, RA-07, SA-04, SA-09, SR-02, SR-03, SR-05, SR-06

## Implementation Example

> Policies and procedure require checking upgrades to critical hardware for unauthorized changes.

## Alma Security Implementation

Alma Security's change management policy requires integrity verification for critical hardware upgrades: firmware checksums are validated against vendor-published hashes, configuration changes are compared to authorized baselines, and physical inspections are conducted for on-premise equipment. AWS Config monitors for unauthorized infrastructure changes in the cloud environment. Violations trigger automated alerts to the security engineering team.

## Artifacts

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
