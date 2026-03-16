# PR.AA-01 Ex4: Hardware and Device Identity Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-3, IA-4, IA-5

## Implementation Example

> Establishing and managing identities for hardware devices, including network devices, IoT endpoints, and workstations, ensuring each device is uniquely identifiable and authenticated before gaining network access

## Alma Security Implementation

Alma Security manages hardware identities through Active Directory computer objects for domain-joined workstations, SentinelOne endpoint agent enrollment for device health tracking, and AWS IAM instance profiles for cloud infrastructure. Network devices including Palo Alto firewall appliances are inventoried in ServiceNow CMDB with unique asset IDs, firmware versions, and assigned administrators. The Redwood City office enforces 802.1X port-based authentication for wired connections and certificate-based authentication for wireless, with the Palo Alto firewall segmenting trusted corporate devices from untrusted devices on a guest VLAN. AWS resources follow tagging standards (Owner, Environment, Application, CostCenter) enforced through AWS Config rules at approximately 93.5% compliance.

## Artifacts

- [Hardware Inventory](../../Artifacts/Inventories/INV-hardware-inventory.md)
- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
