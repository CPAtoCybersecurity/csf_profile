# PR.PS-06: Secure Software Development Practices - Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed GitLab CI/CD pipeline configuration, Amazon ECR image scanning results, development process documentation, Jira security-related stories, and SQL Injection Mitigation project documentation |
| Interview | Yes | Interviewed Chris Magann on development practices, security testing integration, and SSDLC roadmap plans |
| Test | Yes | Reviewed pipeline configuration for security scan stages; verified ECR scan results do not block deployment; checked for SAST/DAST tooling in pipeline (not present); examined dependency management practices |

---

## Findings

### Strengths

- Containerized application architecture deployed on AWS EKS provides infrastructure-level isolation
- Amazon ECR image scanning (Inspector-powered) identifies known CVEs in container images on push
- CI/CD pipeline built on GitLab CI with automated unit and integration testing
- Container base images rebuilt weekly, providing regular security update cadence for dependencies within images
- CISO has flagged SSDLC establishment as a priority for Q3 2026, indicating organizational awareness of the gap

### Gaps

- No formal Secure Software Development Lifecycle (SSDLC) policy or standards document; security in development is ad hoc and dependent on individual developer awareness
- No SAST tooling integrated into CI/CD pipeline; source code is not automatically analyzed for security vulnerabilities before deployment
- No DAST tooling; the running application is not tested for vulnerabilities like SQL injection or XSS through automated scanning
- No security quality gates in the pipeline; container images with critical CVEs can deploy to production without blocking
- SQL Injection Mitigation project ($60K budget) has not started despite being identified through vulnerability scanning; this represents a known, unaddressed vulnerability class in the production application
- No SBOM generation or automated software composition analysis for dependency tracking
- No threat modeling practice for new features or architectural changes
- No developer security training program specific to secure coding practices
- npm audit not enforced in the pipeline; dependency vulnerability scanning relies on ad-hoc developer initiative
- No license compliance scanning for third-party dependencies

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 2.5 |
| Target Score | 5 |

---

## Evidence Reviewed

- GitLab CI/CD pipeline configuration (.gitlab-ci.yml)
- Amazon ECR image scanning configuration and recent results
- AWS Security Hub findings from ECR scanning
- Development process documentation (Confluence engineering wiki)
- Jira security-related story samples (ad-hoc, not systematic)
- SQL Injection Mitigation project documentation ($60K, not started)
- CISO quarterly plan with SSDLC roadmap reference (Q3 2026)
- Container base image rebuild pipeline configuration
- package.json dependency listings

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Prioritize and begin SQL Injection Mitigation project immediately; this is a known critical vulnerability in production | Critical | Chris Magann |
| 2 | Integrate SAST tool (Semgrep, SonarQube, or Snyk Code) into GitLab CI pipeline with quality gates | Critical | Chris Magann |
| 3 | Implement security quality gates that block deployment on critical/high findings | Critical | Chris Magann |
| 4 | Develop formal SSDLC policy aligned to NIST SP 800-218 (SSDF); do not wait for Q3 2026 timeline | High | Chris Magann |
| 5 | Add automated dependency scanning (Snyk, Dependabot) and enforce npm audit in pipeline | High | Chris Magann |
| 6 | Implement SBOM generation (Syft, CycloneDX) in CI/CD pipeline | Medium | Chris Magann |
| 7 | Implement DAST scanning in staging environment (OWASP ZAP or Burp Suite Enterprise) | Medium | Chris Magann |
| 8 | Establish lightweight threat modeling for security-sensitive features | Medium | Chris Magann |
