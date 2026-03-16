# PR.PS-02_Ex4: Verify Software Authenticity Before Deployment

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-14 (Signed Components), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Verify the authenticity and integrity of software before installation using digital signatures, cryptographic checksums, or other verification mechanisms from trusted sources.

## Alma Security Implementation

Alma verifies Linux package authenticity through GPG-signed official repositories locked down in the hardened baseline. Container images are stored in Amazon ECR with Amazon Inspector scanning on push, but no image signing (Cosign/Notary) is implemented to verify integrity between build and deployment. Commercial software verification against vendor checksums is manual and inconsistent, and developer-installed tools lack formal integrity tracking.

## Artifacts

- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Software Inventory](../../Artifacts/Inventories/INV-software-inventory.md)
- [Patch Management Procedure](../../Artifacts/Procedures/PROC-patch-management.md)
