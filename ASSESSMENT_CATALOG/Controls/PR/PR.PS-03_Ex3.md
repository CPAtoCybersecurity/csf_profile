# PR.PS-03_Ex3: Replace Hardware per Lifecycle Policy

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** MA-06 (Timely Maintenance), SA-22 (Unsupported System Components), MP-06 (Media Sanitization)

## Implementation Example

> Replace hardware components according to an established lifecycle policy that accounts for vendor support timelines, operational reliability, and secure disposal of retired equipment.

## Alma Security Implementation

Alma Security follows a defined lifecycle replacement policy for employee endpoints: laptops are replaced on a 4-year cycle managed through ServiceNow asset workflows. When a laptop reaches its 4-year anniversary, the IT helpdesk initiates a replacement ticket, procures the replacement device, migrates the user, and processes the retired device for secure disposal. Approximately 75 laptop replacements occur annually across the 300-person organization. The process is well-established for endpoints and runs smoothly with minimal disruption.

For server and infrastructure hardware, replacement decisions are made on a case-by-case basis rather than through a standardized lifecycle policy. On-premises hardware replacement is driven primarily by hardware failures or capacity needs rather than proactive lifecycle planning. The organization's cloud-first strategy means new infrastructure is provisioned in AWS rather than on-premises, which reduces the physical hardware replacement burden. However, the remaining on-premises systems (Windows DC, legacy fileserver, network equipment) lack a formal replacement roadmap beyond the Windows 2012 R2 migration planned for Q3 2026.

Secure disposal of retired hardware follows NIST SP 800-88 guidelines for media sanitization. Retired laptops undergo disk wiping using a certified erasure tool, and certificates of destruction are retained in the CMDB. Physical destruction of storage media is used for devices that cannot be reliably wiped. However, the disposal process documentation has not been updated since 2024, and there is no periodic audit of the disposal vendor's practices.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Laptop replacement lifecycle policy (4-year cycle) | IT operations policy / Confluence | 2026-02-15 |
| ServiceNow laptop replacement workflow | ServiceNow | 2026-03-12 |
| Hardware disposal and media sanitization procedure | IT operations Confluence | 2024-06-15 |
| Certificates of destruction for retired hardware (sample) | IT operations file share | 2026-02-28 |
| Windows 2012 R2 replacement project plan | Jira project board | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No standardized lifecycle replacement policy for server and infrastructure hardware | Medium --- reactive replacement increases unplanned downtime risk | Develop infrastructure hardware lifecycle policy with replacement triggers | Tigan Wang | Q3 2026 |
| Disposal procedure documentation not updated since 2024 | Low --- process may not reflect current practices or vendor changes | Review and update hardware disposal procedures; audit disposal vendor | Chris Magann | Q2 2026 |
| No formal replacement roadmap for on-premises infrastructure beyond Win 2012 R2 migration | Medium --- remaining on-premises systems lack lifecycle planning | Create comprehensive on-premises infrastructure replacement or cloud migration roadmap | Tigan Wang | Q3 2026 |
