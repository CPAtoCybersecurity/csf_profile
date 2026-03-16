# PR.PS-05_Ex3: Block Unauthorized Executables at Runtime

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-10 (Software Usage Restrictions), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Block the execution of unauthorized executables, scripts, and code at runtime through allowlisting, code signing enforcement, or other execution control mechanisms.

## Alma Security Implementation

Alma uses SentinelOne behavioral AI on endpoints to block known-malicious executables and evaluate unknowns at runtime. Linux servers rely on hardened baselines (noexec mounts, restricted permissions) without dedicated application control; SELinux is not enabled. Kubernetes pod security is partially enforced via a custom admission webhook, but a shared SSH key provides root access to cluster nodes on port 45001, bypassing container isolation controls.

## Artifacts

- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
