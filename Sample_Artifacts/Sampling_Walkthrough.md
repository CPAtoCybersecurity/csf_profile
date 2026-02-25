# Hardware Inventory Sampling Walkthrough
**Date:** 2026-02-15
**Assessor:** OG
**Sample Size:** 5 assets (random selection)

| Asset ID | Hostname | Location Verified | Serial Match | Owner Current | Asset Tag Present | Notes |
|----------|----------|-------------------|--------------|---------------|-------------------|-------|
| HW-001 | alma-db-prod-01 | Yes | Yes | Yes | Yes | Rack B3, Unit 12 |
| HW-003 | ws-jsmith-01 | Yes | Yes | No | Yes | Owner shows J. Smith but employee transferred to Marketing - needs update |
| HW-004 | sw-core-01 | Yes | Yes | Yes | Yes | Core switch room A |
| HW-005 | lt-mwilson-01 | N/A (Remote) | Yes | Yes | Yes | Verified via remote MDM |
| HW-007 | srv-backup-02 | No | - | - | - | Asset not found at documented location (DC-West Row 4) - investigate |

## Sampling Results
- **4 of 5** assets fully verified
- **1 asset** (HW-003) has stale owner information
- **1 asset** (HW-007) could not be located at documented location

## Findings
Physical verification sampling identified inventory accuracy issues. Recommend quarterly sampling audits and process to update ownership on employee transfers.
