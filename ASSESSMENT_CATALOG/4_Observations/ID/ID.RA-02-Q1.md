# ID.RA-02: Cyber Threat Intelligence -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve <steve@almasecurity.com>
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
