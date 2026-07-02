# ID.RA-01: Vulnerability Identification and Recording -- Q1 2026 Observation

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

Weekly Tenable scans across endpoints and cloud. AWS Inspector continuous assessments. CVSS-based triage with defined SLAs. ServiceNow tracking with remediation owners. 95% scan coverage of managed assets.

### Gaps

SAST/DAST not integrated into CI/CD pipeline. Container image scanning limited to build-time, not runtime. Physical facility vulnerability assessments not performed. Process and procedure vulnerability reviews not formalized.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

**Scoring rationale:** The 5 earns Minimally Acceptable (5.0–5.9) — per the boundary rule, exactly 5.0 opens this band — and it is the anchor for consistent full-scope execution with minor flaws: weekly Tenable scans across endpoints and cloud, AWS Inspector running continuously, CVSS-based triage with defined SLAs, ServiceNow tracking with named remediation owners, and 95% scan coverage of managed assets. The residual gaps (SAST/DAST absent from the CI/CD pipeline, container images scanned only at build time, no physical facility assessments) are known and bounded rather than process failures. What separates 5 from Optimized (6.0) is measurement in the rubric's sense — the owner demonstrably reviewing coverage and SLA indicators and acting on drift, plus closure of the application-layer and runtime scanning blind spots — and the target of 7 would further require multi-period improvement trends.

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

## Related

- **Test Procedure:** [ID.RA-01 Test Procedures](../../3_Test_Procedures/ID/ID.RA-01.md)
- **Controls:** [ID.RA-01_Ex1](../../2_Controls/ID/ID.RA-01_Ex1.md), [ID.RA-01_Ex2](../../2_Controls/ID/ID.RA-01_Ex2.md), [ID.RA-01_Ex3](../../2_Controls/ID/ID.RA-01_Ex3.md), [ID.RA-01_Ex4](../../2_Controls/ID/ID.RA-01_Ex4.md), [ID.RA-01_Ex5](../../2_Controls/ID/ID.RA-01_Ex5.md), [ID.RA-01_Ex6](../../2_Controls/ID/ID.RA-01_Ex6.md)
