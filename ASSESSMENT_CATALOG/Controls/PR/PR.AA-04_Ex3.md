# PR.AA-04 Ex3: Federation Trust and Cross-Domain Assertion Verification

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-8, IA-8(1), IA-8(2), IA-9

## Implementation Example

> Establishing and managing trust relationships for federated identity assertions across organizational boundaries and cloud environments, ensuring relying parties verify assertions before granting access

## Alma Security Implementation

Alma Security maintains federated identity trust relationships across on-premises Active Directory, the Windows Authenticator SSO platform, AWS (4 accounts via SAML), and approximately 35 SaaS applications, each configured with explicit trust anchors and scoped audience restrictions. AWS federation uses IAM SAML identity provider trust with conditions restricting audience, issuer, and attribute values, and cross-account access uses role assumption with external ID conditions to prevent confused deputy attacks. SaaS federation trust relationships are tracked in a federation inventory documenting assertion attributes and certificate rotation dates. The security team manages certificate lifecycle for all federation trusts, with annual signing certificate rotation at the SSO platform.

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
