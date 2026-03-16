# PR.PS-01_Ex2: Manage Platform Configurations Through Their Lifecycle

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-02 (Baseline Configuration), CM-03 (Configuration Change Control), CM-09 (Configuration Management Plan)

## Implementation Example

> Manage platform configurations through their lifecycle, including provisioning, configuration changes, and decommissioning, using documented and approved processes.

## Alma Security Implementation

Alma Security manages platform configurations through infrastructure-as-code (IaC) practices that govern the full lifecycle from provisioning through decommissioning. All production infrastructure is provisioned via Terraform with configuration management handled by Ansible. Changes to platform configurations require a merge request in GitLab with at least one infrastructure team reviewer and must pass automated validation (terraform plan, ansible-lint, security policy checks) before merging. The GitLab pipeline automatically applies approved changes to staging before production.

Configuration changes follow Alma's change management process documented in the IT Change Management Policy. Standard changes (pre-approved, low-risk configuration updates) are deployed through the automated pipeline after peer review. Normal changes require a change ticket in ServiceNow with impact analysis, rollback plan, and approval from the infrastructure lead. Emergency changes follow an expedited process with post-implementation review required within 48 hours. The change advisory board (CAB) meets weekly to review upcoming normal changes and retroactively review emergency changes.

Decommissioning follows a documented rundown procedure that includes removing the system from monitoring, revoking access credentials, updating the CMDB, and archiving the configuration state. However, the decommissioning process is not yet fully automated and relies on manual checklist completion, which has resulted in occasional stale entries in the asset inventory.

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
