# PR.AA-02 Ex2: Credential Uniqueness and Individual Accountability

**Subcategory:** PR.AA-02 — Identities are proofed and bound to credentials based on the context of interactions

**NIST SP 800-53 Ref:** IA-4, IA-5, IA-8, AC-2

## Implementation Example

> Ensuring that each authenticated individual or service has unique credentials that are not shared, maintaining individual accountability for all actions performed

## Alma Security Implementation

Alma Security enforces credential uniqueness through policy and technical controls. The Information Security Policy explicitly prohibits shared accounts for human users, and the Windows Authenticator SSO configuration enforces one-to-one identity-to-credential binding for all enterprise applications. Each employee and contractor receives a unique Active Directory account on the on-premises Windows Domain Controller with an individually assigned UPN (User Principal Name) that serves as the primary identifier across integrated systems. Privileged access follows a separate credential model where administrators maintain distinct accounts for standard and elevated operations.

The IAM team conducts quarterly privileged access reviews through ServiceNow, verifying that each privileged account maps to a single identified individual with documented business justification. The Q1 2026 review identified 3 privileged accounts requiring justification updates and 1 account flagged for deprovisioning after a role change. The MFA Rollout project ($80K) supports credential binding strengthening by requiring individually enrolled hardware tokens or authenticator app instances tied to each user's identity, aligning with the Apple Passkey partnership (G8) roadmap.

The shared developer SSH key on port 45001 is the most significant exception to the credential uniqueness standard. This key is used by approximately 8 developers for production database access, eliminating individual accountability for actions performed over that connection. The security team has documented this in the risk register and assigned Chris Magann as remediation owner. The planned migration to individual SSH certificates issued through HashiCorp Vault is targeted for Q3 2026 and will restore per-user attribution for all production access.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Information Security Policy (no shared accounts) | SharePoint > Policies > InfoSec | 2026-01-15 |
| SSO unique credential configuration | Windows Authenticator Admin Console | 2026-02-01 |
| Quarterly privileged access review results | ServiceNow > Access Reviews > Q1 2026 | 2026-02-28 |
| Shared SSH key risk register entry | Risk Register > R-SSH-001 | 2026-02-01 |
| MFA Rollout project status report | PMO > Active Projects | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Shared developer SSH key on port 45001 used by ~8 developers | Cannot attribute production database actions to individual users; violates accountability principle | Migrate to individual SSH certificates via HashiCorp Vault; decommission shared key | Chris Magann | 2026-09-30 |
| No automated detection of credential sharing | Shared credential use could occur without detection if policy is circumvented | Implement monitoring for concurrent session anomalies and credential sharing indicators in SentinelOne | Nadia Khan | 2026-07-31 |
| Contractor credential lifecycle not tied to contract expiration | Contractor credentials may persist beyond contract end date | Automate contractor account expiration based on contract end date in Workday | Tigan Wang | 2026-06-30 |
