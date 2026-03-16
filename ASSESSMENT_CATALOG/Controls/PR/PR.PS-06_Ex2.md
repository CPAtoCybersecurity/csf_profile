# PR.PS-06_Ex2: Integrate Security Testing into CI/CD Pipeline

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-11 (Developer Testing and Evaluation), SA-15 (Development Process, Standards, and Tools), SI-02 (Flaw Remediation)

## Implementation Example

> Integrate automated security testing into the CI/CD pipeline, including static application security testing (SAST), dynamic application security testing (DAST), and dependency vulnerability scanning, with quality gates that prevent insecure code from reaching production.

## Alma Security Implementation

Alma Security's CI/CD pipeline is built on GitLab CI and deploys containerized applications to AWS EKS. The pipeline includes basic automated testing (unit tests, integration tests) but has limited security-specific testing integration. Container image scanning is performed by Amazon ECR's built-in scanning (powered by Amazon Inspector) on push to the registry, which identifies known CVEs in OS packages and application dependencies within the container image. Scan findings are visible in the ECR console and surfaced through AWS Security Hub.

However, the pipeline does not include SAST tooling to analyze source code for security vulnerabilities during the build process. There is no DAST integration that tests the running application for vulnerabilities such as SQL injection, cross-site scripting, or authentication bypass. Dependency vulnerability scanning beyond container image scanning is not automated; developers are expected to monitor for dependency vulnerabilities manually using `npm audit` or equivalent tools, but this is not enforced or tracked.

Critically, there are no security quality gates in the pipeline. Container images with known critical vulnerabilities can be deployed to production because ECR scanning results are advisory and do not block deployment. The pipeline does not enforce a minimum security threshold that must be met before code can proceed to production. This gap is directly related to the SQL Injection Mitigation project --- the application contains known SQL injection vulnerabilities that were identified through manual assessment rather than automated pipeline scanning.

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
