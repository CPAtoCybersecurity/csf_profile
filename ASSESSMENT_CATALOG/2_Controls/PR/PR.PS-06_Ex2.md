# PR.PS-06_Ex2: Integrate Security Testing into CI/CD Pipeline

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-11 (Developer Testing and Evaluation), SA-15 (Development Process, Standards, and Tools), SI-02 (Flaw Remediation)

## Implementation Example

> Integrate automated security testing into the CI/CD pipeline, including static application security testing (SAST), dynamic application security testing (DAST), and dependency vulnerability scanning, with quality gates that prevent insecure code from reaching production.

## Alma Security Implementation

Alma's GitLab CI/CD pipeline includes unit/integration tests and Amazon ECR image scanning (Inspector) for container CVEs, with findings surfaced through Security Hub. No SAST, DAST, or automated dependency scanning is integrated into the pipeline. No security quality gates exist -- container images with known critical CVEs can deploy to production, and dependency scanning relies on manual developer execution of `npm audit`.

## Artifacts

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
