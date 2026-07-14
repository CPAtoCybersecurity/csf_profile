# ID.RA-02: Cyber Threat Intelligence -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-14
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

CISA and vendor advisory subscriptions active. SentinelOne integrates commercial threat feeds. Weekly threat briefings conducted by security team. Relevant advisories distributed to asset owners.

### Gaps

No STIX/TAXII automated threat intelligence sharing. Threat intelligence not correlated with asset inventory for impact assessment. No dedicated threat intelligence platform (TIP).

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

**Scoring rationale:** A 4 is the top of the Some Security band (2.0–4.9): threat intelligence flows regularly — CISA and vendor advisory subscriptions are active, SentinelOne ingests commercial feeds, the security team runs weekly threat briefings, and relevant advisories reach asset owners — but with material weaknesses in how the intelligence becomes decision-ready. There is no threat intelligence platform, no STIX/TAXII automation, and critically no correlation of intelligence against the asset inventory, so impact assessment stays manual and best-effort. Minimally Acceptable (5.0) is separated from this score by consistent end-to-end operation: intelligence reliably assessed for organizational impact across the asset base, not just distributed and read.

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Evaluate and implement a threat intelligence platform (TIP) | Medium | Security |
| 2 | Implement STIX/TAXII automated intelligence sharing | Medium | Security |
| 3 | Correlate threat intelligence with asset inventory for impact assessment | High | Security |
| 4 | Establish formal intelligence sharing agreements with key partners | Low | Security |

## Related

- **Test Procedure:** [ID.RA-02 Test Procedures](../../3_Test_Procedures/ID/ID.RA-02.md)
- **Controls:** [ID.RA-02_Ex1](../../2_Controls/ID/ID.RA-02_Ex1.md), [ID.RA-02_Ex2](../../2_Controls/ID/ID.RA-02_Ex2.md), [ID.RA-02_Ex3](../../2_Controls/ID/ID.RA-02_Ex3.md)
