# PR.PS-02_Ex5: Enforce Approved-Only Software in Procurement

**Subcategory:** PR.PS-02 --- Software is maintained, replaced, and removed commensurate with risk

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), SA-04 (Acquisition Process)

## Implementation Example

> Enforce the use of only approved and vetted software through procurement policies that require security assessment, license validation, and business justification before acquisition.

## Alma Security Implementation

Alma Security's software procurement process requires all new software purchases and subscriptions to go through a request workflow in ServiceNow. The workflow requires a business justification from the requesting department, approval from the department manager, and a security review by the IT security team for any software that will process, store, or transmit company or customer data. The security review evaluates the vendor's security posture using a standardized questionnaire covering data handling practices, SOC 2 certification status, encryption standards, and incident response capabilities.

The IT team maintains an approved software catalog in ServiceNow that lists pre-vetted applications. Software on the approved list can be provisioned through a streamlined self-service workflow without requiring a full security review each time. Software not on the approved list triggers the full review process, which has a target turnaround of 5 business days for standard requests and 2 business days for urgent business needs. The approved software catalog is reviewed semi-annually to remove software no longer in use and re-evaluate vendor security posture for existing entries.

However, enforcement has gaps. The procurement process primarily covers paid software subscriptions tracked through finance. Free and open-source tools used by developers are not consistently routed through the procurement workflow, as they do not generate purchase orders. SaaS application sprawl is a known challenge, with an estimated 15-20% of SaaS tools in use not having been through the formal procurement and security review process.

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
