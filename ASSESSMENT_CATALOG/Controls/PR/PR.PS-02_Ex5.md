# PR.PS-02_Ex5: Enforce Approved-Only Software in Procurement

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), SA-04 (Acquisition Process)

## Implementation Example

> Enforce the use of only approved and vetted software through procurement policies that require security assessment, license validation, and business justification before acquisition.

## Alma Security Implementation

Alma requires new software purchases to go through a ServiceNow workflow with business justification, manager approval, and security review (vendor questionnaire covering SOC 2, encryption, data handling). An approved software catalog in ServiceNow enables self-service provisioning for pre-vetted applications, reviewed semi-annually. Free/open-source developer tools bypass the procurement workflow, and an estimated 15-20% of SaaS tools in use have not been through the formal security review process.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Software procurement policy | Confluence policy repository | 2026-02-15 |
| ServiceNow software request workflow | ServiceNow workflow configuration | 2026-03-12 |
| Approved software catalog | ServiceNow application catalog | 2026-03-12 |
| Vendor security review questionnaire template | Confluence security team space | 2026-01-30 |
| Sample completed security reviews (5 recent procurements) | ServiceNow tickets | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Free/open-source developer tools bypass procurement workflow | Medium --- unvetted software in the environment without security review | Extend procurement policy to cover all software regardless of cost; implement SaaS discovery tool | Chris Magann | Q3 2026 |
| Estimated 15-20% of SaaS tools not through formal review | Medium --- unassessed vendor risk and potential data exposure | Conduct SaaS audit using cloud access security broker (CASB) or SaaS management platform | Chris Magann | Q2 2026 |
