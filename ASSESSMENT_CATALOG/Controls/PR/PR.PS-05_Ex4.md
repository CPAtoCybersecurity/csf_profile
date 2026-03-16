# PR.PS-05_Ex4: Maintain an Authorized Software List

**Subcategory:** PR.PS-05 --- Installation and execution of unauthorized software is prevented

**NIST SP 800-53 Ref:** CM-07 (Least Functionality), CM-11 (User-Installed Software), CM-08 (System Component Inventory)

## Implementation Example

> Develop and maintain an authoritative list of software approved for use within the organization, including version requirements where applicable, and keep it current with regular reviews.

## Alma Security Implementation

Alma maintains an approved software catalog in ServiceNow covering business, security, and development tools, with self-service provisioning for listed applications and full security review required for unlisted software. The catalog is reviewed semi-annually to verify currency and vendor security posture. Coverage gaps exist for open-source CLI tools, browser extensions, and developer libraries; no automated sync exists between the catalog and SentinelOne's allowlist.

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
