# ID.AM-02: Software and Service Inventory Management

**Subcategory:** ID.AM-02 — Inventories of software, services, and systems managed by the organization are maintained
**NIST SP 800-53 Ref:** AC-20,CM-08,PM-05,SA-05,SA-09

## Implementation Example

> Ex1: Maintain inventories for all types of software and services, including commercial-off-the-shelf

## Alma Security Implementation

Alma Security maintains software inventories using ServiceNow CMDB and endpoint management agents. AWS software inventory leverages Systems Manager inventory collection across EC2 instances. SaaS application tracking is managed through IT procurement records. Container image registries are maintained but runtime container inventory automation is not yet deployed.

## Artifacts

- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
