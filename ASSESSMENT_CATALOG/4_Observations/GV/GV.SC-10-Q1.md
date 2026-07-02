# GV.SC-10: Post-Relationship Provisions — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-15
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed offboarding procedures, EOL tracker, access revocation records, data destruction certs |
| Interview | Yes | GRC Manager, Identity Management Lead |
| Test | Yes | Verified access revocation and data destruction for 2 recently terminated vendor relationships |

## Findings

### Strengths

- Vendor offboarding procedures documented for both normal and adverse terminations
- EOL tracker maintained in ServiceNow with 12-month advance planning window
- Access deactivation workflow triggers within 24 hours of termination notification
- Data destruction certification required within 30 days of contract end

### Gaps

- 1 of 2 sampled terminations had orphaned API key revoked 5 days after termination (missed in initial sweep)
- Data leakage risk assessment not documented for either sampled termination
- Transition plan template not formalized for Tier 1 vendor transitions

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

**Scoring rationale:** Post-relationship provisions score 5 — Minimally Acceptable, the rubric's minimum passing level: documented offboarding procedures cover both normal and adverse terminations, the ServiceNow EOL tracker provides a 12-month planning window, and the 24-hour access deactivation workflow and 30-day data destruction certification requirement operated for the sampled terminations. Re-performance testing exposed the flaws holding it at the floor: 1 of 2 sampled terminations had an orphaned API key revoked 5 days late after being missed in the initial sweep, neither termination had a documented data leakage risk assessment, and no Tier 1 transition plan template exists. Optimized (6) requires measured, drift-corrected execution — a control that misses non-human identities in its sweep and skips a required assessment in both sampled cases has consistency with minor flaws, not measurement-driven quality.

## Evidence Reviewed

- Vendor offboarding procedure documentation
- EOL tracker in ServiceNow
- Access revocation audit logs for terminated vendors
- Data destruction certificates (2 sampled)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Add API key and service account sweep to offboarding checklist | High | Identity Management Lead |
| 2 | Require documented data leakage risk assessment for all terminations | High | GRC Manager |
| 3 | Create Tier 1 vendor transition plan template | Medium | GRC Manager |

## Related

- **Test Procedure:** [GV.SC-10 Test Procedures](../../3_Test_Procedures/GV/GV.SC-10.md)
- **Controls:** [GV.SC-10_Ex1](../../2_Controls/GV/GV.SC-10_Ex1.md), [GV.SC-10_Ex2](../../2_Controls/GV/GV.SC-10_Ex2.md), [GV.SC-10_Ex3](../../2_Controls/GV/GV.SC-10_Ex3.md), [GV.SC-10_Ex4](../../2_Controls/GV/GV.SC-10_Ex4.md), [GV.SC-10_Ex5](../../2_Controls/GV/GV.SC-10_Ex5.md), [GV.SC-10_Ex6](../../2_Controls/GV/GV.SC-10_Ex6.md), [GV.SC-10_Ex7](../../2_Controls/GV/GV.SC-10_Ex7.md)
