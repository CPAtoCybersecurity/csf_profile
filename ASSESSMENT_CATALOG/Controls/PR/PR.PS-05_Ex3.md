# PR.PS-05_Ex3: Block Unauthorized Executables at Runtime

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-10 (Software Usage Restrictions), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Block the execution of unauthorized executables, scripts, and code at runtime through allowlisting, code signing enforcement, or other execution control mechanisms.

## Alma Security Implementation

Alma uses SentinelOne behavioral AI on endpoints to block known-malicious executables and evaluate unknowns at runtime. Linux servers rely on hardened baselines (noexec mounts, restricted permissions) without dedicated application control; SELinux is not enabled. Kubernetes pod security is partially enforced via a custom admission webhook, but a shared SSH key provides root access to cluster nodes on port 45001, bypassing container isolation controls.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SentinelOne behavioral AI and execution monitoring configuration | SentinelOne Console | 2026-03-14 |
| SentinelOne quarantine and block logs (recent examples) | SentinelOne Console | 2026-03-14 |
| Linux hardened baseline noexec mount configurations | Ansible playbooks | 2026-03-10 |
| Kubernetes pod security admission webhook configuration | Kubernetes manifests / GitLab | 2026-03-10 |
| SSH access audit logs for Kubernetes nodes (port 45001) | CloudWatch Logs | 2026-03-14 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| SELinux not enabled on Linux servers; no allowlist-level execution control | Medium --- any executable with proper permissions can run on servers | Evaluate SELinux enforcement or AppArmor profiles for production Linux servers | Tigan Wang | Q3 2026 |
| Shared SSH key provides root access to K8s nodes (port 45001) bypassing container controls | Critical --- developers can execute arbitrary code on cluster hosts | Remediate shared SSH key; implement individual key-based access with audit logging | Tigan Wang | Q2 2026 |
| Kubernetes pod security standards not comprehensively enforced | Medium --- containers may run with elevated privileges or unrestricted capabilities | Deploy OPA Gatekeeper or Kyverno for comprehensive pod security enforcement | Tigan Wang | Q2 2026 |
