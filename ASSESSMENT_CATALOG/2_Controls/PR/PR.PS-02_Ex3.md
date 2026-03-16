# PR.PS-02_Ex3: Patch Management Operations

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SI-02 (Flaw Remediation), CM-03 (Configuration Change Control), MA-02 (Controlled Maintenance)

## Implementation Example

> Establish and operate a patch management program that identifies, tests, and applies security patches within risk-based timelines appropriate to the severity of the vulnerability.

## Alma Security Implementation

Alma automates Linux patching via AWS Systems Manager Patch Manager (critical/high: 14 days, emergency: 72 hours, medium/low: 30 days) and manages Windows workstation patching through WSUS. Container base images are rebuilt weekly with out-of-cycle rebuilds for critical CVEs, and patch compliance is reported monthly to the CISO. The Windows Server 2012 R2 fileserver cannot be patched due to EOL, and Kubernetes node patching occasionally exceeds SLAs due to workload coordination delays.

## Artifacts

- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
