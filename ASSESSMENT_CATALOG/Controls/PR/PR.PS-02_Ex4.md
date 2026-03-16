# PR.PS-02_Ex4: Verify Software Authenticity Before Deployment

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-14 (Signed Components), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Verify the authenticity and integrity of software before installation using digital signatures, cryptographic checksums, or other verification mechanisms from trusted sources.

## Alma Security Implementation

Alma Security employs several mechanisms to verify software authenticity before deployment, though coverage varies by software type. Linux packages are installed exclusively through official distribution repositories (Amazon Linux Extras, Ubuntu APT) with GPG signature verification enabled by default. The package manager configurations are locked to approved repositories through the hardened baseline, preventing addition of untrusted third-party sources without infrastructure team approval.

Container images used in Alma's Kubernetes environment are stored in Amazon ECR, which serves as the sole approved image registry. The ECR repository is configured with image scanning on push using Amazon Inspector, which validates images for known vulnerabilities before they are available for deployment. However, container image signing (e.g., Sigstore Cosign, Notary) is not yet implemented, meaning there is no cryptographic verification that images have not been tampered with between build and deployment. The CI/CD pipeline builds images from source and pushes directly to ECR, but the chain of trust from build to deployment lacks formal integrity verification.

For commercial software procurement, Alma's IT team verifies downloads against vendor-published checksums when available. However, this process is manual and not consistently documented. Developer-installed tools (IDEs, CLI utilities) are generally installed from vendor websites or official package managers (Homebrew, Chocolatey) without formal integrity verification tracking.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Linux package manager repository configuration (locked to official repos) | Ansible baseline playbooks | 2026-03-10 |
| Amazon ECR repository configuration with image scanning | AWS ECR Console | 2026-03-14 |
| ECR image scan results on push | AWS Inspector / ECR | 2026-03-14 |
| CI/CD pipeline image build and push workflow | GitLab CI/CD configuration | 2026-03-10 |
| Software procurement verification checklist | IT operations Confluence | 2026-01-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No container image signing or verification (Cosign/Notary not implemented) | High --- images could be tampered with between build and deployment | Implement Sigstore Cosign for container image signing and verification | Tigan Wang | Q2 2026 |
| Commercial software integrity verification is manual and inconsistent | Medium --- risk of deploying tampered software | Formalize software verification checklist with mandatory sign-off in ServiceNow | Chris Magann | Q3 2026 |
| Developer tools installed without integrity tracking | Low --- low-risk category but creates audit gaps | Include developer toolset in approved software catalog with verified sources | Chris Magann | Q3 2026 |
