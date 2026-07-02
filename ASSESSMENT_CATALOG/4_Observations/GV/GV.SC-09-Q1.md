# GV.SC-09: Supply Chain Security Practices — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-15
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed provenance records, component integrity reports, maintenance access logs |
| Interview | Yes | CISO, Security Engineering Lead |
| Test | Yes | Verified supplier maintenance access logging for 3 recent sessions |

## Findings

### Strengths

- Provenance records required for critical technology acquisitions through procurement policy
- Component integrity reporting included in quarterly CISO Board presentations
- Supplier maintenance access requires named accounts with MFA and automatic logging
- Hardware upgrade integrity checks automated through AWS Config for cloud infrastructure

### Gaps

- SBOM coverage at 60% for critical applications (target: 100%)
- Supplier maintenance access logs not reviewed systematically (only on-demand)

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

**Scoring rationale:** Supply chain security practices rate a 5 — Minimally Acceptable: the technical controls execute consistently across scope, with supplier maintenance access requiring named accounts, MFA, and automatic logging (confirmed for all 3 tested sessions), AWS Config automating hardware upgrade integrity checks, and component integrity reported to the Board quarterly. The known, tracked shortfalls keep it at the band floor: SBOM coverage stands at 60% of critical applications against a 100% target, and maintenance access logs are reviewed only on-demand rather than systematically. The step to Optimized (6) is blocked not by missing measurement — the SBOM coverage metric exists — but by the absence of an owner acting on its drift: 60% coverage persists untreated, and unreviewed access logs mean part of the control produces evidence nobody examines.

## Evidence Reviewed

- Provenance record samples for Q1 2026 acquisitions
- SBOM coverage report
- Supplier maintenance access logs (3 sampled sessions)
- AWS Config compliance dashboard

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Achieve 100% SBOM coverage for critical applications by Q3 2026 | High | Security Engineering Lead |
| 2 | Implement weekly review of supplier maintenance access logs | Medium | SOC Manager |

## Related

- **Test Procedure:** [GV.SC-09 Test Procedures](../../3_Test_Procedures/GV/GV.SC-09.md)
- **Controls:** [GV.SC-09_Ex1](../../2_Controls/GV/GV.SC-09_Ex1.md), [GV.SC-09_Ex2](../../2_Controls/GV/GV.SC-09_Ex2.md), [GV.SC-09_Ex3](../../2_Controls/GV/GV.SC-09_Ex3.md), [GV.SC-09_Ex4](../../2_Controls/GV/GV.SC-09_Ex4.md), [GV.SC-09_Ex5](../../2_Controls/GV/GV.SC-09_Ex5.md)
