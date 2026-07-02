# ID.RA-08: Vulnerability Disclosure Management -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-16
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

Security team contact email published for receiving disclosures. Incoming vulnerability reports are triaged and tracked. Vendor security advisories are monitored.

### Gaps

No formal vulnerability disclosure program (VDP). No security.txt published per RFC 9116. No structured vulnerability information sharing agreements with suppliers. Disclosure response SLAs not defined.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** A 3 places disclosure management in Some Security (2.0–4.9): the practice is understood and performed — a security team contact email is published, incoming reports get triaged and tracked, and vendor advisories are monitored — but it rests on informal handling rather than a reliable, defined program. There is no formal VDP, no security.txt per RFC 9116 to make the intake channel discoverable, no defined response SLAs, and no structured vulnerability-sharing agreements with suppliers, so response quality depends on who happens to pick up the report. Reaching Minimally Acceptable (5.0) requires a formalized disclosure channel with published SLAs operating consistently through the period, with responses evidenced rather than best-effort.

## Evidence Reviewed

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Publish security.txt per RFC 9116 | High | Security |
| 2 | Establish formal vulnerability disclosure program (VDP) | High | Security |
| 3 | Define disclosure response SLAs | Medium | Security |
| 4 | Formalize vulnerability information sharing agreements with suppliers | Medium | Security |

## Related

- **Test Procedure:** [ID.RA-08 Test Procedures](../../3_Test_Procedures/ID/ID.RA-08.md)
- **Controls:** [ID.RA-08_Ex1](../../2_Controls/ID/ID.RA-08_Ex1.md), [ID.RA-08_Ex2](../../2_Controls/ID/ID.RA-08_Ex2.md)
