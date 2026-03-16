# PR.PS-01_Ex1: Establish Hardened Baselines for Platform Configurations

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-01 (Policy and Procedures), CM-02 (Baseline Configuration), CM-06 (Configuration Settings)

## Implementation Example

> Establish, test, deploy, and maintain hardened baselines that enforce security configuration settings and remove unnecessary services, ports, and protocols from platforms.

## Alma Security Implementation

Alma deploys CIS Benchmark Level 2 hardened baselines for Amazon Linux 2 and Ubuntu via Terraform and Ansible, covering approximately 95% of production systems. AWS Config monitors compliance against 47 rules, with non-compliant resources triggering PagerDuty (critical) or Slack alerts and remediation SLAs (critical: 24h, high: 72h, medium: 7d). The remaining 5% are legacy dev environments scheduled for Q2 2026 migration, and Kubernetes node baselines have not been independently validated against the CIS Kubernetes Benchmark.

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
