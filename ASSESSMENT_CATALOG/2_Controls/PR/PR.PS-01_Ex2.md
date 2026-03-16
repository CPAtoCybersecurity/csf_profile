# PR.PS-01_Ex2: Manage Platform Configurations Through Their Lifecycle

**Subcategory:** PR.PS-01 --- Configuration management practices are established and applied

**NIST SP 800-53 Ref:** CM-02 (Baseline Configuration), CM-03 (Configuration Change Control), CM-09 (Configuration Management Plan)

## Implementation Example

> Manage platform configurations through their lifecycle, including provisioning, configuration changes, and decommissioning, using documented and approved processes.

## Alma Security Implementation

Alma manages platform configurations through Terraform and Ansible with GitLab merge requests requiring peer review and automated validation before deployment to staging then production. Changes follow a formal IT Change Management Policy with standard, normal (ServiceNow ticket + CAB approval), and emergency change workflows. Decommissioning follows a documented rundown procedure but relies on manual checklists, resulting in occasional stale CMDB entries; on-premises Windows DC configurations are managed separately from the IaC workflow.

## Artifacts

- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
