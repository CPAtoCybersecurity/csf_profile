# GV.SC-04: Supplier Criticality — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-01-10

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed the Third Party Risk Management Policy tiering criteria, the ServiceNow supplier inventory, and quarterly supplier review documentation |
| Interview | Yes | Interviewed the IT Manager on how supplier tiers are assigned and how the "No PO, No Pay" control keeps the supplier population complete |
| Test | No | Population completeness relied on the No PO/No Pay payment control examined above; re-performance planned for a later quarter |

---

## Findings

Suppliers are known and prioritized by criticality. Risk tiers are documented in the Third Party Risk Management Policy, and suppliers are ranked by data sensitivity, system access level, and mission importance. The supplier population is anchored by the company's "No PO, No Pay" policy — no supplier gets paid without a purchase order, which means every active supplier necessarily appears in the ServiceNow supplier inventory. Quarterly supplier reviews operate against that inventory, and the criticality framework is integrated with the ServiceNow vendor workflows rather than maintained as a standalone spreadsheet.

### Strengths

- Supplier risk tiers are defined in policy with explicit criteria (data sensitivity, access level, mission importance)
- "No PO, No Pay" gives structural assurance that the supplier population in ServiceNow is complete
- Quarterly supplier reviews are documented and integrated with ServiceNow vendor workflows

### Gaps

- Criticality re-tiering is calendar-driven (quarterly) rather than event-driven; a supplier whose access expands mid-quarter keeps its old tier until the next review
- Tiering has not yet been re-performed by an independent party; Internal Audit plans re-performance testing in a later quarter

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 5 |
| Previous Quarter | N/A |
| Trend | N/A (first assessment of this subcategory) |

**Scoring rationale:** Score of 5 (Minimally Acceptable) meets the board-approved target: the supplier population is structurally complete, tiering criteria are documented and applied, and reviews run on a defined cadence — the anchors of the Minimally Acceptable band. The subcategory does not score into Optimized (6.0+) because re-tiering is not event-driven and the tier assignments have not yet been independently re-performed; the framework is operating, but its calibration is taken on management's word this quarter. Directly supports register risk R6 (third-party/supplier risk).

---

## Evidence Reviewed

- [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md) (tiering criteria)
- ServiceNow supplier inventory
- Quarterly supplier review documentation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Add an event-driven re-tiering trigger (access change, data-scope change, incident at supplier) to the ServiceNow vendor workflow | Medium | Gerry Callahan |
| 2 | Support Internal Audit's planned re-performance of tier assignments for a sample of Tier 1 suppliers | Low | Gerry Callahan |

## Related

- **Test Procedure:** [GV.SC-04 Test Procedures](../../3_Test_Procedures/GV/GV.SC-04.md)
- **Controls:** [GV.SC-04_Ex1](../../2_Controls/GV/GV.SC-04_Ex1.md), [GV.SC-04_Ex2](../../2_Controls/GV/GV.SC-04_Ex2.md)
- **Artifacts:** [Third Party Risk Management Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
