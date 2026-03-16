# PR.PS-02_Ex4: Verify Software Authenticity Before Deployment

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-14 (Signed Components), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Verify the authenticity and integrity of software before installation using digital signatures, cryptographic checksums, or other verification mechanisms from trusted sources.

## Alma Security Implementation

Alma verifies Linux package authenticity through GPG-signed official repositories locked down in the hardened baseline. Container images are stored in Amazon ECR with Amazon Inspector scanning on push, but no image signing (Cosign/Notary) is implemented to verify integrity between build and deployment. Commercial software verification against vendor checksums is manual and inconsistent, and developer-installed tools lack formal integrity tracking.

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
