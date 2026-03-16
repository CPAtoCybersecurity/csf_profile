# ID.RA-01: Vulnerability Identification and Recording -- Q1 2026 Observation

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

Weekly Tenable scans across endpoints and cloud. AWS Inspector continuous assessments. CVSS-based triage with defined SLAs. ServiceNow tracking with remediation owners. 95% scan coverage of managed assets.

### Gaps

SAST/DAST not integrated into CI/CD pipeline. Container image scanning limited to build-time, not runtime. Physical facility vulnerability assessments not performed. Process and procedure vulnerability reviews not formalized.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

## Evidence Reviewed

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Integrate SAST/DAST into CI/CD pipeline | High | Engineering |
| 2 | Implement container runtime vulnerability scanning | Medium | Cloud Platform |
| 3 | Conduct physical facility vulnerability assessment | Medium | Physical Security |
| 4 | Formalize process and procedure vulnerability reviews | Low | Security |
