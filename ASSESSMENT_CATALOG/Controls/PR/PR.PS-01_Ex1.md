# PR.PS-01_Ex1: Establish Hardened Baselines for Platform Configurations

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-01 (Policy and Procedures), CM-02 (Baseline Configuration), CM-06 (Configuration Settings)

## Implementation Example

> Establish, test, deploy, and maintain hardened baselines that enforce security configuration settings and remove unnecessary services, ports, and protocols from platforms.

## Alma Security Implementation

Alma deploys CIS Benchmark Level 2 hardened baselines for Amazon Linux 2 and Ubuntu via Terraform and Ansible, covering approximately 95% of production systems. AWS Config monitors compliance against 47 rules, with non-compliant resources triggering PagerDuty (critical) or Slack alerts and remediation SLAs (critical: 24h, high: 72h, medium: 7d). The remaining 5% are legacy dev environments scheduled for Q2 2026 migration, and Kubernetes node baselines have not been independently validated against the CIS Kubernetes Benchmark.

## Artifacts

- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Patch Management Procedure](../../Artifacts/Procedures/PROC-patch-management.md)
- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
