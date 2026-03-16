# PR.PS-02_Ex3: Patch Management Operations

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** SI-02 (Flaw Remediation), CM-03 (Configuration Change Control), MA-02 (Controlled Maintenance)

## Implementation Example

> Establish and operate a patch management program that identifies, tests, and applies security patches within risk-based timelines appropriate to the severity of the vulnerability.

## Alma Security Implementation

Alma automates Linux patching via AWS Systems Manager Patch Manager (critical/high: 14 days, emergency: 72 hours, medium/low: 30 days) and manages Windows workstation patching through WSUS. Container base images are rebuilt weekly with out-of-cycle rebuilds for critical CVEs, and patch compliance is reported monthly to the CISO. The Windows Server 2012 R2 fileserver cannot be patched due to EOL, and Kubernetes node patching occasionally exceeds SLAs due to workload coordination delays.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Patch management policy and SLA definitions | Confluence policy repository | 2026-02-15 |
| AWS Systems Manager Patch Manager configuration | AWS Console | 2026-03-14 |
| Patch compliance dashboard (last 90 days) | AWS Systems Manager | 2026-03-14 |
| Container base image rebuild pipeline configuration | GitLab CI/CD | 2026-03-10 |
| Vulnerability scan results and patch tickets | Jira / scanning tool dashboard | 2026-03-12 |
| Monthly patch compliance report to CISO | Confluence reporting | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Windows Server 2012 R2 cannot be patched (EOL) | Critical --- system running unpatched for 2+ years | Decommission as part of Q3 2026 migration project | Chris Magann | Q3 2026 |
| Kubernetes node patching occasionally exceeds SLA due to workload coordination | Medium --- delayed patching increases vulnerability window | Implement automated node draining and rolling update process | Tigan Wang | Q2 2026 |
| Application-layer patching (npm, pip dependencies) relies on developer-initiated updates | Medium --- dependency vulnerabilities may persist between CI/CD scans | Implement automated dependency update PRs (e.g., Dependabot, Renovate) | Chris Magann | Q2 2026 |
