# ID.AM-01: Hardware Inventory — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Omar Garza, Internal Audit <omar.garza@almasecurity.com>

**Observation Date:** 2026-02-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed ServiceNow CMDB hardware records, AWS resource tag compliance data, and network scan results against inventory entries |
| Interview | Yes | Interviewed the IT Desktop Manager, IT Infrastructure Manager, and Cloud Platform Principal Architect on inventory maintenance and reconciliation practices |
| Test | Yes | Compared Nmap network scan output to CMDB records; sampled 5 physical assets for location, serial, ownership, and asset-tag verification (see [Sampling Walkthrough](../../5_Artifacts/Procedures/PROC-sampling-walkthrough.md)) |

---

## Findings

Alma Security maintains a hardware inventory in ServiceNow CMDB, but the inventory is incomplete and not regularly reconciled with actual network assets. Cloud resource tagging exists but is not consistently enforced: 55 of 847 AWS resources (6.5%) are missing one or more required tags (Environment, Owner, Application). Physical sampling revealed 1 of 5 assets could not be located and 1 had stale ownership data.

Network scanning identified 3 devices not present in the CMDB, and 2 assets marked "Active" in inventory did not respond to network scans, suggesting decommissioning without an inventory update. Reconciliation between the CMDB, network scans, and AWS Config data is performed manually on an ad-hoc basis; there is no scheduled process, so inventory drift accumulates over time. An asset that could not be physically verified (HW-007) remained unlocated at fieldwork close, and one sampled asset carried outdated owner information following an employee transfer.

### Strengths

- Hardware inventory is centralized in ServiceNow CMDB rather than spreadsheets
- AWS resource tagging standard (Environment, Owner, Application) is defined and 93.5% adopted
- Physical asset sampling was fully supportable — 4 of 5 sampled assets verified on location, serial, and asset tag

### Gaps

- 3 network-discovered devices absent from the CMDB; 2 CMDB-active assets unreachable on the network (untracked assets may miss patching or represent shadow IT)
- 55 AWS resources (6.5%) missing required tags, leaving ownership unclear and incident response slower for those resources
- 1 of 5 physically sampled assets (20%) could not be located; ownership data not updated on employee transfer
- No automated or scheduled reconciliation between CMDB, network scans, and AWS Config

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4.5 |
| Target Score | 6.5 |
| Previous Quarter | N/A |
| Trend | N/A (first assessment of this subcategory) |

**Scoring rationale:** Score of 4.5 (Some Security) reflects that a centralized CMDB and a defined tagging standard exist and mostly operate, but completeness cannot be demonstrated: unreconciled network-discovered devices, a 6.5% tag-compliance gap, and a failed physical-verification sample show the inventory is not yet reliable enough for Minimally Acceptable (5.0), which requires the register to be substantially complete and periodically reconciled. The distance to the 6.5 target is driven by the absence of any automated reconciliation loop — the register is maintained, but nothing proves it matches reality. This subcategory evidences register risk R4 (incomplete asset inventory).

---

## Evidence Reviewed

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md) (ServiceNow CMDB extract)
- [Nmap Scan Results](../../5_Artifacts/Reports/RPT-nmap-scan-results.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md) (tag compliance data)
- [Sampling Walkthrough](../../5_Artifacts/Procedures/PROC-sampling-walkthrough.md) (5-asset physical verification)
- Interview notes: IT Desktop Manager, IT Infrastructure Manager, Cloud Platform Principal Architect

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Identify owners for the 55 non-compliant AWS resources and locate missing asset HW-007 (30 days) | High | Marcus Lee |
| 2 | Implement monthly automated reconciliation between CMDB, network scans, and AWS Config data (60 days) | High | Marcus Lee |
| 3 | Enable AWS Config rule enforcement (not just detection) for required tags; target >98% compliance (90 days) | Medium | Marcus Lee |
| 4 | Establish quarterly physical sampling audits (minimum 5 assets) and an ownership-update step in the employee transfer/termination process | Medium | Gerry Callahan |

## Related

- **Test Procedure:** [ID.AM-01 Test Procedures](../../3_Test_Procedures/ID/ID.AM-01.md)
- **Controls:** [ID.AM-01_Ex1](../../2_Controls/ID/ID.AM-01_Ex1.md), [ID.AM-01_Ex2](../../2_Controls/ID/ID.AM-01_Ex2.md)
- **Artifacts:** [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md), [Nmap Scan Results](../../5_Artifacts/Reports/RPT-nmap-scan-results.md), [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [Sampling Walkthrough](../../5_Artifacts/Procedures/PROC-sampling-walkthrough.md)
