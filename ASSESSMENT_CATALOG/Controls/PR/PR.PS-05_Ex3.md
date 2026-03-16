# PR.PS-05_Ex3: Block Unauthorized Executables at Runtime

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-10 (Software Usage Restrictions), SI-07 (Software, Firmware, and Information Integrity)

## Implementation Example

> Block the execution of unauthorized executables, scripts, and code at runtime through allowlisting, code signing enforcement, or other execution control mechanisms.

## Alma Security Implementation

Alma Security's runtime execution controls are layered across different platform types. On workstations and laptops, SentinelOne provides the primary execution control capability. The agent monitors all process execution and applies its behavioral AI engine along with the organization's application control policy to identify and respond to unauthorized or malicious executables. Known malicious executables are blocked and quarantined in real-time. SentinelOne's Static AI analysis evaluates unknown executables before allowing execution, providing an additional layer of protection beyond signature-based detection.

On Linux servers, execution control relies on the hardened baseline configuration rather than a dedicated application control agent. The baselines restrict executable permissions, disable unnecessary interpreters, and configure filesystem mount options (noexec on /tmp and /var/tmp). However, these controls do not provide allowlist-level enforcement --- any executable with appropriate filesystem permissions can run. SELinux is not enabled on Amazon Linux 2 instances (it is available but was not included in the baseline due to application compatibility concerns).

In the Kubernetes environment, container execution is constrained by container isolation boundaries and namespace resource policies. Pod security standards are partially enforced through a custom admission webhook, but the enforcement is not comprehensive. There is no runtime execution control within containers beyond what the container image provides. The shared SSH key issue (developers accessing Kubernetes nodes via port 45001 with root access) creates a significant gap where authorized users could execute arbitrary code directly on cluster nodes, bypassing all container-level controls.

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
