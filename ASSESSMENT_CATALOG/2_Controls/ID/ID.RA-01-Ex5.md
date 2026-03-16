# ID.RA-01: Vulnerability Identification and Recording

**Subcategory:** ID.RA-01 — Vulnerabilities in assets are identified, validated, and recorded
**NIST SP 800-53 Ref:** CA-02,CA-07,CA-08,RA-03,RA-05,SA-11(02),SA-15(07),SA-15(08),SI-04,SI-05

## Implementation Example

> Ex5: Monitor sources of cyber threat intelligence for information on new vulnerabilities in products

## Alma Security Implementation

Alma Security operates weekly vulnerability scans using Tenable across all managed endpoints and cloud infrastructure. Scan results are triaged by severity using CVSS scores and remediated per the patch management SLA. AWS Inspector runs continuous assessments on EC2 instances and container images. Vulnerability findings are tracked in ServiceNow with assigned remediation owners.

## Artifacts

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
