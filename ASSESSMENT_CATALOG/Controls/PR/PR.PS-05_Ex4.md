# PR.PS-05_Ex4: Maintain an Authorized Software List

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), CM-08 (System Component Inventory)

## Implementation Example

> Develop and maintain an authoritative list of software approved for use within the organization, including version requirements where applicable, and keep it current with regular reviews.

## Alma Security Implementation

Alma Security maintains an approved software catalog in the ServiceNow application catalog, which serves as the authoritative list of software approved for use across the organization. The catalog includes standard business applications (Microsoft 365, Slack, Zoom, Salesforce), security tools (SentinelOne, Okta), development tools (JetBrains IDEs, VS Code, Docker Desktop), and IT operations tools. Each entry includes the application name, approved version range, business justification, data classification, security review status, and the responsible department.

The ServiceNow self-service portal allows employees to request software from the approved catalog through a streamlined workflow. Software not in the catalog triggers the full procurement and security review process before approval and addition to the catalog. The IT security team reviews the catalog semi-annually to remove software that is no longer in use, verify that approved versions remain current, and confirm that vendor security assessments are still valid.

The approved software list has coverage gaps that limit its effectiveness as an enforcement mechanism. The catalog primarily covers commercial software and major development tools but does not comprehensively cover open-source command-line tools, browser extensions, or developer libraries and frameworks. There is no mechanism to automatically synchronize the approved software list with SentinelOne's application control allowlist, requiring manual updates when the catalog changes. The semi-annual review cadence means the catalog can be out of date with respect to newly adopted or deprecated tools.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| ServiceNow approved software catalog | ServiceNow application catalog | 2026-03-12 |
| Software request workflow for non-catalog items | ServiceNow workflow | 2026-03-12 |
| Semi-annual catalog review records | IT operations Confluence | 2026-01-30 |
| Security review records for catalog entries | ServiceNow / Confluence | 2026-03-10 |
| SentinelOne allowlist (compared against catalog) | SentinelOne Console | 2026-03-14 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Approved list does not cover open-source tools, browser extensions, or developer libraries | Medium --- large category of software in use without formal approval | Extend catalog to cover common developer toolchains and browser extension categories | Chris Magann | Q3 2026 |
| No automated sync between ServiceNow catalog and SentinelOne allowlist | Medium --- manual updates create lag between approval decisions and enforcement | Implement integration between ServiceNow catalog and SentinelOne application control | Chris Magann | Q3 2026 |
| Semi-annual review cadence insufficient for rapidly changing tool landscape | Low --- catalog accuracy degrades between reviews | Increase catalog review cadence to quarterly and add trigger-based reviews for major changes | Chris Magann | Q2 2026 |
