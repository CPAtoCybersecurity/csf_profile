# PR.PS-06_Ex2: Integrate Security Testing into CI/CD Pipeline

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-11 (Developer Testing and Evaluation), SA-15 (Development Process, Standards, and Tools), SI-02 (Flaw Remediation)

## Implementation Example

> Integrate automated security testing into the CI/CD pipeline, including static application security testing (SAST), dynamic application security testing (DAST), and dependency vulnerability scanning, with quality gates that prevent insecure code from reaching production.

## Alma Security Implementation

Alma's GitLab CI/CD pipeline includes unit/integration tests and Amazon ECR image scanning (Inspector) for container CVEs, with findings surfaced through Security Hub. No SAST, DAST, or automated dependency scanning is integrated into the pipeline. No security quality gates exist -- container images with known critical CVEs can deploy to production, and dependency scanning relies on manual developer execution of `npm audit`.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| GitLab CI/CD pipeline configuration (.gitlab-ci.yml) | GitLab repository | 2026-03-10 |
| Amazon ECR image scanning configuration and results | AWS ECR Console | 2026-03-14 |
| AWS Security Hub findings from ECR scanning | AWS Security Hub | 2026-03-14 |
| Unit test and integration test pipeline stages | GitLab CI/CD | 2026-03-10 |
| npm audit results (manual, ad-hoc) | Developer workstations | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 2 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No SAST integration in CI/CD pipeline | Critical --- source code vulnerabilities not detected before deployment | Integrate SAST tool (e.g., Semgrep, SonarQube, Snyk Code) into GitLab pipeline | Chris Magann | Q2 2026 |
| No DAST integration for runtime vulnerability testing | High --- application-layer vulnerabilities like SQL injection not automatically tested | Implement DAST scanning (e.g., OWASP ZAP, Burp Suite Enterprise) in staging environment | Chris Magann | Q3 2026 |
| No security quality gates; vulnerable images can deploy to production | Critical --- known vulnerabilities reach production without automated prevention | Configure pipeline to fail on critical/high CVE findings from ECR scanning and SAST results | Chris Magann | Q2 2026 |
| Dependency scanning not automated or enforced | Medium --- vulnerable dependencies may persist undetected | Add automated dependency scanning (Snyk, Dependabot) to pipeline with quality gates | Chris Magann | Q2 2026 |
