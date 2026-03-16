# PR.PS-03_Ex3: Replace Hardware per Lifecycle Policy

**Subcategory:** PR.PS-03 --- Hardware is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** MA-06 (Timely Maintenance), SA-22 (Unsupported System Components), MP-06 (Media Sanitization)

## Implementation Example

> Replace hardware components according to an established lifecycle policy that accounts for vendor support timelines, operational reliability, and secure disposal of retired equipment.

## Alma Security Implementation

Alma replaces employee laptops on a 4-year cycle managed through ServiceNow workflows (~75 replacements/year), with secure disposal following NIST SP 800-88 guidelines and certificates of destruction retained in the CMDB. Server and infrastructure hardware is replaced reactively rather than through a standardized lifecycle policy. Disposal documentation has not been updated since 2024, and on-premises systems beyond the Windows 2012 R2 fileserver lack a formal replacement roadmap.

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
