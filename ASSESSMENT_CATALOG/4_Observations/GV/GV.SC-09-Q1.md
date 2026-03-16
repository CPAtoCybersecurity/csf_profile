# GV.SC-09: Supply Chain Security Practices — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF
**Assessor:** Steve <steve@almasecurity.com>
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
