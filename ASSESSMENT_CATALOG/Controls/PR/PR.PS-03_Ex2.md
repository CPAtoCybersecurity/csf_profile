# PR.PS-03_Ex2: Monitor for End-of-Life Hardware

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SA-22 (Unsupported System Components), MA-06 (Timely Maintenance)

## Implementation Example

> Monitor hardware inventory for components approaching or past end-of-life or end-of-vendor-support, and initiate replacement or migration planning before support expires.

## Alma Security Implementation

Alma tracks hardware EOL via warranty expiration dates in ServiceNow CMDB, with quarterly reviews flagging hardware within 6 months of warranty end. Laptops follow a 4-year replacement cycle; cloud instance deprecations are tracked through AWS Health Dashboard. The Windows Server 2012 R2 fileserver runs on out-of-warranty Dell PowerEdge hardware, and no automated EOL alerting exists -- tracking relies on the IT team's institutional knowledge.

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
