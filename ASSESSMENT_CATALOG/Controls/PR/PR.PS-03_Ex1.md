# PR.PS-03_Ex1: Track and Manage Hardware Asset Inventory

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-08 (System Component Inventory), PM-05 (System Inventory)

## Implementation Example

> Establish and maintain a comprehensive hardware asset inventory that includes physical and virtual infrastructure, tracking ownership, location, warranty status, and lifecycle stage for all hardware components.

## Alma Security Implementation

Alma maintains hardware inventory in ServiceNow CMDB (on-premises) and AWS resource tagging (cloud), with approximately 300 employee endpoints also tracked via SentinelOne. Procurement auto-creates CMDB entries, AWS Config enforces tagging compliance, and quarterly physical reconciliation identifies discrepancies. No unified view combines on-premises and cloud assets, CMDB updates lag for transfers and returns, and network equipment lifecycle tracking is limited.

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
