# PR.PS-06_Ex3: Verify Third-Party Software Components

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-04 (Acquisition Process), SA-09 (External System Services), SA-12 (Supply Chain Protection), SR-04 (Provenance)

## Implementation Example

> Verify the security of third-party software components, including open-source libraries, frameworks, and container base images, through vulnerability scanning, license compliance checks, and supply chain risk assessment.

## Alma Security Implementation

Alma scans container base images via Amazon Inspector on push to ECR, identifying known CVEs in OS packages and some application dependencies. The Node.js application uses npm, but `npm audit` is manual and unenforced -- no SCA tool or SBOM generation is integrated into the CI/CD pipeline. License compliance and open-source supply chain risks (typosquatting, dependency confusion) are not systematically tracked or mitigated.

## Artifacts

- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
- [Patch Management Procedure](../../Artifacts/Procedures/PROC-patch-management.md)
- [Third-Party Risk Policy](../../Artifacts/Policies/POL-third-party-risk.md)
