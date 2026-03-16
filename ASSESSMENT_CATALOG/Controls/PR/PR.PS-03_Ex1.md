# PR.PS-03_Ex1: Track and Manage Hardware Asset Inventory

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-08 (System Component Inventory), PM-05 (System Inventory)

## Implementation Example

> Establish and maintain a comprehensive hardware asset inventory that includes physical and virtual infrastructure, tracking ownership, location, warranty status, and lifecycle stage for all hardware components.

## Alma Security Implementation

Alma Security maintains a hardware asset inventory in ServiceNow CMDB that covers on-premises infrastructure at the Redwood City office and cloud-hosted resources in AWS. On-premises assets include the Windows domain controller, the legacy Windows Server 2012 R2 fileserver, network switches, access points, and employee workstations and laptops. Cloud assets tracked include EC2 instance types, EKS cluster nodes, and reserved instance allocations. Employee endpoints (approximately 300 laptops) are tracked through both ServiceNow and the SentinelOne management console, which provides real-time hardware inventory data.

The CMDB records for on-premises hardware include asset tag, serial number, location, assigned owner, purchase date, warranty expiration, and lifecycle status. However, the CMDB is not consistently updated for all asset lifecycle events. Procurement triggers automatic CMDB entry creation through the ServiceNow purchase order workflow, but transfers between employees, physical relocations, and returns are often updated with lag. A quarterly physical inventory reconciliation is conducted by IT operations to identify discrepancies between the CMDB and actual deployed hardware.

Cloud infrastructure asset tracking relies on AWS resource tagging standards, with mandatory tags for owner, team, environment, and cost center. AWS Config rules enforce tagging compliance, and untagged or improperly tagged resources are flagged. However, there is no unified view that combines on-premises and cloud hardware into a single authoritative inventory dashboard. The IT and infrastructure teams use separate views that require manual correlation.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| ServiceNow CMDB hardware inventory export | ServiceNow | 2026-03-12 |
| SentinelOne endpoint hardware inventory | SentinelOne Console | 2026-03-14 |
| AWS resource tagging compliance report | AWS Config | 2026-03-14 |
| Quarterly physical inventory reconciliation report | IT Operations Confluence | 2026-02-28 |
| ServiceNow purchase order to CMDB automation | ServiceNow workflow | 2026-01-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No unified inventory dashboard combining on-premises and cloud assets | Medium --- operational blind spots and manual correlation required | Implement unified asset management view (ServiceNow Discovery or equivalent) | Tigan Wang | Q3 2026 |
| CMDB updates lag for transfers, relocations, and returns | Medium --- stale inventory data reduces accuracy for security and compliance purposes | Implement automated CMDB update triggers for common lifecycle events | Chris Magann | Q3 2026 |
| Network infrastructure (switches, APs) has limited lifecycle tracking in CMDB | Low --- network equipment warranty and EOL may be missed | Extend CMDB lifecycle tracking to network infrastructure category | Tigan Wang | Q4 2026 |
