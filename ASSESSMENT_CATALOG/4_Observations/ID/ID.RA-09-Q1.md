# ID.RA-09: Acquisition Integrity Assessment -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve <steve@almasecurity.com>
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

Vendor security questionnaires required for new acquisitions. AWS Marketplace provides vetted software sources. Critical deployment packages verified via checksums. Approved vendor list maintained.

### Gaps

Software integrity verification not standardized for all acquisitions. No SBOM requirement for procured software. Hardware authenticity assessment limited to supply chain trust. No code signing verification policy for internally developed software.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

## Evidence Reviewed

- [Third-Party Risk Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Standardize software integrity verification for all acquisitions | High | IT Operations |
| 2 | Implement SBOM requirements for procured software | Medium | Procurement |
| 3 | Establish code signing verification policy | Medium | Engineering |
| 4 | Enhance hardware authenticity assessment beyond supply chain trust | Low | Procurement |
