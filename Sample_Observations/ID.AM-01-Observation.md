# Audit Observation: ID.AM-01 Hardware Inventory

**Control:** ID.AM-01 - Inventories of hardware managed by the organization are maintained
**Assessment Date:** 2026-02-15

**Assessor:** OG

## Current State Score: 4.5 / 10
## Target State Score: 6.5 / 10

## Observation Summary
Alma Security maintains a hardware inventory in ServiceNow CMDB, but the inventory is incomplete and not regularly reconciled with actual network assets. Cloud resource tagging exists but is not consistently enforced, resulting in approximately 6.5% of AWS resources lacking required tags. Physical sampling revealed 1 of 5 assets could not be located and 1 had stale ownership data.

## Findings

### Finding 1: Incomplete On-Premises Inventory
Network scanning identified 3 devices not present in the CMDB. Additionally, 2 assets marked as "Active" in inventory did not respond to network scans, suggesting possible decommissioning without inventory update.

**Risk:** Untracked assets may contain vulnerabilities, lack proper patching, or represent shadow IT introducing unauthorized risk.

### Finding 2: AWS Tagging Gaps
55 of 847 AWS resources (6.5%) are missing one or more required tags (Environment, Owner, Application). Without proper tagging, asset ownership is unclear and incident response may be delayed.

**Risk:** Orphaned resources may incur unnecessary cost and lack security oversight.

### Finding 3: Physical Verification Gaps
Sampling walkthrough revealed 1 of 5 assets (20%) could not be physically verified at the documented location. An additional asset had outdated owner information due to employee transfer.

**Risk:** Inventory inaccuracies reduce confidence in asset visibility and may impact incident response.

### Finding 4: No Automated Reconciliation
Hardware inventory reconciliation is performed manually on an ad-hoc basis. There is no scheduled process to compare CMDB records against network scans or AWS Config data.

**Risk:** Inventory drift increases over time, reducing confidence in asset visibility.

## Recommendations
1. Implement monthly automated reconciliation between CMDB and network scans
2. Enable AWS Config rule enforcement (not just detection) for required tags
3. Establish ownership identification process for the 55 non-compliant AWS resources
4. Implement quarterly physical sampling audits (minimum 5 assets)
5. Create process to update asset ownership on employee transfers/terminations
6. Integrate AWS Config compliance data into CMDB or central asset repository

## Evidence References
- Hardware_Inventory_Sample.md
- AWS_Tag_Compliance_Report.md
- Nmap_Scan_Results.md
- Sampling_Walkthrough.md
- Interview notes: IT Desktop Manager, IT Infrastructure Manager, Cloud Platform Principal Architect

## Remediation Timeline
- **30 days:** Identify owners for all non-compliant AWS resources; locate missing asset HW-007
- **60 days:** Implement automated CMDB/network scan reconciliation
- **90 days:** Achieve >98% AWS tag compliance; establish quarterly sampling process
