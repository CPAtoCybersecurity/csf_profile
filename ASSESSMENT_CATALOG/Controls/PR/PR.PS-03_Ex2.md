# PR.PS-03_Ex2: Monitor for End-of-Life Hardware

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SA-22 (Unsupported System Components), MA-06 (Timely Maintenance)

## Implementation Example

> Monitor hardware inventory for components approaching or past end-of-life or end-of-vendor-support, and initiate replacement or migration planning before support expires.

## Alma Security Implementation

Alma Security tracks hardware end-of-life dates in the ServiceNow CMDB for on-premises equipment, with warranty expiration dates serving as the primary lifecycle trigger. The IT operations team reviews upcoming warranty expirations quarterly and flags hardware within 6 months of warranty end for replacement planning. For employee laptops, Alma follows a 4-year replacement cycle, with automatic replacement triggered by the asset age in the CMDB.

For cloud infrastructure, AWS instance type deprecation and Graviton migration recommendations are tracked through AWS Health Dashboard notifications and the infrastructure team's AWS account alerts. The team monitors AWS announcements for instance family retirements and plans migrations during quarterly planning cycles.

The most significant EOL hardware gap is the Windows Server 2012 R2 fileserver, which runs on aging Dell PowerEdge hardware that is past vendor warranty and no longer eligible for extended support contracts. The hardware failure risk compounds the software EOL risk, as a hardware failure would require emergency procurement and rebuilding on a new platform. Beyond this known issue, hardware EOL tracking is informal and dependent on the IT team's institutional knowledge rather than automated monitoring. There is no automated alerting system that proactively notifies owners when hardware approaches end-of-life based on vendor lifecycle data.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| CMDB warranty expiration tracking | ServiceNow CMDB | 2026-03-12 |
| Laptop replacement cycle policy (4-year lifecycle) | IT operations policy / Confluence | 2026-02-15 |
| AWS Health Dashboard notifications | AWS Console | 2026-03-14 |
| Quarterly hardware lifecycle review meeting notes | Confluence | 2026-02-28 |
| Windows 2012 R2 fileserver hardware risk documentation | Risk register / Confluence | 2026-01-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Windows 2012 R2 fileserver on out-of-warranty hardware with no vendor support | Critical --- combined hardware and software failure risk with no recovery path | Replace as part of Q3 2026 fileserver migration project | Chris Magann | Q3 2026 |
| No automated EOL alerting based on vendor lifecycle data | Medium --- reliance on manual tracking creates risk of missed EOL milestones | Implement automated hardware lifecycle alerting in ServiceNow | Tigan Wang | Q3 2026 |
| Network equipment (switches, APs) EOL tracking is informal | Low --- aging network equipment may operate past vendor support | Add network equipment vendor EOL dates to CMDB and include in quarterly review | Tigan Wang | Q4 2026 |
