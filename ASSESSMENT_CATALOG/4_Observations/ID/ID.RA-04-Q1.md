# ID.RA-04: Impact and Likelihood Assessment -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-15
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

Risk register maintained with likelihood and impact ratings. Annual risk assessment workshops include business leadership. Quantitative risk scoring methodology documented.

### Gaps

Cascading failure analysis limited to top-tier critical systems. Emerging threat scenarios not systematically evaluated. Risk assessments performed annually rather than continuously. Business impact analysis not completed for all systems.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 6 |

**Scoring rationale:** A 3 lands in Some Security (2.0–4.9): the assessment process is defined — a risk register carries likelihood and impact ratings, a quantitative scoring methodology is documented, and annual workshops involve business leadership — but execution is unreliable in coverage and cadence. Risk assessment happens once a year rather than continuously, business impact analysis is incomplete across the system population, cascading failure analysis stops at top-tier critical systems, and emerging threat scenarios are not systematically evaluated. Minimally Acceptable (5.0) is separated from this score by consistent full-scope execution: impact and likelihood assessed for all systems through the period, with the annual-only rhythm replaced by something that keeps ratings current.

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Expand cascading failure analysis beyond top-tier critical systems | Medium | Security |
| 2 | Implement continuous risk assessment for emerging threats | High | Security |
| 3 | Complete business impact analysis for all systems | Medium | Business Operations |
| 4 | Evaluate risk quantification methodology (e.g., FAIR) | Low | Security |

## Related

- **Test Procedure:** [ID.RA-04 Test Procedures](../../3_Test_Procedures/ID/ID.RA-04.md)
- **Controls:** [ID.RA-04_Ex1](../../2_Controls/ID/ID.RA-04_Ex1.md), [ID.RA-04_Ex2](../../2_Controls/ID/ID.RA-04_Ex2.md), [ID.RA-04_Ex3](../../2_Controls/ID/ID.RA-04_Ex3.md)
