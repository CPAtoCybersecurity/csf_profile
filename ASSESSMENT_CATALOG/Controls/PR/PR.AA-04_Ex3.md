# PR.AA-04 Ex3: Federation Trust and Cross-Domain Assertion Verification

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-8, IA-8(1), IA-8(2), IA-9

## Implementation Example

> Establishing and managing trust relationships for federated identity assertions across organizational boundaries and cloud environments, ensuring relying parties verify assertions before granting access

## Alma Security Implementation

Alma Security maintains federated identity trust relationships across three primary domains: the on-premises Active Directory federation with the Windows Authenticator SSO, the SSO-to-AWS SAML federation for cloud management console access, and the SSO-to-SaaS federation for approximately 35 integrated cloud applications. Each federation trust is configured with explicit trust anchors (certificates or metadata URLs) and scoped audience restrictions that limit where assertions are accepted.

The AWS federation is configured through an IAM SAML identity provider that trusts the SSO platform's signing certificate. IAM roles for federated access use trust policies with conditions restricting the SAML audience, issuer, and allowed attribute values. Cross-account access in the multi-account AWS architecture uses IAM role assumption with external ID conditions to prevent confused deputy attacks. The Cloud Platform team manages 4 AWS accounts (production, staging, development, and shared services) with role-based federation policies that grant different permission sets based on SAML attribute assertions from the SSO.

For SaaS application federation, each relying party is configured with the SSO platform's metadata document and signing certificate. The security team maintains a federation inventory spreadsheet documenting each trust relationship, the assertion attributes exchanged, and the last certificate rotation date. During the Q1 2026 assessment, the review identified 2 SaaS applications where the federation metadata had not been refreshed after the January 2026 certificate rotation, though both applications continued to function because the old certificate had not yet expired. Gerry flagged the need for an automated certificate lifecycle notification system to prevent future gaps in federation trust maintenance.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS IAM SAML identity provider configuration | AWS IAM > Identity Providers | 2026-03-01 |
| AWS cross-account trust policies with external IDs | AWS IAM > Roles > Trust Policies | 2026-02-15 |
| SSO federation inventory spreadsheet | Security Team > SharePoint > Federation Inventory | 2026-03-10 |
| SaaS federation metadata refresh audit | Security Team > Quarterly Review | 2026-03-10 |
| Multi-account architecture diagram | Cloud Platform > Architecture Docs | 2026-01-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 2 SaaS applications with stale federation metadata after certificate rotation | Federation may break when old certificate expires, causing access outage; or stale metadata could be exploited | Implement automated metadata refresh notifications tied to certificate lifecycle events | Tigan Wang | 2026-05-31 |
| Federation inventory maintained in spreadsheet, not centralized tool | Manual tracking prone to errors; no automated alerting for certificate expiration or metadata drift | Migrate federation inventory to ServiceNow CMDB with automated certificate expiration monitoring | Chris Magann | 2026-07-31 |
| No assertion verification testing at relying parties | Cannot confirm that all 35 integrated applications properly validate assertion signatures and expiration | Conduct annual assertion verification testing: submit invalid/expired assertions to each relying party and verify rejection | Nadia Khan | 2026-08-31 |
