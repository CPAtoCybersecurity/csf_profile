# GV.OC-04: Critical Objectives and Services — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-05
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed BIA, service catalog, resilience objectives documentation |
| Interview | Yes | CTO, CISO, VP Operations |
| Test | No | N/A |

## Findings

### Strengths

- Business Impact Analysis (BIA) identifies critical capabilities and services with defined RTOs and RPOs
- Service catalog maps critical customer-facing services to supporting infrastructure
- Resilience objectives communicated to engineering and operations teams

### Gaps

- BIA last updated Q2 2025; does not reflect recent service additions
- RTO/RPO objectives not tested against actual recovery capabilities in 6+ months

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 6 |
| Target Score | 7 |

**Scoring rationale:** At 6, this control rates in the Optimized band: the BIA defines critical capabilities with RTOs and RPOs, the service catalog maps customer-facing services to supporting infrastructure, and resilience objectives are communicated to engineering and operations — consistent execution with measurable objectives, per the 6 anchor. It falls short of Fully Optimized (7.0) because the measurement loop is stale rather than improving: the BIA has not been updated since Q2 2025 and so omits recent service additions, and RTO/RPO objectives have not been validated against actual recovery capability in over six months (last DR test Q3 2025), so no multi-period effectiveness trend can be shown.

## Evidence Reviewed

- Business Impact Analysis (Q2 2025)
- Service criticality catalog
- RTO/RPO documentation
- Disaster recovery test results (Q3 2025)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Update BIA to include Q3-Q4 2025 service additions | High | VP Operations |
| 2 | Conduct DR test to validate RTO/RPO objectives | High | CISO |

## Related

- **Test Procedure:** [GV.OC-04 Test Procedures](../../3_Test_Procedures/GV/GV.OC-04.md)
- **Controls:** [GV.OC-04_Ex1](../../2_Controls/GV/GV.OC-04_Ex1.md), [GV.OC-04_Ex2](../../2_Controls/GV/GV.OC-04_Ex2.md), [GV.OC-04_Ex3](../../2_Controls/GV/GV.OC-04_Ex3.md)
