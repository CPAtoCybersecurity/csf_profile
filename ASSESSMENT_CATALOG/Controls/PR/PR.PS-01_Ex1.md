# PR.PS-01_Ex1: Establish Hardened Baselines for Platform Configurations

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-01 (Policy and Procedures), CM-02 (Baseline Configuration), CM-06 (Configuration Settings)

## Implementation Example

> Establish, test, deploy, and maintain hardened baselines that enforce security configuration settings and remove unnecessary services, ports, and protocols from platforms.

## Alma Security Implementation

Alma Security maintains hardened baselines for its two primary server operating systems: Amazon Linux 2 and Ubuntu. These baselines are derived from CIS Benchmark Level 2 profiles and tailored for Alma's SaaS platform requirements. The baselines are codified as infrastructure-as-code using Terraform and Ansible playbooks stored in a version-controlled repository, ensuring that every provisioned system inherits the approved configuration automatically. Approximately 95% of production systems are currently running on hardened baselines.

The baselines enforce specific security configuration settings including disabled unnecessary services (Telnet, FTP, NFS), restricted SSH configurations (key-based auth only, root login disabled), kernel hardening parameters (ASLR, exec-shield), filesystem mount options (noexec on /tmp, nosuid on removable media), and audit logging configurations. Kubernetes node baselines additionally restrict host-level network access and enforce pod security standards. The remaining 5% of systems not yet on hardened baselines consist primarily of legacy development environments scheduled for migration in Q2 2026.

AWS Config is deployed across all accounts to continuously monitor configuration compliance against the documented baselines. Config rules evaluate system configurations against 47 custom and managed rules aligned to the CIS benchmarks. Non-compliant resources trigger SNS notifications routed to the infrastructure team's Slack channel and PagerDuty for critical deviations. The infrastructure team reviews compliance dashboards weekly and remediates drift within defined SLAs (critical: 24 hours, high: 72 hours, medium: 7 days).

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| CIS Benchmark-derived baseline documentation | Infrastructure wiki / Confluence | 2026-03-01 |
| Ansible playbooks for baseline enforcement | GitLab infrastructure-as-code repository | 2026-03-10 |
| Terraform modules for hardened AMI provisioning | GitLab IaC repository | 2026-03-10 |
| AWS Config compliance dashboard | AWS Console / Config Dashboard | 2026-03-14 |
| AWS Config rules inventory (47 rules) | AWS Config rules export | 2026-03-14 |
| Deviation alert SNS/Slack/PagerDuty configuration | AWS SNS + PagerDuty config | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 5% of systems not on hardened baselines (legacy dev environments) | Medium --- unmanaged configurations may introduce vulnerabilities | Migrate remaining systems to hardened AMIs or decommission | Chris Magann | Q2 2026 |
| Kubernetes node baselines not independently validated against CIS Kubernetes Benchmark | Medium --- K8s-specific hardening gaps may exist | Implement kube-bench scanning for CIS Kubernetes Benchmark validation | Tigan Wang | Q2 2026 |
| Baseline review cadence not formally documented (ad-hoc updates) | Low --- baselines may drift from current CIS recommendations | Establish quarterly baseline review cycle tied to CIS Benchmark releases | Chris Magann | Q3 2026 |
