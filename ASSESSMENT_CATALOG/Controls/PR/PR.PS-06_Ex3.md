# PR.PS-06_Ex3: Verify Third-Party Software Components

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-04 (Acquisition Process), SA-09 (External System Services), SA-12 (Supply Chain Protection), SR-04 (Provenance)

## Implementation Example

> Verify the security of third-party software components, including open-source libraries, frameworks, and container base images, through vulnerability scanning, license compliance checks, and supply chain risk assessment.

## Alma Security Implementation

Alma Security's SaaS platform is a containerized application with significant third-party dependency exposure through npm packages, container base images, and cloud service integrations. Container base images are pulled from Amazon ECR public repositories and Docker Hub, with images scanned by Amazon Inspector upon push to the private ECR registry. The scanning identifies known CVEs in OS packages and some application-level dependencies within the container image layers.

The development team uses npm as the package manager for the Node.js-based application. Developers are expected to run `npm audit` periodically to check for known vulnerabilities in direct and transitive dependencies, but this practice is not enforced through tooling or policy. There is no automated software composition analysis (SCA) tool integrated into the CI/CD pipeline that systematically tracks all third-party dependencies and their vulnerability status. No software bill of materials (SBOM) is generated or maintained for the application, making it difficult to quickly assess exposure when new vulnerabilities are disclosed in popular libraries.

License compliance for third-party components is not formally tracked. The engineering team generally uses permissively licensed open-source software (MIT, Apache 2.0, BSD), but there is no automated license scanning or policy enforcement to prevent introduction of copyleft or restrictively licensed components. Supply chain risk assessment for third-party dependencies is limited to the vendor security review process for commercial software; open-source dependency supply chain risks (typosquatting, compromised maintainer accounts, dependency confusion) are not systematically addressed.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Amazon ECR image scanning results for container base images | AWS ECR Console | 2026-03-14 |
| npm audit results (ad-hoc developer execution) | Developer workstations | 2026-03-10 |
| package.json and package-lock.json dependency listings | GitLab repository | 2026-03-10 |
| Container base image sources (ECR public, Docker Hub) | Dockerfile configurations / GitLab | 2026-03-10 |
| Vendor security review process for commercial software | ServiceNow / Confluence | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 2 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No automated SCA tool or SBOM generation | Critical --- transitive dependency vulnerabilities not systematically tracked | Implement SCA tool (Snyk, Grype, or Trivy) and SBOM generation (Syft, CycloneDX) in CI/CD | Chris Magann | Q2 2026 |
| npm audit not enforced; reliance on developer discipline | High --- dependency vulnerabilities may persist indefinitely without detection | Add `npm audit --audit-level=high` as required CI/CD pipeline step | Chris Magann | Q2 2026 |
| No license compliance scanning | Medium --- risk of introducing restrictively licensed components | Implement automated license scanning in CI/CD pipeline | Chris Magann | Q3 2026 |
| No supply chain risk assessment for open-source dependencies | Medium --- exposure to dependency confusion, typosquatting attacks | Implement package provenance verification and configure private registry proxy | Tigan Wang | Q3 2026 |
