# PR.PS-01_Ex2: Manage Platform Configurations Through Their Lifecycle

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-02 (Baseline Configuration), CM-03 (Configuration Change Control), CM-09 (Configuration Management Plan)

## Implementation Example

> Manage platform configurations through their lifecycle, including provisioning, configuration changes, and decommissioning, using documented and approved processes.

## Alma Security Implementation

Alma manages platform configurations through Terraform and Ansible with GitLab merge requests requiring peer review and automated validation before deployment to staging then production. Changes follow a formal IT Change Management Policy with standard, normal (ServiceNow ticket + CAB approval), and emergency change workflows. Decommissioning follows a documented rundown procedure but relies on manual checklists, resulting in occasional stale CMDB entries; on-premises Windows DC configurations are managed separately from the IaC workflow.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Infrastructure-as-code repository with merge request history | GitLab IaC repository | 2026-03-10 |
| IT Change Management Policy | Confluence policy repository | 2026-02-15 |
| ServiceNow change ticket examples (standard, normal, emergency) | ServiceNow | 2026-03-12 |
| Terraform plan validation pipeline configuration | GitLab CI/CD configuration | 2026-03-10 |
| Decommissioning checklist and rundown procedure | Confluence operations wiki | 2026-01-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Decommissioning process not automated; relies on manual checklists | Medium --- stale CMDB entries and potential orphaned resources | Automate decommissioning workflow with CMDB integration | Tigan Wang | Q3 2026 |
| On-premises Windows DC configurations managed separately from IaC | Medium --- configuration drift risk for non-IaC-managed systems | Extend IaC management or implement equivalent automated controls for Windows DC | Chris Magann | Q3 2026 |
