# PR.AA-01 Ex4: Hardware and Device Identity Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-3, IA-4, IA-5

## Implementation Example

> Establishing and managing identities for hardware devices, including network devices, IoT endpoints, and workstations, ensuring each device is uniquely identifiable and authenticated before gaining network access

## Alma Security Implementation

Alma Security manages hardware identities through a combination of Active Directory computer objects, SentinelOne endpoint agent enrollment, and AWS resource tagging. Corporate workstations are domain-joined to the on-premises Windows Domain Controller, which assigns unique computer identities and enforces group policy. SentinelOne agents installed on all managed endpoints provide a secondary device identity layer, enabling the security team to track device health, patch status, and threat detections from a centralized console.

For the AWS infrastructure, EC2 instances and EKS worker nodes are assigned instance identities through AWS IAM instance profiles. Kubernetes pods authenticate using service account tokens bound to their namespace. The Cloud Platform team enforces resource tagging standards that include Owner, Environment, Application, and CostCenter tags, though compliance currently sits at approximately 93.5% (the 6.5% gap identified in the ID.AM-01 assessment). Network devices including the Palo Alto firewall appliances are inventoried in ServiceNow CMDB with unique asset IDs, firmware versions, and assigned administrators.

Device identity management for the Redwood City office network relies on 802.1X port-based authentication for wired connections, with the Palo Alto firewall enforcing network segmentation between trusted and untrusted device zones. Wireless access requires certificate-based device authentication for corporate devices. However, the BYOD policy is still in draft, and personal devices connecting to the guest network are not inventoried or authenticated against a device registry. This represents a gap in hardware identity management for non-corporate assets that may access corporate resources through approved BYOD channels.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AD computer object inventory | Active Directory > Computers OU | 2026-02-15 |
| SentinelOne device enrollment report | SentinelOne Console > Endpoints | 2026-03-01 |
| AWS resource tag compliance report | AWS Config > Rules > required-tags | 2026-02-28 |
| ServiceNow CMDB network device inventory | ServiceNow > CMDB > Network Devices | 2026-01-31 |
| 802.1X configuration on Palo Alto | Palo Alto Panorama > Network Policies | 2026-01-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| BYOD policy in draft; personal devices not inventoried | Unmanaged devices may access corporate resources without identity verification | Finalize BYOD policy; implement device registration for personal devices accessing corporate apps | Gerry | 2026-06-30 |
| AWS resource tagging at 93.5% compliance | 6.5% of cloud resources lack proper identity attribution; orphaned resources may evade security controls | Enforce AWS Config tag compliance rules in prevention mode (not just detection) | Tigan Wang | 2026-05-31 |
| IoT devices in office (printers, conferencing systems) not in device identity program | Unmanaged IoT devices may serve as lateral movement vectors on the network | Extend ServiceNow CMDB and SentinelOne coverage to IoT devices; segment IoT on dedicated VLAN | Chris Magann | 2026-08-31 |
