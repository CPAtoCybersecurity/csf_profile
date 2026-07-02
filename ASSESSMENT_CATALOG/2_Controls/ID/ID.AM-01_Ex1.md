# ID.AM-01: Hardware Inventory Management

**Subcategory:** ID.AM-01 — Inventories of hardware managed by the organization are maintained
**NIST SP 800-53 Ref:** CM-08,PM-05

## Implementation Example

> Ex1: Maintain inventories for all types of hardware, including IT, IoT, OT, and mobile devices

## Alma Security Implementation

Alma Security maintains hardware inventories in ServiceNow CMDB covering endpoints, servers, and network devices. AWS resource inventory is tracked via AWS Config with mandatory tagging policies. Network discovery scans run weekly to identify unmanaged devices. Asset inventory is approximately 85% complete with a gap in IoT/OT device coverage.

## Artifacts

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
